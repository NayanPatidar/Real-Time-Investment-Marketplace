import { useEffect, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import SignUp from "@/components/Signup";
import SignIn from "@/components/SignIn";
import { useParams } from "react-router-dom";

function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const { mode, role } = useParams();

  useEffect(() => {
    if (mode === "signup") {
      setIsSignIn(false);
    } else if (mode === "signin") {
      setIsSignIn(true);
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-[#fcfeff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                isSignIn
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LogIn size={18} />
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                !isSignIn
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <UserPlus size={18} />
              Sign Up
            </button>
          </div>

          <div className="p-8">
            {isSignIn ? <SignIn /> : <SignUp defaultRole={role} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
