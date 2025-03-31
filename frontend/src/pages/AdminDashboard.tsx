import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  LogOut,
  Activity,
  User,
  Users,
  Settings,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { fetchProposals, fetchUsers } from "@/api/admin";
import { logout } from "@/utils/auth";
import { updateProposalStatus } from "@/api/proposal";
import NotificationDropdown from "@/components/NotificationDropdown";

// Define types
interface UserData {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  totalInvestment?: number;
  activeInvestments?: number;
}

interface ProposalData {
  id: number;
  title: string;
  founder: { name: string };
  category: string;
  currentFunding: number;
  fundingGoal: number;
  status: "UNDER_REVIEW" | "NEGOTIATING" | "FUNDED";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "founders" | "investors" | "proposals"
  >("overview");
  const [users, setUsers] = useState<UserData[]>([]);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFounders: 0,
    totalInvestors: 0,
    totalProposals: 0,
    fundedProposals: 0,
    totalInvestments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  const [investorChartData, setInvestorChartData] = useState<any[]>([]);
  const [proposalStatusData, setProposalStatusData] = useState<any[]>([]);
  const [categoryDistributionData, setCategoryDistributionData] = useState<
    any[]
  >([]);
  const [monthlyFundingData, setMonthlyFundingData] = useState<any[]>([]);

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Inside your useEffect, modify the fetchDashboardData function:
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        if (activeTab === "overview") {
          // Fetch summary statistics
          const foundersData = await fetchUsers("FOUNDER");
          const investorsData = await fetchUsers("INVESTOR");
          const allProposals = await fetchProposals();
          const fundedProposals = allProposals.filter(
            (p: any) => p.status === "FUNDED"
          );

          setStats({
            totalUsers: foundersData.length + investorsData.length,
            totalFounders: foundersData.length,
            totalInvestors: investorsData.length,
            totalProposals: allProposals.length,
            fundedProposals: fundedProposals.length,
            totalInvestments: investorsData.reduce(
              (sum: any, investor: any) => sum + investor.totalInvestment,
              0
            ),
          });

          // Prepare investor chart data (top 10 investors by investment amount)
          const topInvestors = [...investorsData]
            .sort((a, b) => b.totalInvestment - a.totalInvestment)
            .slice(0, 10);

          setInvestorChartData(
            topInvestors.map((investor) => ({
              name: investor.name,
              investment: investor.totalInvestment,
            }))
          );

          // Prepare proposal status distribution data
          const statusCounts = {
            UNDER_REVIEW: allProposals.filter(
              (p: any) => p.status === "UNDER_REVIEW"
            ).length,
            NEGOTIATING: allProposals.filter(
              (p: any) => p.status === "NEGOTIATING"
            ).length,
            FUNDED: fundedProposals.length,
          };

          setProposalStatusData(
            Object.entries(statusCounts).map(([name, value]) => ({
              name,
              value,
            }))
          );

          // Prepare category distribution data
          const categories: Record<string, number> = {};
          allProposals.forEach((proposal: any) => {
            categories[proposal.category] =
              (categories[proposal.category] || 0) + 1;
          });

          setCategoryDistributionData(
            Object.entries(categories).map(([name, value]) => ({
              name,
              value,
            }))
          );

          // Prepare monthly funding data (simulated for demo purposes)
          // In a real app, you would fetch this from your API
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
          const monthlyData = months.map((month) => {
            // Using the current stats to create realistic looking monthly data
            const fundedAmount = Math.floor(
              (stats.totalInvestments / 6) * (0.7 + Math.random() * 0.6)
            );
            return {
              month,
              funding: fundedAmount,
            };
          });

          setMonthlyFundingData(monthlyData);
        } else if (activeTab === "founders") {
          const foundersData = await fetchUsers("FOUNDER");
          setUsers(foundersData);
        } else if (activeTab === "investors") {
          const investorsData = await fetchUsers("INVESTOR");
          setUsers(investorsData);
        } else if (activeTab === "proposals") {
          const proposalsData = await fetchProposals();
          setProposals(proposalsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleStatusChange = async (
    proposalId: number,
    newStatus: "UNDER_REVIEW" | "NEGOTIATING" | "FUNDED"
  ) => {
    try {
      await updateProposalStatus(proposalId, newStatus);
      setProposals(
        proposals.map((p) =>
          p.id === proposalId ? { ...p, status: newStatus } : p
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update proposal status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xl text-indigo-700">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <a href="/" className="hover:opacity-80 transition-opacity">
                InvestConnect
              </a>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sidebar */}
        <div className="w-64 mr-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <nav className="flex flex-col">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                  activeTab === "overview"
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                    : "text-gray-700"
                }`}
              >
                <Activity size={20} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("founders")}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                  activeTab === "founders"
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                    : "text-gray-700"
                }`}
              >
                <User size={20} />
                Founders
              </button>
              <button
                onClick={() => setActiveTab("investors")}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                  activeTab === "investors"
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                    : "text-gray-700"
                }`}
              >
                <Users size={20} />
                Investors
              </button>
              <button
                onClick={() => setActiveTab("proposals")}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                  activeTab === "proposals"
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                    : "text-gray-700"
                }`}
              >
                <Settings size={20} />
                Proposals
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Platform Overview
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Total Users
                      </h3>
                      <p className="text-3xl font-bold text-indigo-600">
                        {stats.totalUsers}
                      </p>
                      <div className="mt-2 flex gap-4">
                        <div>
                          <span className="text-sm text-gray-500">
                            Founders
                          </span>
                          <p className="font-medium">{stats.totalFounders}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Investors
                          </span>
                          <p className="font-medium">{stats.totalInvestors}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Proposals
                      </h3>
                      <p className="text-3xl font-bold text-indigo-600">
                        {stats.totalProposals}
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Funded</span>
                          <span className="font-medium">
                            {stats.fundedProposals}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (stats.fundedProposals / stats.totalProposals) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Total Investments
                      </h3>
                      <p className="text-3xl font-bold text-indigo-600">
                        ${stats.totalInvestments.toLocaleString()}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Avg. per investor: $
                        {(
                          stats.totalInvestments / stats.totalInvestors || 0
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Top Investors Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-4">
                        Top Investors by Investment Amount
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={investorChartData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 60,
                            }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={100}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              formatter={(value) => [
                                `$${value.toLocaleString()}`,
                                "Investment",
                              ]}
                            />
                            <Bar
                              dataKey="investment"
                              fill="#8884d8"
                              name="Investment Amount"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Monthly Funding Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-4">
                        Monthly Funding Trends
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={monthlyFundingData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => [
                                `$${value.toLocaleString()}`,
                                "Funding",
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="funding"
                              stroke="#82ca9d"
                              activeDot={{ r: 8 }}
                              name="Funding"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Proposal Categories Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-4">
                        Proposal Categories Distribution
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryDistributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {categoryDistributionData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => [
                                value,
                                props.payload.name,
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Proposal Status Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-4">
                        Proposal Status Distribution
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={proposalStatusData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" name="Count">
                              {proposalStatusData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.name === "UNDER_REVIEW"
                                      ? "#FFBB28"
                                      : entry.name === "NEGOTIATING"
                                      ? "#0088FE"
                                      : "#00C49F"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "founders" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Founders
                    </h2>
                    <div className="text-sm text-gray-500">
                      Total: {users.length}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "investors" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Investors
                    </h2>
                    <div className="text-sm text-gray-500">
                      Total: {users.length}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total Investment
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Active Investments
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${user.totalInvestment?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.activeInvestments}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "proposals" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Proposals
                    </h2>
                    <div className="text-sm text-gray-500">
                      Total: {proposals.length}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Title
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Founder
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Category
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Funding
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {proposals.map((proposal) => (
                          <tr key={proposal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {proposal.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {proposal.founder.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {proposal.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${proposal.currentFunding.toLocaleString()} / $
                              {proposal.fundingGoal.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  proposal.status === "UNDER_REVIEW"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : proposal.status === "NEGOTIATING"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {proposal.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() =>
                                  navigate(`/admin/proposals/${proposal.id}`)
                                }
                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                              >
                                View
                              </button>
                              <select
                                value={proposal.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    proposal.id,
                                    e.target.value as
                                      | "UNDER_REVIEW"
                                      | "NEGOTIATING"
                                      | "FUNDED"
                                  )
                                }
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="UNDER_REVIEW">
                                  Under Review
                                </option>
                                <option value="NEGOTIATING">Negotiating</option>
                                <option value="FUNDED">Funded</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
