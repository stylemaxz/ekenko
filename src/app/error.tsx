"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, language } = useLanguage();

  useEffect(() => {
    // #10 Monitoring & Observability
    console.error("Hydration/Runtime Error caught:", error);
    // In production, this would send to Sentry: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {language === 'th' ? 'เกิดข้อผิดพลาด' : 'Something went wrong!'}
        </h2>
        <p className="text-slate-600 mb-6">
            {language === 'th' 
                ? 'ระบบเกิดข้อผิดพลาดบางประการ โปรดลองใหม่อีกครั้ง'
                : 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="btn btn-primary w-full"
        >
          {language === 'th' ? 'ลองใหม่' : 'Try again'}
        </button>
      </div>
    </div>
  );
}
