import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProposalById } from "@/api/proposal";
import Navbar from "@/components/Navbars/Navbar";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  MessageCircle,
  User,
  Calendar,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Send,
  ThumbsUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getProposalComments, postProposalComment } from "@/api/comment";
import ChatInterface from "@/components/InvestorFounderChat";
import useAuth from "@/hooks/useAuth";

interface Proposal {
  id: number;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  investorContribution: number;
  status: string;
  createdAt: string;
  founder: {
    name?: string;
    email: string;
    id: number;
  };
}

export default function InvestorProposalDetail() {
  const { id } = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: {
        name: "Alex Thompson",
        role: "Angel Investor",
        avatar: "/avatars/alex.jpg",
      },
      content:
        "I'm impressed with the traction this startup has shown in the last quarter. Could you share more details about your customer acquisition strategy?",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      likes: 3,
    },
    {
      id: 2,
      author: {
        name: "Sarah Miller",
        role: "Venture Capitalist",
        avatar: "/avatars/sarah.jpg",
      },
      content:
        "The market analysis looks promising, but I'd like to see more information about how you plan to handle the competitive landscape in the next 18 months.",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      likes: 1,
    },
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const data = await getProposalById(id as string);
        setProposal(data);
      } catch (err) {
        console.error("Failed to fetch proposal:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const data = await getProposalComments(id as string);
        const formatted = data.map(
          (c): UIComment => ({
            id: c.id,
            author: {
              name: c.user.name,
              role: c.user.role,
              avatar: "/avatars/default.jpg", // fallback
            },
            content: c.content,
            timestamp: c.createdAt,
            likes: 0,
          })
        );
        setComments(formatted);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };

    if (id) {
      fetchProposal();
      fetchComments();
    }
  }, [id]);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      try {
        const data = await getProposalById(id);
        setProposal(data);
      } catch (err) {
        console.error("Failed to fetch proposal:", err);
      }
    };

    if (id) fetchProposal();
  }, [id]);

  interface UIComment {
    id: number;
    author: {
      name: string;
      role: string;
      avatar: string;
    };
    content: string;
    timestamp: string;
    likes: number;
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const created = await postProposalComment(id as string, newComment);

      const formatted: UIComment = {
        id: created.id,
        author: {
          name: created.user.name,
          role: created.user.role,
          avatar: "/avatars/you.jpg",
        },
        content: created.content,
        timestamp: created.createdAt,
        likes: 0,
      };

      setComments((prev) => [...prev, formatted]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleLikeComment = (commentId: number) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-200 mb-4"></div>
          <div className="text-indigo-600 font-medium">
            Loading proposal details...
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Proposal Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                The proposal you're looking for doesn't exist or may have been
                removed.
              </p>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    title,
    description,
    fundingGoal,
    currentFunding,
    investorContribution,
    status,
    createdAt,
    founder,
  } = proposal;

  const fundingProgress = (currentFunding / fundingGoal) * 100;

  type ProposalStatus =
    | "DRAFT"
    | "PENDING"
    | "ACTIVE"
    | "FUNDED"
    | "CLOSED"
    | string;

  const getStatusColor = (status: ProposalStatus): string => {
    const statusMap: Record<string, string> = {
      draft: "bg-gray-200 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      funded: "bg-blue-100 text-blue-800",
      closed: "bg-red-100 text-red-800",
    };

    return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getChatRecipient = () => {
    if (!proposal || !user) return null;

    // Assume the founder is the receiver if user is not the founder
    if (user.id !== proposal.founder?.id) {
      return {
        id: proposal.founder?.id,
        name: proposal.founder?.name || "Unknown",
        avatar: "/avatars/default.jpg",
      };
    }
    return null; // Don't allow chat if user is the founder
  };

  const recipient = getChatRecipient();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Main proposal info */}
          <div className="flex-1">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {title}
                    </h1>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      <div className="mx-2">•</div>
                      <Badge className={`${getStatusColor(status)}`}>
                        {status?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg">
                    <DollarSign className="mr-2 h-4 w-4" /> Invest Now
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <div className="text-lg font-semibold text-gray-800">
                      ${(currentFunding as number)?.toLocaleString()}{" "}
                      <span className="text-sm text-gray-500">
                        raised of ${(fundingGoal as number)?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-indigo-600">
                      {fundingProgress.toFixed(0)}%
                    </div>
                  </div>
                  <Progress value={fundingProgress} className="h-2" />

                  {investorContribution > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-md flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <div className="text-green-700 font-medium">
                        Your investment: $
                        {(investorContribution as number).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="founder">Founder</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="prose max-w-none text-gray-700">
                      <p>{description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="founder">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 p-3 rounded-full">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {founder?.name || "Anonymous"}
                          </h4>
                          <p className="text-gray-600 mb-2">{founder?.email}</p>
                          <p className="text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 inline mr-1" />
                            CEO & Founder
                          </p>
                          <Button variant="outline" size="sm" className="mt-3">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments">
                    <div className="space-y-6">
                      {/* New comment form */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-md font-medium text-gray-700 mb-3">
                          Add a comment
                        </h4>
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage
                              src="/avatars/you.jpg"
                              alt="Your avatar"
                            />
                            <AvatarFallback>YO</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <Textarea
                              placeholder="Share your thoughts or ask a question..."
                              className="min-h-24 resize-none"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim()}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Post Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comment list */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-md font-medium text-gray-700 mb-4">
                          Comments ({comments.length})
                        </h4>

                        {comments.length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            <p>No comments yet. Be the first to comment!</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {comments.map((comment, index) => (
                              <div key={comment.id}>
                                {index > 0 && <Separator className="my-4" />}
                                <div className="flex gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={comment.author.avatar}
                                      alt={comment.author.name}
                                    />
                                    <AvatarFallback>
                                      {comment.author.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <div>
                                        <h5 className="font-medium text-gray-800">
                                          {comment.author.name}
                                        </h5>
                                        <p className="text-xs text-gray-500">
                                          {comment.author.role} •{" "}
                                          {formatDate(comment.timestamp)}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="mt-2 text-gray-700">
                                      {comment.content}
                                    </p>
                                    <div className="mt-2 flex items-center">
                                      <button
                                        className="flex items-center text-xs text-gray-500 hover:text-indigo-600"
                                        onClick={() =>
                                          handleLikeComment(comment.id)
                                        }
                                      >
                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                        {comment.likes > 0
                                          ? comment.likes
                                          : "Like"}
                                      </button>
                                      <button className="ml-4 text-xs text-gray-500 hover:text-indigo-600">
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="updates">
                    <div className="text-center py-6 text-gray-500">
                      <p>No updates available yet</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Actions and communication */}
          <div className="w-full md:w-80">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Investment Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Invest Now
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat with Founder
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">
                      Minimum Investment
                    </div>
                    <div className="font-medium">$5,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Equity Offered</div>
                    <div className="font-medium">5%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      Funding Deadline
                    </div>
                    <div className="font-medium">June 30, 2025</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Investors</div>
                    <div className="font-medium">12</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {recipient && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg"
            onClick={() => setIsChatOpen(true)}
          >
            Chat with {recipient.name}
          </Button>

          {user && recipient && token && id && (
            <ChatInterface
              proposalId={parseInt(id)}
              receiverId={recipient.id}
              currentUser={{
                id: user.id,
                name: user.name ?? "You",
                avatar: "/avatars/you.jpg",
              }}
              receiver={recipient}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              token={token}
            />
          )}
        </div>
      )}
    </div>
  );
}
