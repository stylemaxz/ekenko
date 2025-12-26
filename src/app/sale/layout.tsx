"use client";

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Home, Users, MapPin, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('nav_dashboard'), path: '/sale/dashboard' },
    { icon: Users, label: t('nav_customers'), path: '/sale/customers' },
    { icon: MapPin, label: t('check_in'), path: '/sale/check-in' },
    { icon: User, label: t('profile'), path: '/sale/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20"> {/* pb-20 for bottom nav space */}
      
      {/* Mobile Top Header with Logo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex justify-center items-center md:hidden shadow-sm">
          <div className="w-32 h-8 relative">
            <Image 
              src="/ekenko_logo.png" 
              alt="Ekenko Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto md:max-w-full md:pb-0">
          {children}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {isActive && (
                    <span className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-b-full"></span>
                )}
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
