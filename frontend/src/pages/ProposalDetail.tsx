import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbars/Navbar";
import { getProposalById } from "@/api/proposal";
import { getInvestorContributions } from "@/api/chatService";
import FounderCommentsSection from "@/components/CommentsSection";
import ChatInterface from "@/components/InvestorFounderChat";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface Proposal {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  status: string;
  createdAt: string;
}

interface Investor {
  id: number;
  name: string;
  email: string;
  contribution: number;
  color: string;
}

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [recipient, setRecipient] = useState<Investor | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      try {
        const data = await getProposalById(id);
        setProposal({
          id: data.id,
          title: data.title,
          description: data.description,
          fundingGoal: data.fundingGoal,
          currentFunding: data.currentFunding,
          status: data.status,
          createdAt: new Date(data.createdAt).toLocaleDateString(),
        });
      } catch (err) {
        console.error("Failed to fetch proposal:", err);
      }
    };

    const fetchContributions = async () => {
      if (!id) return;
      try {
        const data = await getInvestorContributions(id);
        setInvestors(data);
      } catch (error) {
        console.error("Failed to fetch investor contributions:", error);
      }
    };

    fetchProposal();
    fetchContributions();
  }, [id]);

  const totalFunding = proposal?.fundingGoal ?? 1;

  if (!proposal) return <p className="p-6">Loading proposal...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

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

          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">
              Funding Progress
            </h2>
            <div className="w-full h-4 rounded-full bg-gray-200 relative overflow-hidden">
              {investors.map((inv, index) => {
                const percent = (inv.contribution / totalFunding) * 100;
                const left = investors
                  .slice(0, index)
                  .reduce(
                    (acc, i) => acc + (i.contribution / totalFunding) * 100,
                    0
                  );

                const isFirst = index === 0;
                const isLast = index === investors.length - 1;

                return (
                  <div
                    key={inv.id}
                    style={{
                      width: `${percent}%`,
                      left: `${left}%`,
                      backgroundColor: inv.color,
                    }}
                    className={`absolute h-full ${
                      isFirst ? "rounded-l-full" : ""
                    } ${isLast ? "rounded-r-full" : ""}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">
              Investors who want to have a talk:
            </h3>

            <div className="space-y-3">
              {investors.length === 0 ? (
                <p className="text-gray-500 text-sm">No investors yet.</p>
              ) : (
                investors.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: inv.color }}
                      ></span>
                      <div>
                        <p className="font-medium text-gray-900">{inv.name}</p>
                        <p className="text-xs text-gray-500">
                          Invested: ${inv.contribution}
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700"
                      onClick={() => {
                        setRecipient({
                          id: inv.id,
                          name: inv.name,
                          email: inv.email,
                          contribution: inv.contribution,
                          color: inv.color,
                        });
                        setIsChatOpen(true);
                      }}
                    >
                      Chat
                    </button>
                  </div>
                ))
              )}
            </div>
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

          <div className="mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Comments
            </h2>
            <FounderCommentsSection proposalId={proposal.id} />
          </div>
        </section>
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
