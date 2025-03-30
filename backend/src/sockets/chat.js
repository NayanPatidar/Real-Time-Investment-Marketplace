const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const setupChat = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
      socket.user = decoded; 
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.id} connected: ${socket.id}`);

    socket.on("joinProposal", (proposalId) => {
      socket.join(`proposal:${proposalId}`);
      console.log(`User ${socket.user.id} joined proposal:${proposalId}`);
    });

    socket.on("sendMessage", async ({ proposalId, content, receiverId }) => {
      try {
        if (!proposalId || !content || !receiverId) {
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

        io.to(`proposal:${proposalId}`).emit("newMessage", message);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", ({ proposalId }) => {
      if (!proposalId) return;
      socket
        .to(`proposal:${proposalId}`)
        .emit("typing", { userId: socket.user.id });
    });

    socket.on("messageRead", async ({ messageId, proposalId }) => {
      try {
        if (!messageId || !proposalId) {
          return socket.emit("error", {
            message: "Missing messageId or proposalId",
          });
        }

        const message = await prisma.message.update({
          where: { id: parseInt(messageId) },
          data: { read: true },
        });

        io.to(`proposal:${proposalId}`).emit("messageRead", {
          messageId: message.id,
        });
      } catch (error) {
        console.error("Read message error:", error);
        socket.emit("error", { message: "Failed to mark message as read" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user.id} disconnected: ${socket.id}`);
    });

  });
};

module.exports = setupChat;
