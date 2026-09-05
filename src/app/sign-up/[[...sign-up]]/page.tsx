import { SignUp } from "@clerk/nextjs";
import { Sparkles, Lock } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-xl">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">HR Recruiter Onboarding</h1>
        <p className="text-xs text-slate-400 max-w-sm flex items-center justify-center gap-1">
          <Lock className="w-4 h-4 text-amber-400" /> Internal HR Organization Registration
        </p>
      </div>

      <SignUp
        appearance={{
          elements: {
            card: "bg-white rounded-3xl shadow-2xl border border-slate-100 p-8",
            headerTitle: "text-slate-900 font-bold text-xl",
            headerSubtitle: "text-slate-500 text-xs",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-xs font-bold py-3 rounded-xl",
          }
        }}
      />
    </div>
  );
}
