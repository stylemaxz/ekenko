"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { LogOut, ChevronRight, Globe } from "lucide-react";

export default function SaleProfilePage() {
  const { t, setLanguage, language } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    // Mock logout - redirect to login page
    router.push('/');
  };

  const menuItems = [
    { 
      label: t('language'), 
      icon: Globe,
      value: language === 'en' ? 'English' : 'ไทย',
      action: () => setLanguage(language === 'en' ? 'th' : 'en')
    },
  ];

  return (
    <div className="pb-24 pt-8 px-4 bg-slate-50 min-h-screen">
       <div className="flex flex-col items-center mb-8">
           <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md mb-4 overflow-hidden">
               {/* Placeholder Avatar */}
               <img src="https://i.pravatar.cc/150?u=1" alt="Profile" className="w-full h-full object-cover" />
           </div>
           <h2 className="text-xl font-bold text-slate-900">Somchai Salesman</h2>
           <p className="text-slate-500">Sales Representative</p>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           {menuItems.map((item, idx) => (
               <button 
                  key={idx} 
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
               >
                   <div className="flex items-center gap-3">
                       <item.icon size={20} className="text-slate-600" />
                       <span className="font-medium text-slate-900">{item.label}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       {item.value && <span className="text-sm text-slate-500">{item.value}</span>}
                       <ChevronRight size={18} className="text-slate-400" />
                   </div>
               </button>
           ))}
       </div>

       <button 
           onClick={handleLogout}
           className="w-full mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
       >
           <LogOut size={20} />
           <span className="font-medium">{t('logout')}</span>
       </button>
       
       <div className="text-center mt-8 text-xs text-slate-400">
           App Version 1.0.0 (MVP)
       </div>
    </div>
  );
}
