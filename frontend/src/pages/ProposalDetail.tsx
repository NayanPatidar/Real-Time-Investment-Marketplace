import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbars/Navbar";
import { getProposalById } from "@/api/proposal";

interface Proposal {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  status: string;
  createdAt: string;
}

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        if (!id) return;
        const data = await getProposalById(id);
        console.log(data);

        setProposal({
          id: data.id,
          title: data.title,
          description: data.description,
          fundingGoal: data.fundingGoal,
          status: data.status,
          createdAt: new Date(data.createdAt).toLocaleDateString(),
        });
      } catch (error) {
        console.error("Failed to fetch proposal:", error);
      }
    };

    fetchProposal();
  }, [id, navigate]);

  if (!proposal) return <p className="p-6">Loading proposal...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <aside className="md:col-span-1 bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Status</h2>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
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

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">
              Created At
            </h2>
            <p className="text-sm text-gray-800">{proposal.createdAt}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">
              Funding Goal
            </h2>
            <p className="text-lg font-semibold text-indigo-600">
              ${proposal.fundingGoal.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full mt-4 text-sm text-indigo-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </aside>

        {/* Main Content */}
        <section className="md:col-span-2 bg-white rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {proposal.title}
          </h1>

          <p className="text-gray-700 leading-relaxed mb-8">
            {proposal.description}
          </p>

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Connect with Investors
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              You can open a chat and collaborate directly with investors
              interested in this proposal.
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Open Chat with Investors
            </button>
          </div>

          <div className="mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Comments
            </h2>
            <p className="text-sm text-gray-500 italic">
              Comments feature coming soon...
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
