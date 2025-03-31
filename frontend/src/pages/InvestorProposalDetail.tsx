import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProposalById, investInProposal } from "@/api/proposal";
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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getProposalComments } from "@/api/comment";
import ChatInterface from "@/components/InvestorFounderChat";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { createRazorpayOrder } from "@/api/payment";
import { loadRazorpayScript } from "@/utils/razorpay";
import FounderCommentsSection from "@/components/CommentsSection";

interface Investor {
  id: number;
  name: string;
  email: string;
}

interface AcceptedInvestor {
  id: number;
  proposalId: number;
  investorId: number;
  contribution: number;
  createdAt: string;
  investor: Investor;
}

interface Founder {
  id: number;
  name: string;
  email: string;
}

interface Investor {
  id: number;
  name: string;
  email: string;
}

interface AcceptedInvestor {
  id: number;
  proposalId: number;
  investorId: number;
  contribution: number;
  createdAt: string;
  investor: Investor;
}

interface Founder {
  id: number;
  name: string;
  email: string;
}

interface Contributions {
  yourContribution: number;
  othersContribution: number;
  totalContribution: number;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  status: "UNDER_REVIEW" | "NEGOTIATING" | "FUNDED";
  createdAt: string;
  founder: Founder;
  acceptedInvestors: AcceptedInvestor[];
  contributions: Contributions;
}

