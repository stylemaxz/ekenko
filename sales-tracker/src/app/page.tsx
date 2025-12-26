import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointing-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-300 transform -rotate-6 transition-transform hover:rotate-0 duration-300">
                <ShieldCheck size={32} />
            </div>
        </div>
        
        <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
             SalesTracker
            </h1>
            <p className="text-slate-500 text-lg">
                Secure enterprise login for field sales management system.
            </p>
        </div>

        <div className="card bg-white shadow-xl shadow-slate-200 border-none p-8 text-left space-y-6 rounded-2xl">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input type="email" placeholder="admin@company.com" className="input bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input type="password" placeholder="••••••••" className="input bg-slate-50 focus:bg-white transition-colors" />
            </div>
            
            <Link 
                href="/admin" 
                className="btn btn-primary w-full py-3.5 text-base justify-center shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all font-semibold"
            >
                Sign In
                <ArrowRight size={18} />
            </Link>
        </div>
        
        <p className="text-xs text-slate-400 font-medium">
            © 2024 SalesTracker System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
