const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const client = require("../config/redis-config");

const getRoomId = (id1, id2) =>
  [id1, id2]
    .map(Number)
    .sort((a, b) => a - b)
    .join("_");

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
    const userId = socket.user.id;
    socket.join(`user:${userId}`);
    console.log(`🛎️ User ${userId} joined notification room user:${userId}`);

    socket.on("joinProposal", ({ proposalId, receiverId }) => {
      const roomId = `proposal:${proposalId}:chat:${getRoomId(
        socket.user.id,
        receiverId
      )}`;
      socket.join(roomId);
      console.log(`User ${socket.user.id} joined room ${roomId}`);
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

        const roomId = `proposal:${proposalId}:chat:${getRoomId(
          socket.user.id,
          receiverId
        )}`;

        console.log("📨 Emitting to room:", roomId);

        // Save the message
        const message = await prisma.message.create({
          data: {
            senderId: socket.user.id,
            receiverId: parseInt(receiverId),
            proposalId: parseInt(proposalId),
            content,
            chatRoomId: roomId,
          },
        });

        await client.rPush(
          `chat:${roomId}`,
          JSON.stringify({
            ...message,
            timestamp: Date.now(),
          })
        );

        console.log(`✅ Message sent (ID: ${message.id}) to room ${roomId}`);

        io.to(roomId).emit("newMessage", message);

        const proposal = await prisma.proposal.findUnique({
          where: { id: parseInt(proposalId) },
          select: { status: true },
        });

        if (proposal?.status === "UNDER_REVIEW") {
          await prisma.proposal.update({
            where: { id: parseInt(proposalId) },
            data: { status: "NEGOTIATING" },
          });
        }
      } catch (error) {
        console.error("❌ Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", ({ proposalId, receiverId }) => {
      console.log(
        `🖊️ Typing - User ${socket.user.id} is typing to ${receiverId} in proposal:${proposalId}`
      );

      const roomId = `proposal:${proposalId}:chat:${getRoomId(
        socket.user.id,
        receiverId
      )}`;
      socket.to(roomId).emit("typing", { userId: socket.user.id, receiverId });
    });

    socket.on("messageRead", async ({ messageId, proposalId, receiverId }) => {
      console.log(
        `📖 Read message - User ${socket.user.id} read message ${messageId} in proposal:${proposalId}`
      );
      try {
        if (!messageId || !proposalId || !receiverId) {
          console.warn("❌ messageRead failed: Missing fields");
          return socket.emit("error", {
            message: "Missing messageId, proposalId or receiverId",
          });
        }

        const message = await prisma.message.update({
          where: { id: parseInt(messageId) },
          data: { read: true },
        });

        const room = `proposal:${proposalId}:chat:${getRoomId(
          socket.user.id,
          receiverId
        )}`;
        console.log(`✅ Message ${message.id} marked as read`);
        io.to(room).emit("messageRead", {
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
