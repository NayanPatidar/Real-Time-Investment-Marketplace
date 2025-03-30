import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Rocket, Sparkles, Star, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbars/Navbar";
import { getUserRole, isAuthenticated } from "@/utils/auth";

export default function InvestmentPlatform() {
  const navigate = useNavigate();
  const authenticated: boolean | undefined = isAuthenticated();
  const NavigateToPersonalDashboard = (authenticated: boolean | undefined) => {
    if (!authenticated) return;

    const role = getUserRole();

    if (role === "FOUNDER") {
      navigate("/founder/dashboard");
    } else if (role === "INVESTOR") {
      navigate("/investor/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-sky-50">
      <Navbar />

      <main className="flex-1 flex justify-center flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-tr from-indigo-900 via-blue-800 to-sky-700 py-20 md:py-32 text-white px-10">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/api/placeholder/1200/800')] bg-no-repeat bg-cover mix-blend-overlay"></div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/30 to-transparent rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/4"></div>

          <div className="container relative z-10 grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-100 text-sm font-medium mb-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Connecting dreams with capital
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Connecting Innovative Startups with Strategic Investors
              </h1>
              <p className="text-xl text-blue-100 max-w-[600px]">
                Our platform streamlines the fundraising process, giving
                founders direct access to capital and investors exclusive
                opportunities to discover the next big thing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Join as Investor
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
                  onClick={() => NavigateToPersonalDashboard(authenticated)}
                >
                  Submit Your Startup
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.02] group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/80 to-indigo-600/80 group-hover:opacity-90 transition-opacity duration-500"></div>
              <img
                src="/api/placeholder/800/600"
                alt="Investment platform visualization"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-white text-center max-w-xs">
                  <Rocket className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">
                    Discover how we've helped 1000+ startups raise over $500M in
                    funding
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 px-10 bg-white flex justify-center">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center shadow-sm">
                <p className="text-3xl font-bold text-indigo-700 mb-1">
                  $500M+
                </p>
                <p className="text-sm text-slate-600">Total Investments</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center shadow-sm">
                <p className="text-3xl font-bold text-purple-700 mb-1">
                  1,000+
                </p>
                <p className="text-sm text-slate-600">Startups Funded</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center shadow-sm">
                <p className="text-3xl font-bold text-emerald-700 mb-1">
                  5,000+
                </p>
                <p className="text-sm text-slate-600">Active Investors</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 text-center shadow-sm">
                <p className="text-3xl font-bold text-amber-700 mb-1">92%</p>
                <p className="text-sm text-slate-600">Success Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section
          id="key-benfits"
          className="py-20 px-10 bg-white flex justify-center"
        >
          <div className="container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-2">
                <Star className="h-4 w-4 mr-2" />
                Why Choose Us
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Key Benefits
              </h2>
            </div>

            <Tabs defaultValue="founders" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-blue-50 rounded-lg">
                  <TabsTrigger
                    value="founders"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-md data-[state=active]:shadow-md transition-all duration-300"
                  >
                    For Founders
                  </TabsTrigger>
                  <TabsTrigger
                    value="investors"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-md data-[state=active]:shadow-md transition-all duration-300"
                  >
                    For Investors
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="founders" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-400/20 to-transparent h-24 w-24 rounded-bl-full"></div>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-xl text-blue-700 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                        Access Strategic Capital
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">
                        Connect with investors who bring not just funding, but
                        strategic value to help your startup grow.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-400/20 to-transparent h-24 w-24 rounded-bl-full"></div>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-xl text-indigo-700 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-indigo-500" />
                        Streamlined Fundraising
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">
                        Our platform simplifies the fundraising process, saving
                        you time to focus on building your business.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-purple-400/20 to-transparent h-24 w-24 rounded-bl-full"></div>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-xl text-purple-700 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-purple-500" />
                        Direct Communication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">
                        Engage directly with potential investors, building
                        relationships that go beyond the transaction.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="investors" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-emerald-400/20 to-transparent h-24 w-24 rounded-bl-full"></div>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-xl text-emerald-700 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
                        Vetted Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">
                        Access pre-screened investment opportunities that match
                        your investment criteria and interests.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-teal-400/20 to-transparent h-24 w-24 rounded-bl-full"></div>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-xl text-teal-700 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-teal-500" />
                        Real-time Negotiation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">
                        Negotiate deals efficiently through our secure platform
                        with transparent terms and conditions.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-br from-cyan-50 to-sky-50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-cyan-400/20 to-transparent h-24 w-24 rounded-bl-full"></div>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-xl text-cyan-700 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-cyan-500" />
                        Portfolio Diversification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">
                        Diversify your investment portfolio with access to
                        startups across various industries and stages.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="py-20 px-10 bg-gradient-to-b from-blue-50 to-indigo-100 flex justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full filter blur-3xl"></div>

          <div className="container relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2">
                <Rocket className="h-4 w-4 mr-2" />
                Simple Process
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
                How It Works
              </h2>
              <p className="text-center text-slate-600 max-w-2xl mx-auto">
                Our platform makes connecting startups and investors simple and
                efficient
              </p>
            </div>

            <Tabs defaultValue="founders-process" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-white/50 backdrop-blur-sm rounded-lg">
                  <TabsTrigger
                    value="founders-process"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-md data-[state=active]:shadow-md transition-all duration-300"
                  >
                    For Founders
                  </TabsTrigger>
                  <TabsTrigger
                    value="investors-process"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-md data-[state=active]:shadow-md transition-all duration-300"
                  >
                    For Investors
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="founders-process">
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="flex flex-col items-center text-center bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-blue-700">
                      Create Proposal
                    </h3>
                    <p className="text-slate-600 relative z-10">
                      Build a compelling profile showcasing your startup's
                      vision, team, and funding needs.
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-indigo-700">
                      Connect with Investors
                    </h3>
                    <p className="text-slate-600 relative z-10">
                      Engage with interested investors who align with your
                      industry and growth stage.
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-purple-700">
                      Secure Funding
                    </h3>
                    <p className="text-slate-600 relative z-10">
                      Finalize deals through our secure platform and receive the
                      capital to fuel your growth.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="investors-process">
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="flex flex-col items-center text-center bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-emerald-700">
                      Browse Opportunities
                    </h3>
                    <p className="text-slate-600 relative z-10">
                      Discover vetted startups that match your investment
                      criteria and interests.
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-teal-700">
                      Evaluate and Negotiate
                    </h3>
                    <p className="text-slate-600 relative z-10">
                      Perform due diligence and negotiate terms directly with
                      founding teams.
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-cyan-700">
                      Fund Promising Startups
                    </h3>
                    <p className="text-slate-600 relative z-10">
                      Complete investments securely and track your portfolio's
                      performance over time.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Success Stories */}
        <section
          id="success-stories"
          className="py-20 px-10 bg-gradient-to-b from-purple-50 to-pink-100 flex justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-transparent rounded-full filter blur-3xl"></div>

          <div className="container relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Real Results
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Success Stories
              </h2>
              <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12">
                Real results from founders and investors who connected on our
                platform
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <img
                      src="/placeholder-avatar.jpg"
                      alt="Founder portrait"
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-700">
                      EcoTech Solutions
                    </h3>
                    <p className="text-sm text-slate-600">
                      Sustainable Energy Startup
                    </p>
                  </div>
                </div>
                <p className="mb-4 text-slate-700">
                  "We secured $2.5M in funding within 3 months of joining the
                  platform. The investors we connected with brought not just
                  capital, but valuable industry expertise."
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Raised $2.5M Series A</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>120% YoY growth</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 pt-4 border-t border-slate-100">
                  <span className="font-medium">Sarah Chen</span>, Founder & CEO
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-fuchsia-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-r from-fuchsia-500 to-purple-500 flex items-center justify-center">
                    <img
                      src="/placeholder-avatar.jpg"
                      alt="Investor portrait"
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-fuchsia-700">
                      Horizon Ventures
                    </h3>
                    <p className="text-sm text-slate-600">
                      Early-Stage VC Firm
                    </p>
                  </div>
                </div>
                <p className="mb-4 text-slate-700">
                  "The quality of startups on this platform is exceptional.
                  We've invested in 5 companies so far, with 2 already showing
                  3x returns within 18 months."
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-fuchsia-500" />
                    <span>Invested in 5 startups</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-fuchsia-500" />
                    <span>3x average return</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 pt-4 border-t border-slate-100">
                  <span className="font-medium">Michael Torres</span>, Managing
                  Partner
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-100 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                    <img
                      src="/placeholder-avatar.jpg"
                      alt="Founder portrait"
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-pink-700">HealthSync</h3>
                    <p className="text-sm text-slate-600">
                      Healthcare Technology
                    </p>
                  </div>
                </div>
                <p className="mb-4 text-slate-700">
                  "From pitch to funding in just 6 weeks. The platform's
                  streamlined process helped us connect with the perfect
                  investors who understood our vision for healthcare
                  innovation."
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-pink-500" />
                    <span>Raised $1.8M Seed Round</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-pink-500" />
                    <span>Expanded to 3 new markets</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 pt-4 border-t border-slate-100">
                  <span className="font-medium">Dr. James Wilson</span>,
                  Co-founder
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-10 bg-gradient-to-b from-purple-500 to-indigo-600 text-white flex justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-400/30 to-transparent rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/30 to-transparent rounded-full filter blur-3xl"></div>

          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                <TrendingUp className="h-4 w-4 mr-2" />
                Join Our Community
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Ready to Transform Your Investment Journey?
              </h2>
              <p className="text-xl mb-8 text-purple-100 max-w-2xl">
                Join thousands of founders and investors already using our
                platform to connect, collaborate, and create value.
              </p>

              <div className="w-full max-w-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full bg-white text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  >
                    Join as Investor
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  >
                    Submit Your Startup
                  </Button>
                </div>
                <p className="text-sm text-purple-100/90">
                  Free registration. No commitment until you're ready to invest
                  or fundraise.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-10 bg-gradient-to-b from-slate-50 to-slate-100 flex justify-center">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  InvestConnect
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Connecting innovative startups with strategic investors since
                2018.
              </p>
              <div className="flex gap-4">
                <Link
                  to="#"
                  className="text-purple-500 hover:text-purple-700 bg-purple-100 p-2 rounded-full hover:shadow-md transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link
                  to="#"
                  className="text-blue-500 hover:text-blue-700 bg-blue-100 p-2 rounded-full hover:shadow-md transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link
                  to="#"
                  className="text-indigo-500 hover:text-indigo-700 bg-indigo-100 p-2 rounded-full hover:shadow-md transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Company
              </h3>
              <nav className="flex flex-col gap-2">
                <Link
                  to="#"
                  className="text-sm text-slate-600 hover:text-purple-600 transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="#"
                  className="text-sm text-slate-600 hover:text-purple-600 transition-colors"
                >
                  Our Team
                </Link>
                <Link
                  to="#"
                  className="text-sm text-slate-600 hover:text-purple-600 transition-colors"
                >
                  Careers
                </Link>
                <Link
                  to="#"
                  className="text-sm text-slate-600 hover:text-purple-600 transition-colors"
                >
                  Press
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="font-medium mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Resources
              </h3>
              <nav className="flex flex-col gap-2">
                <Link
                  to="#"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Blog
                </Link>
                <Link
                  to="#"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Investor Guide
                </Link>
                <Link
                  to="#"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Founder Resources
                </Link>
                <Link
                  to="#"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  FAQ
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="font-medium mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Stay Updated
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Subscribe to our newsletter for the latest investment
                opportunities and platform updates.
              </p>
              <form className="space-y-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300"
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} InvestConnect. All rights
              reserved.
            </p>
            <nav className="flex gap-6">
              <Link
                to="#"
                className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="#"
                className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
