import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  LogOut,
  TrendingUp,
  DollarSign,
  BarChart2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/utils/auth";
import { getAllProposals, investInProposal } from "@/api/proposal";

interface Proposal {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  status: "UNDER_REVIEW" | "APPROVED" | "NEGOTIATING" | "FUNDED" | "REJECTED";
  createdAt: string;
  creatorName: string;
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

  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    averageReturn: 15.2, // Mock data
  });

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
        alert("Unable to load investment opportunities.");
      }
    };

    fetchProposals();
  }, []);

  useEffect(() => {
    // Filter proposals based on search term and status filter
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

  const handleLogout = () => {
    logout();
  };

  const openInvestModal = (proposal: Proposal) => {
    console.log("Opening invest modal for proposal:", proposal);

    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProposal) return;

    try {
      const payload = {
        proposalId: selectedProposal.id,
        amount: parseFloat(investmentAmount)
      };

      await investInProposal(payload);

      // Update the proposal in the list
      const updatedProposals = proposals.map(p => {
        if (p.id === selectedProposal.id) {
          return {
            ...p,
            currentFunding: p.currentFunding + parseFloat(investmentAmount)
          };
        }
        return p;
      });

      setProposals(updatedProposals);
      setInvestmentAmount("");
      setIsModalOpen(false);

      alert("Investment successful!");
    } catch (error) {
      console.error("Failed to make investment:", error);
      alert("Something went wrong with your investment. Please try again.");
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
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
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
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
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
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
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
          </div>
        </div>

        {/* Search and Filter */}
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
              <option value="APPROVED">Approved</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="FUNDED">Funded</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500 bg-white rounded-lg shadow">
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
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/proposals/${proposal.id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {proposal.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            proposal.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : proposal.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : proposal.status === "FUNDED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
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
                        By {proposal.creatorName} • Created on{" "}
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

                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (proposal.currentFunding / proposal.fundingGoal) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openInvestModal(proposal);
                        }}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        // disabled={proposal.status !== "APPROVED"}
                      >
                        Invest Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedProposal.currentFunding /
                        selectedProposal.fundingGoal) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleInvest} className="space-y-4">
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Investment Summary
                </h4>
                <div className="flex justify-between text-sm">
                  <span>Investment Amount</span>
                  <span>
                    $
                    {investmentAmount
                      ? parseFloat(investmentAmount).toLocaleString()
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Platform Fee (3%)</span>
                  <span>
                    $
                    {investmentAmount
                      ? (parseFloat(investmentAmount) * 0.03).toLocaleString()
                      : "0"}
                  </span>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    $
                    {investmentAmount
                      ? (parseFloat(investmentAmount) * 1.03).toLocaleString()
                      : "0"}
                  </span>
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
