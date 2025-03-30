const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const prisma = require("./config/prisma");
const authRoutes = require("./routes/auth");
const proposalRoutes = require("./routes/proposals");
const notificationRoutes = require("./routes/notificationRoutes");
const setupChat = require("./sockets/chat");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/notifications", notificationRoutes);

setupChat(io);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT NOW()`;
    res.json({ message: "Database connected" });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
