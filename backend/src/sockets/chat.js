const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const setupChat = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.warn("Socket auth failed: No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.warn("Socket auth failed: Invalid token");
        return next(new Error("Authentication error: Invalid token"));
      }
      socket.user = decoded;
      console.log(
        `✅ User authenticated - ID: ${socket.user.id}, Role: ${socket.user.role}`
      );
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(
      `🔗 Socket connected: ${socket.id} (User ID: ${socket.user.id})`
    );

    socket.on("joinProposal", (proposalId) => {
      socket.join(`proposal:${proposalId}`);
      console.log(
        `📥 User ${socket.user.id} joined room proposal:${proposalId}`
      );
    });

    socket.on("sendMessage", async ({ proposalId, content, receiverId }) => {
      console.log(
        `✉️ Message attempt - From: ${socket.user.id}, To: ${receiverId}, Proposal: ${proposalId}`
      );
      try {
        if (!proposalId || !content || !receiverId) {
          console.warn("❌ sendMessage failed: Missing required fields");
          return socket.emit("error", { message: "Missing required fields" });
        }

        const message = await prisma.message.create({
          data: {
            senderId: socket.user.id,
            receiverId: parseInt(receiverId),
            proposalId: parseInt(proposalId),
            content,
          },
        });

        console.log(
          `✅ Message sent (ID: ${message.id}) for proposal:${proposalId}`
        );
        io.to(`proposal:${proposalId}`).emit("newMessage", message);
      } catch (error) {
        console.error("❌ Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", ({ proposalId }) => {
      console.log(
        `🖊️ Typing - User ${socket.user.id} is typing in proposal:${proposalId}`
      );
      if (!proposalId) return;
      socket
        .to(`proposal:${proposalId}`)
        .emit("typing", { userId: socket.user.id });
    });

    socket.on("messageRead", async ({ messageId, proposalId }) => {
      console.log(
        `📖 Read message - User ${socket.user.id} read message ${messageId} in proposal:${proposalId}`
      );
      try {
        if (!messageId || !proposalId) {
          console.warn(
            "❌ messageRead failed: Missing messageId or proposalId"
          );
          return socket.emit("error", {
            message: "Missing messageId or proposalId",
          });
        }

        const message = await prisma.message.update({
          where: { id: parseInt(messageId) },
          data: { read: true },
        });

        console.log(`✅ Message ${message.id} marked as read`);
        io.to(`proposal:${proposalId}`).emit("messageRead", {
          messageId: message.id,
        });
      } catch (error) {
        console.error("❌ Read message error:", error);
        socket.emit("error", { message: "Failed to mark message as read" });
      }
    });

    socket.on("disconnect", () => {
      console.log(
        `❌ User ${socket.user.id} disconnected - Socket ID: ${socket.id}`
      );
    });
  });
};

module.exports = setupChat;
