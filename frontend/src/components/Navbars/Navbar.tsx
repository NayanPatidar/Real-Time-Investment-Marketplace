import { TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { MobileMenu } from "../mobile-menu";
import { getUserRole, isAuthenticated } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const authenticated: boolean | undefined = isAuthenticated();
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between min-w-screen px-10">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-700">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <a href="#top" className="hover:opacity-80 transition-opacity">
            InvestConnect
          </a>
        </div>
        <nav className="hidden md:flex gap-6">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#key-benfits"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Key Benefits
          </a>
          <a
            href="#success-stories"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Success Stories
          </a>
        </nav>
        <div className="flex items-center gap-4">
          {authenticated ? (
            <>
              {" "}
              <Button
                onClick={() => NavigateToPersonalDashboard(authenticated)}
                className="hidden md:inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                Dashboard
              </Button>
              <MobileMenu />
            </>
          ) : (
            <>
              {" "}
              <a
                href="/auth"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors hidden md:block"
              >
                Sign In
              </a>
              <Button className="hidden md:inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                Get Started
              </Button>
              <MobileMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
