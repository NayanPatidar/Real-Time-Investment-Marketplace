import { io, Socket } from "socket.io-client";
import instance from "./axios";

interface MessagePayload {
  proposalId: number | string;
  content: string;
  receiverId: number;
}

interface ReadMessagePayload {
  messageId: number;
  proposalId: number | string;
  receiverId: number;
}

let socket: Socket | null = null;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const initializeSocket = (token: string): Socket => {
  console.log("Initializing socket with token:", token);
  console.log("API URL:", API_URL);
  if (socket) socket.disconnect();

  socket = io(API_URL || "http://localhost:8080", {
    auth: { token },
  });

  socket.on("error", (error: any) => {
    console.error("Socket error:", error);
  });

  return socket;
};

export const joinProposalChat = (
  proposalId: number | string,
  receiverId: number | string
) => {
  if (!socket || !socket.connected) {
    throw new Error("Socket not connected. Call initializeSocket first.");
  }

  socket.emit("joinProposal", { proposalId, receiverId });
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

export const notifyTyping = (
  proposalId: number | string,
  receiverId: number
) => {
  if (!socket || !socket.connected) return;
  socket.emit("typing", { proposalId, receiverId });
};

export const markMessageAsRead = ({
  messageId,
  proposalId,
  receiverId,
}: ReadMessagePayload) => {
  if (!socket || !socket.connected) return;

  socket.emit("messageRead", { messageId, proposalId, receiverId });
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
  socket = null;
};

export const getMessages = async (
  proposalId: number | string,
  receiverId: number | string
) => {
  try {
    const response = await instance.get(`/proposals/${proposalId}/messages`, {
      params: { receiverId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Get investors for a specific proposal
export const getProposalInvestors = async (id: string | number) => {
  const res = await instance.get(`/proposals/${id}/investors`);
  return res.data;
};

export const getInvestorContributions = async (proposalId: number | string) => {
  const res = await instance.get(
    `/proposals/${proposalId}/investor-contributions`
  );
  return res.data;
};
