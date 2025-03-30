import React, { useEffect, useState } from "react";
import { PlusCircle, FileText, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createProposal, getMyProposals } from "@/api/proposal";
import { logout } from "@/utils/auth";

interface Proposal {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function FounderDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    fundingGoal: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        title: newProposal.title,
        description: newProposal.description,
        fundingGoal: parseFloat(newProposal.fundingGoal),
      };

      const createdProposal = await createProposal(payload);

      setProposals([createdProposal, ...proposals]);
      setNewProposal({ title: "", description: "", fundingGoal: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create proposal:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const fetchMyProposals = async () => {
      try {
        const data = await getMyProposals();
        setProposals(data);
      } catch (error) {
        console.error("Failed to fetch proposals:", error);
        alert("Unable to load proposals.");
      }
    };

    fetchMyProposals();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Founder Dashboard
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
        {/* Actions */}
        <div className="mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={18} />
            New Proposal
          </button>
        </div>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <FileText size={48} className="mb-4" />
            <p className="text-lg font-medium">No proposals created yet</p>
            <p className="text-sm text-gray-400">
              Click "New Proposal" to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-6"
                  onClick={() => navigate(`/proposals/${proposal.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {proposal.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {proposal.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <FileText size={16} />
                          Created on {proposal.createdAt.split("T")[0]}
                        </span>
                        <span className="text-sm text-indigo-600 font-medium">
                          Funding Goal: ${proposal.fundingGoal.toLocaleString()}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            proposal.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : proposal.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* New Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Proposal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  value={newProposal.title}
                  onChange={(e) =>
                    setNewProposal({ ...newProposal, title: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  value={newProposal.description}
                  onChange={(e) =>
                    setNewProposal({
                      ...newProposal,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Funding Goal */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fundingGoal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Funding Goal (USD)
                </label>
                <input
                  type="number"
                  id="fundingGoal"
                  required
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  value={newProposal.fundingGoal}
                  onChange={(e) =>
                    setNewProposal({
                      ...newProposal,
                      fundingGoal: e.target.value,
                    })
                  }
                />
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
                  Create Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