export default function InvestorProposalDetail() {
  const { id } = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  // const [newComment, setNewComment] = useState("");
  const [_, setComments] = useState([
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [refetch, setRefetch] = useState(false);

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
            timestamp: c.timestamp,
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
  }, [id, refetch]);

  const handleInvest = async (razorpayResponse: any) => {
    if (!selectedProposal) return;

    try {
      const payload = {
        proposalId: selectedProposal.id,
        amount: parseFloat(investmentAmount),
        paymentId: razorpayResponse?.razorpay_payment_id, // Include Razorpay payment ID
      };

      await investInProposal(payload);

      // setProposals(updatedProposals);
      setInvestmentAmount("");
      setIsModalOpen(false);
      setRefetch((prev) => !prev);

      toast.success(
        `Investment of $${investmentAmount} successful! Transaction ID: ${razorpayResponse?.razorpay_payment_id}`,
        {
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
          icon: <DollarSign size={24} color="#4ade80" />,
        }
      );
    } catch (error) {
      console.error("Failed to make investment:", error);
      alert("Something went wrong with your investment. Please try again.");
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Are you online?");
        return;
      }

      // Check if Razorpay is available in the global scope
      if (!(window as any).Razorpay) {
        console.error("Razorpay not found in window object");
        alert("Payment system not available. Please try again later.");
        return;
      }

      const orderData = await createRazorpayOrder(
        parseInt(investmentAmount) * 100
      );

      const options = {
        key: "rzp_test_PvloIqjs8bEFo3",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "IMS",
        description: "Payment for investment",
        order_id: orderData.id,
        handler: async function (response: any) {
          toast.success(
            `Payment successful! Transaction ID: ${response.razorpay_payment_id}`
          );
          await handleInvest(response);
        },
        prefill: {
          name: "Investor Name",
          email: "investor@example.com",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment process was cancelled.");
          },
        },
      };

      console.log("About to initialize Razorpay with options:", options);
      const rzp = new (window as any).Razorpay(options);
      console.log("Razorpay instance created:", rzp);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

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

  const openInvestModal = (proposal: Proposal) => {
    console.log("Opening invest modal for proposal:", proposal);

    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  // const handleSubmitComment = async () => {
  //   if (!newComment.trim()) return;

  //   try {
  //     const created = await postProposalComment(id as string, newComment);

  //     const formatted: UIComment = {
  //       id: created.id,
  //       author: {
  //         name: created.user.name,
  //         role: created.user.role,
  //         avatar: "/avatars/you.jpg",
  //       },
  //       content: created.content,
  //       timestamp: created.timestamp,
  //       likes: 0,
  //     };

  //     setComments((prev) => [...prev, formatted]);
  //     setNewComment("");
  //   } catch (err) {
  //     console.error("Failed to post comment:", err);
  //   }
  // };

  // const handleLikeComment = (commentId: number) => {
  //   setComments((prev) =>
  //     prev.map((comment) =>
  //       comment.id === commentId
  //         ? { ...comment, likes: comment.likes + 1 }
  //         : comment
  //     )
  //   );
  // };

  // const formatDate = (dateString: string): string => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffInHours = Math.floor(
  //     (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  //   );

  //   if (diffInHours < 1) return "Just now";
  //   if (diffInHours < 24) return `${diffInHours}h ago`;
  //   if (diffInHours < 48) return "Yesterday";

  //   return date.toLocaleDateString("en-US", {
  //     month: "short",
  //     day: "numeric",
  //   });
  // };

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
    contributions,
    status,
    createdAt,
    founder,
  } = proposal;

  const yourContribution = contributions?.yourContribution ?? 0;

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
  console.log(selectedProposal);

  const investorBars = (() => {
    if (!selectedProposal?.contributions) return [];

    const { yourContribution, othersContribution } =
      selectedProposal.contributions;

    const bars = [];
    let offset = 0;

    if (yourContribution > 0) {
      const widthPercent =
        (yourContribution / selectedProposal.fundingGoal) * 100;
      console.log(
        "Your Contribution:",
        yourContribution,
        "Width %:",
        widthPercent.toFixed(2)
      );
      bars.push(
        <div
          key="you"
          className="absolute h-full top-0"
          style={{
            width: `${widthPercent}%`,
            left: `${offset}%`,
            backgroundColor: "#22c55e", // green
            zIndex: 20,
          }}
        />
      );
      offset += widthPercent;
    }

    if (othersContribution > 0) {
      const widthPercent =
        (othersContribution / selectedProposal.fundingGoal) * 100;
      console.log(
        "Others Contribution:",
        othersContribution,
        "Width %:",
        widthPercent.toFixed(2)
      );
      bars.push(
        <div
          key="others"
          className="absolute h-full top-0"
          style={{
            width: `${widthPercent}%`,
            left: `${offset}%`,
            backgroundColor: "#3b82f6", // blue
            zIndex: 10,
          }}
        />
      );
    }

    return bars;
  })();

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

                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInvestModal(proposal);
                    }}
                  >
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

                  {yourContribution > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-md flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <div className="text-green-700 font-medium">
                        Your investment: $
                        {(yourContribution as number).toLocaleString()}
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
                      <div className="bg-white rounded-lg ">
                        <h4 className="text-md font-medium text-gray-700 mb-4"></h4>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Comments
                          </h2>
                          <FounderCommentsSection proposalId={String(proposal.id)} />
                        </div>
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsChatOpen(true)}
                >
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

      {isModalOpen && selectedProposal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Invest in {selectedProposal.title}
            </h2>
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Current Funding</p>
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">
                  ${selectedProposal?.currentFunding?.toLocaleString()} of $
                  {selectedProposal?.fundingGoal?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(
                    (selectedProposal?.currentFunding /
                      selectedProposal?.fundingGoal) *
                      100
                  )}
                  % funded
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
                  {investorBars}
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRazorpayPayment();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="investmentAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Investment Amount (USD)
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="investmentAmount"
                    required
                    min="10"
                    max={
                      selectedProposal.fundingGoal -
                      selectedProposal.currentFunding
                    }
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 py-2 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0.00"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Minimum investment: $10
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Investment Summary
                  </h4>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Investment Amount</span>
                      <span className="text-right">
                        $
                        {investmentAmount
                          ? parseFloat(investmentAmount).toLocaleString()
                          : "0.00"}
                      </span>
                    </div>
                    <hr className="my-2 border-gray-200" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-right">
                        $
                        {investmentAmount
                          ? (
                              parseFloat(investmentAmount) * 1.0
                            ).toLocaleString()
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Confirm Investment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
