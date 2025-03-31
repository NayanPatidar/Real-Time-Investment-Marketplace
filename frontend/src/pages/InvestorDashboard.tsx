import React, { JSX, useEffect, useState } from "react";
import {
  Search,
  Filter,
  LogOut,
  TrendingUp,
  DollarSign,
  BarChart2,
  Clock,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/utils/auth";
import { getAllProposals, investInProposal } from "@/api/proposal";
import { loadRazorpayScript } from "@/utils/razorpay";
import useAuth from "@/hooks/useAuth";
import { logoutFunc } from "@/api/auth";
import { createRazorpayOrder } from "@/api/payment";
import { toast } from "sonner";

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

interface AllInvestor {
  id: number;
  name: string;
  email: string;
  contribution: number;
}

interface Founder {
  id: number;
  name: string;
  email: string;
}

export interface Proposal {
  id: number;
  founderId: number;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  status: "UNDER_REVIEW" | "NEGOTIATING" | "FUNDED";
  createdAt: string;
  founder: Founder;
  acceptedInvestors: AcceptedInvestor[];
  investorContribution: number; // contribution by current user
  allInvestors: AllInvestor[]; // contribution by all
}

const COLORS = [
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#a855f7", // Purple
];

function getColorForInvestor(id: number) {
  return COLORS[id % COLORS.length];
}

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    averageReturn: 15.2,
  });

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
    const fetchProposals = async () => {
      try {
        const data = await getAllProposals();

        setProposals(data.proposals);
        setFilteredProposals(data.proposals);

        setStats({
          totalInvested: data.investorStats.totalInvestment,
          activeInvestments: data.investorStats.activeInvestments,
          averageReturn: 15.2,
        });
      } catch (error) {
        console.error("Failed to fetch proposals:", error);
      }
    };

    fetchProposals();
  }, []);

  useEffect(() => {
    const results = proposals.filter((proposal) => {
      const matchesSearch =
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "ALL" || proposal.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    setFilteredProposals(results);
  }, [searchTerm, filterStatus, proposals]);

  const handleLogout = async () => {
    try {
      const response = await logoutFunc();
      if (response) {
        logout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const openInvestModal = (proposal: Proposal) => {
    console.log("Opening invest modal for proposal:", proposal);

    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleInvest = async (razorpayResponse: any) => {
    if (!selectedProposal) return;

    try {
      const payload = {
        proposalId: selectedProposal.id,
        amount: parseFloat(investmentAmount),
        paymentId: razorpayResponse?.razorpay_payment_id, // Include Razorpay payment ID
      };

      await investInProposal(payload); // Your existing API call

      const updatedProposals = proposals.map((p) => {
        if (p.id === selectedProposal.id) {
          return {
            ...p,
            currentFunding: p.currentFunding + parseFloat(investmentAmount),
          };
        }
        return p;
      });

      setProposals(updatedProposals);
      setInvestmentAmount("");
      setIsModalOpen(false);

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
      toast.error(
        "Something went wrong with your investment. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Investor Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Analytics Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Investment Portfolio
          </h1>
          <button
            onClick={() => navigate("/investor/analytics")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <BarChart2 size={18} />
            <span>Analytics Dashboard</span>
          </button>
        </div>

        {/* Stats Section - Redesigned with improved visuals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Invested
                </p>
                <p className="text-2xl font-bold">
                  ${stats.totalInvested.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded">
              <div
                className="h-1 bg-blue-600 rounded"
                style={{
                  width: `${Math.min(
                    100,
                    (stats.totalInvested / 1000000) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <BarChart2 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Investments
                </p>
                <p className="text-2xl font-bold">{stats.activeInvestments}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-1">
              {Array.from({
                length: Math.min(10, stats.activeInvestments),
              }).map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-green-600 rounded" />
              ))}
              {Array.from({
                length: Math.max(0, 10 - Math.min(10, stats.activeInvestments)),
              }).map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-gray-200 rounded" />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg. Return Rate
                </p>
                <p className="text-2xl font-bold">{stats.averageReturn}%</p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded">
              <div
                className="h-1 bg-purple-600 rounded"
                style={{ width: `${Math.min(100, stats.averageReturn * 5)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick View Buttons */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              filterStatus === "ALL"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => setFilterStatus("ALL")}
          >
            All Opportunities
          </button>
          <button
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              filterStatus === "UNDER_REVIEW"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => setFilterStatus("UNDER_REVIEW")}
          >
            Under Review
          </button>
          <button
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              filterStatus === "NEGOTIATING"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => setFilterStatus("NEGOTIATING")}
          >
            Negotiating
          </button>
          <button
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              filterStatus === "FUNDED"
                ? "bg-green-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => setFilterStatus("FUNDED")}
          >
            Funded
          </button>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search investment opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <Filter size={18} className="text-gray-500 mr-2" />
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="FUNDED">Funded</option>
            </select>
          </div>
        </div>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-lg shadow">
            <Search size={48} className="mb-4" />
            <p className="text-lg font-medium">
              No matching investment opportunities
            </p>
            <p className="text-sm text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredProposals.map((proposal) => {
                return (
                  <div
                    key={proposal.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/investor/proposal/${proposal.id}`)
                    }
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {proposal.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              proposal.status === "UNDER_REVIEW"
                                ? "bg-yellow-100 text-yellow-800"
                                : proposal.status === "NEGOTIATING"
                                ? "bg-blue-100 text-blue-800"
                                : proposal.status === "FUNDED"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {proposal.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {proposal.description.length > 150
                            ? `${proposal.description.substring(0, 150)}...`
                            : proposal.description}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <User size={14} className="mr-1" />{" "}
                          {proposal?.founder.name} •
                          <Clock size={14} className="ml-2 mr-1" />{" "}
                          {proposal.createdAt}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Funding Progress
                          </p>
                          <p className="text-lg font-medium">
                            ${proposal?.currentFunding?.toLocaleString()} / $
                            {proposal.fundingGoal.toLocaleString()}
                          </p>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
                          {
                            proposal?.allInvestors?.reduce(
                              ({ offset, bars }, investor) => {
                                const widthPercent = Math.min(
                                  100,
                                  (investor.contribution /
                                    proposal.fundingGoal) *
                                    100
                                );
                                bars.push(
                                  <div
                                    key={investor.id}
                                    className="absolute h-full top-0"
                                    style={{
                                      width: `${widthPercent}%`,
                                      left: `${offset}%`,
                                      backgroundColor:
                                        investor.id === user?.id
                                          ? "#22c55e"
                                          : getColorForInvestor(investor.id),
                                      zIndex:
                                        investor.id === user?.id ? 20 : 10,
                                    }}
                                  />
                                );

                                return { offset: offset + widthPercent, bars };
                              },
                              { offset: 0, bars: [] as JSX.Element[] }
                            ).bars
                          }
                        </div>

                        {proposal.investorContribution > 0 && (
                          <p className="text-sm text-green-600 mt-1 font-medium">
                            You invested $
                            {proposal.investorContribution.toLocaleString()}
                          </p>
                        )}

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInvestModal(proposal);
                            }}
                            className={`px-4 py-2 ${
                              proposal.status === "FUNDED"
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            } text-white rounded-md transition-colors`}
                            disabled={proposal.status === "FUNDED"}
                          >
                            Invest Now
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/investor/proposal-performance/${proposal.id}`
                              );
                            }}
                            className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <BarChart2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Investment Modal */}
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
                  {
                    selectedProposal?.allInvestors?.reduce(
                      ({ offset, bars }, investor) => {
                        const widthPercent = Math.min(
                          100,
                          (investor.contribution /
                            selectedProposal.fundingGoal) *
                            100
                        );

                        bars.push(
                          <div
                            key={investor.id}
                            className="absolute h-full top-0"
                            style={{
                              width: `${widthPercent}%`,
                              left: `${offset}%`,
                              backgroundColor:
                                investor.id === user?.id
                                  ? "#22c55e"
                                  : getColorForInvestor(investor.id),
                              zIndex: investor.id === user?.id ? 20 : 10,
                            }}
                          />
                        );

                        return { offset: offset + widthPercent, bars };
                      },
                      { offset: 0, bars: [] as JSX.Element[] }
                    ).bars
                  }
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
    </div>
  );
}
