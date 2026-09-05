import { SignIn } from "@clerk/nextjs";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">HR Candidate Screening Portal</h1>
        <p className="text-xs text-slate-400 max-w-sm flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authorized HR Personnel Login Only
        </p>
      </div>

      <SignIn
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
