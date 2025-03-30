import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NewProposalPage from "./pages/ProposalPage";
import FounderDashboard from "./pages/FoundersDashboard";
import ProposalDetail from "./pages/ProposalDetail";
import InvestorDashboard from "./pages/InvestorDashboard";
import InvestorProposalDetail from "./pages/InvestorProposalDetail";
import { AuthProvider } from "./context/AuthProvider";
import { Toaster } from "sonner";
import { SocketProvider } from "./context/SocketRef";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/proposal/new" element={<NewProposalPage />} />
              <Route path="/founder/dashboard" element={<FounderDashboard />} />
              <Route
                path="/investor/dashboard"
                element={<InvestorDashboard />}
              />
              <Route path="/proposals/:id" element={<ProposalDetail />} />
              <Route
                path="/investor/proposal/:id"
                element={<InvestorProposalDetail />}
              />
            </Routes>
          </Router>
          <Toaster />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
