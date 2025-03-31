import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import {
  joinProposalChat,
  sendMessage,
  notifyTyping,
  markMessageAsRead,
  getMessages,
} from "../api/chatService";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/SocketRef";

interface TypingPayload {
  userId: number;
  receiverId: number;
}

interface MessageReadPayload {
  messageId: number;
  receiverId: number;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  proposalId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatInterfaceProps {
  proposalId: number;
  receiverId: number;
  currentUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: number;
    name: string;
    avatar?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  token: string; // JWT token for authentication
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  proposalId,
  receiverId,
  currentUser,
  receiver,
  isOpen,
  onClose,
  token,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (isOpen && token && socket) {
      joinProposalChat(proposalId, receiverId);
      loadMessages();
      setupSocketListeners();
    }

    return () => {
      if (socket) {
        socket.off("newMessage");
        socket.off("typing");
        socket.off("messageRead");
      }
    };
  }, [isOpen, token, proposalId, receiverId, socketRef]);

  const loadMessages = async () => {
    try {
      const messageData = await getMessages(proposalId, receiverId);
      setMessages(messageData);

      // Mark unread messages as read
      messageData.forEach((message: Message) => {
        if (message.receiverId === currentUser.id && !message.read) {
          markMessageAsRead({
            messageId: message.id,
            proposalId,
            receiverId,
          });
        }
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    // Incoming message
    socketRef.current.on("newMessage", (message: Message) => {
      console.log(message);

      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m.id === message.id);
        if (alreadyExists) return prev;
        return [...prev, message];
      });

      if (message.receiverId === currentUser.id) {
        markMessageAsRead({
          messageId: message.id,
          proposalId,
          receiverId,
        });
      }
    });

    // Typing event
    socketRef.current.on(
      "typing",
      ({ userId, receiverId: targetId }: TypingPayload) => {
        console.log(`User ${userId} is typing...`);
        console.log(userId, targetId, currentUser.id);

        if (userId !== currentUser.id && targetId === currentUser.id) {
          setIsTyping(true);
          setTypingUser(userId);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        }
      }
    );

    // Read receipts
    socketRef.current.on("messageRead", ({ messageId }: MessageReadPayload) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
      );
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Send message via socket
    sendMessage({
      proposalId,
      content: newMessage,
      receiverId,
    });

    // Clear input field
    setTimeout(scrollToBottom, 100);
    setNewMessage("");
  };

  const handleTyping = () => {
    notifyTyping(proposalId, receiverId);
  };

  // Auto-scroll to bottom of messages

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]); // Add isTyping to trigger scroll when typing indicator appears

  // Create a dedicated scroll function for reuse
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 bg-white/95 backdrop-blur-sm max-h-[65vh] flex flex-col rounded-xl shadow-2xl border">
        <DialogHeader className="p-4 border-b bg-white/50 backdrop-blur-sm">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm flex justify-center items-center">
              <AvatarImage src={receiver.avatar} alt={receiver.name} />
              <AvatarFallback>{receiver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">{receiver.name}</span>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Chat messages container */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px] max-h-[60vh] bg-gradient-to-b from-gray-50 to-white"
          // onScroll={(e) => {
          //   // Optional: Track when user manually scrolls up to temporarily disable auto-scroll
          //   const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          //   const isScrolledToBottom =
          //     scrollHeight - scrollTop - clientHeight < 30;
          //   // You could set a state variable here if you want to implement a "new messages" button
          // }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.senderId === currentUser.id
                  ? "justify-end"
                  : "justify-start"
              )}
            >
              <div className="flex gap-2 max-w-[85%] group">
                {message.senderId !== currentUser.id && (
                  <Avatar className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AvatarImage src={receiver.avatar} alt={receiver.name} />
                    <AvatarFallback>{receiver?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div
                    className={cn(
                      "p-3 rounded-2xl break-words",
                      message.senderId === currentUser.id
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    )}
                  >
                    {message.content}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 px-1">
                    {formatTime(message.timestamp)}
                    {message.senderId === currentUser.id && message.read && (
                      <span className="text-blue-500">✓✓</span>
                    )}
                  </div>
                </div>
                {message.senderId === currentUser.id && (
                  <Avatar className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AvatarImage src={currentUser.avatar} alt="You" />
                    <AvatarFallback>
                      {currentUser?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 text-sm pl-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-xs font-medium">
                {receiver.name} is typing...
              </span>
            </div>
          )}

          {/* This empty div is our scroll target */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input area */}
        <DialogFooter className="flex-shrink-0 border-t p-4 bg-white/50 backdrop-blur-sm">
          <div className="flex w-full items-end gap-2">
            <Textarea
              className="flex-1 min-h-10 max-h-32 w-82 resize-none rounded-xl border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Type your message..."
              value={newMessage}
              rows={1}
              onChange={(e) => {
                setNewMessage(e.target.value);

                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex gap-1">
              <Button
                size="icon"
                className="rounded-full h-9 w-9 bg-indigo-600 hover:bg-indigo-700 transition-colors"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInterface;
