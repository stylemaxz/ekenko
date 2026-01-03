"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogIn, User, Lock, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";


export default function LoginPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
         if (data.redirectUrl) {
            router.push(data.redirectUrl);
         } else {
             router.push(data.user.role === 'manager' ? '/admin/dashboard' : '/sale/dashboard');
         }
      } else {
        setError(data.error || (language === 'th' ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' : 'Invalid username or password'));
        setIsLoading(false);
      }
    } catch (err) {
        console.error('Login error:', err);
        setError(language === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ' : 'Connection error');
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          {language === 'en' ? '🇹🇭 ไทย' : '🇺🇸 EN'}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-48 h-16 relative mx-auto mb-6">
            <Image 
              src="/ekenko_logo.png" 
              alt="Ekenko Logo" 
              fill
              className="object-contain"
              priority
              sizes="192px"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {language === 'th' ? 'ยินดีต้อนรับ' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500">
            {language === 'th' ? 'เข้าสู่ระบบเพื่อดำเนินการต่อ' : 'Sign in to continue'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {language === 'th' ? 'ชื่อผู้ใช้' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder={language === 'th' ? 'กรอกชื่อผู้ใช้' : 'Enter username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {language === 'th' ? 'รหัสผ่าน' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder={language === 'th' ? 'กรอกรหัสผ่าน' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {language === 'th' ? 'กำลังเข้าสู่ระบบ...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  {language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-xs text-slate-500 mb-3 font-medium">
              {language === 'th' ? '🔑 ข้อมูลทดสอบ:' : '🔑 Demo Credentials:'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-1">Admin</div>
                <div className="text-xs text-slate-600">admin / admin123</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-1">Sales</div>
                <div className="text-xs text-slate-600">somchai / password123</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          © 2024 Ekenko Sales Tracker. All rights reserved.
        </div>
      </div>
    </div>
  );
}
