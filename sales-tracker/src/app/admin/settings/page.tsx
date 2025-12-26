"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Moon, User, Shield, ChevronRight } from "lucide-react";
import clsx from "clsx";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('settings_title')}</h1>
        <p className="text-slate-500 text-sm">{t('settings_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Navigation (Mock) */}
        <div className="lg:col-span-1 space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm">
                <div className="flex items-center gap-3">
                    <Globe size={18} />
                    {t('app_preferences')}
                </div>
                <ChevronRight size={16} />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors">
                <div className="flex items-center gap-3">
                    <User size={18} />
                    {t('account_settings')}
                </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors">
                <div className="flex items-center gap-3">
                    <Shield size={18} />
                    {t('security')}
                </div>
            </button>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-6">
            {/* Language Setting */}
            <div className="card">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{t('language')}</h3>
                        <p className="text-sm text-slate-500">{t('language_desc')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={clsx(
                            "flex items-center gap-3 p-4 rounded-xl border-2 transition-all relative overflow-hidden",
                            language === 'en' 
                                ? "border-primary bg-primary/5 shadow-md" 
                                : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                    >
                        <span className="text-2xl">🇺🇸</span>
                        <div className="text-left">
                            <div className={clsx("font-bold", language === 'en' ? "text-primary" : "text-slate-700")}>English</div>
                            <div className="text-xs text-slate-400">US English</div>
                        </div>
                        {language === 'en' && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-primary/10 -mr-8 -mt-8 rounded-full"></div>
                        )}
                    </button>

                    <button 
                         onClick={() => setLanguage('th')}
                         className={clsx(
                            "flex items-center gap-3 p-4 rounded-xl border-2 transition-all relative overflow-hidden",
                            language === 'th' 
                                ? "border-primary bg-primary/5 shadow-md" 
                                : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                    >
                        <span className="text-2xl">🇹🇭</span>
                        <div className="text-left">
                            <div className={clsx("font-bold", language === 'th' ? "text-primary" : "text-slate-700")}>ไทย</div>
                            <div className="text-xs text-slate-400">Thai</div>
                        </div>
                        {language === 'th' && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-primary/10 -mr-8 -mt-8 rounded-full"></div>
                        )}
                    </button>
                </div>
            </div>

             {/* Theme Setting (Mock) */}
             <div className="card opacity-60 pointer-events-none relative">
                <div className="absolute inset-0 bg-white/50 z-10"></div>
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                        <Moon size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{t('theme')}</h3>
                        <p className="text-sm text-slate-500">{t('theme_desc')}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-medium text-slate-400">Light (Default)</div>
                     <div className="h-20 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-medium text-slate-500">Dark (Coming Soon)</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
