import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
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
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  TrendingUpIcon,
  DollarSign,
  BarChart2,
} from "lucide-react";
import { fetchInvestorDashboard } from "@/api/investor";

type Investment = {
  startupName: string;
  sector: string;
  amount: number;
  date: string | Date;
  status: "Active" | "Exited" | "Pending"; // or whatever statuses you support
  proposalId?: string | number; // if you're using it elsewhere like View button
};

export default function InvestorDashboardAnalytics() {
  const [investmentData, setInvestmentData] = useState<Investment[]>([]);
  const [fundingStats, setFundingStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    averageInvestment: 0,
    successfulExits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchInvestorDashboard();

        setInvestmentData(data.investments);
        setFundingStats({
          totalInvested: data.totalInvested,
          activeInvestments: data.activeInvestments,
          averageInvestment: data.averageInvestment,
          successfulExits: data.successfulExits,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data for the charts
  const monthlyInvestments = [
    { month: "Jan", amount: 12000 },
    { month: "Feb", amount: 19000 },
    { month: "Mar", amount: 8000 },
    { month: "Apr", amount: 15000 },
    { month: "May", amount: 22000 },
    { month: "Jun", amount: 18000 },
    { month: "Jul", amount: 25000 },
  ];

  const sectorDistribution = [
    { name: "Technology", value: 45 },
    { name: "Healthcare", value: 25 },
    { name: "Education", value: 15 },
    { name: "Finance", value: 10 },
    { name: "Others", value: 5 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-2 sm:mb-0">Investor Dashboard</h1>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Invested</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  <DollarSign className="h-5 w-5 mr-1 text-indigo-600" />$
                  {fundingStats.totalInvested.toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Investments</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  <BarChart2 className="h-5 w-5 mr-1 text-green-600" />
                  {fundingStats.activeInvestments}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Investment</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  <DollarSign className="h-5 w-5 mr-1 text-yellow-600" />$
                  {fundingStats.averageInvestment.toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Successful Exits</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  <TrendingUpIcon className="h-5 w-5 mr-1 text-blue-600" />
                  {fundingStats.successfulExits}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="monthly">Monthly Investment</TabsTrigger>
              <TabsTrigger value="sectors">Sector Distribution</TabsTrigger>
              <TabsTrigger value="performance">
                Portfolio Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Investment Trend</CardTitle>
                  <CardDescription>
                    Your investment activity over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyInvestments}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Amount"]}
                        />
                        <Legend />
                        <Bar dataKey="amount" fill="#6366F1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sectors">
              <Card>
                <CardHeader>
                  <CardTitle>Investment by Sector</CardTitle>
                  <CardDescription>
                    Distribution of your investments across different sectors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sectorDistribution.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Percentage"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>
                    Return on investment over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: "Jan", ROI: 2.4 },
                          { month: "Feb", ROI: 3.1 },
                          { month: "Mar", ROI: 2.8 },
                          { month: "Apr", ROI: 3.5 },
                          { month: "May", ROI: 4.2 },
                          { month: "Jun", ROI: 4.0 },
                          { month: "Jul", ROI: 4.5 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, "ROI"]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="ROI"
                          stroke="#6366F1"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Investments */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Recent Investments</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Startup
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {investmentData.length > 0 ? (
                    investmentData.slice(0, 5).map((investment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                              {investment.startupName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {investment.startupName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {investment.sector}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${investment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(investment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              investment.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : investment.status === "Exited"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {investment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No investment data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
