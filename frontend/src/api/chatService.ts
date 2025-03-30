import { io, Socket } from "socket.io-client";

interface MessagePayload {
  proposalId: number | string;
  content: string;
  receiverId: number;
}

interface ReadMessagePayload {
  messageId: number;
  proposalId: number | string;
}

let socket: Socket | null = null;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const initializeSocket = (token: string): Socket => {
  console.log("Initializing socket with token:", token);

  if (socket) socket.disconnect();

  socket = io(API_URL || "http://localhost:8080", {
    auth: { token },
  });

  socket.on("error", (error: any) => {
    console.error("Socket error:", error);
  });

  return socket;
};

export const joinProposalChat = (proposalId: number | string) => {
  if (!socket || !socket.connected) {
    throw new Error("Socket not connected. Call initializeSocket first.");
  }

  socket.emit("joinProposal", proposalId);
};

export const sendMessage = ({
  proposalId,
  content,
  receiverId,
}: MessagePayload) => {
  if (!socket || !socket.connected) {
    throw new Error("Socket not connected. Call initializeSocket first.");
  }

  socket.emit("sendMessage", { proposalId, content, receiverId });
};

export const notifyTyping = (proposalId: number | string) => {
  if (!socket || !socket.connected) return;

  socket.emit("typing", { proposalId });
};

export const markMessageAsRead = ({
  messageId,
  proposalId,
}: ReadMessagePayload) => {
  if (!socket || !socket.connected) return;

  socket.emit("messageRead", { messageId, proposalId });
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
  socket = null;
};

export const getMessages = async (proposalId: number | string) => {
  try {
    const response = await fetch(`${API_URL}/api/messages/${proposalId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};
