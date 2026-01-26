"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Home, ClipboardList, FolderOpen, User, Menu, X, FlaskConical } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RndLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { icon: Home, label: t('nav_rnd_dashboard'), path: '/rnd/dashboard' },
    { icon: ClipboardList, label: t('nav_rnd_tasks'), path: '/rnd/tasks' },
    { icon: FolderOpen, label: t('nav_projects'), path: '/rnd/projects' },
    { icon: User, label: t('profile'), path: '/rnd/profile' },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 active:scale-95 transition-all"
          >
            <Menu size={24} className="text-slate-700" />
          </button>

          <div className="flex items-center gap-2">
            <FlaskConical size={20} className="text-primary" />
            <div className="w-32 h-8 relative">
              <Image
                src="/logo_2026.png"
                alt="Ekenko Logo"
                fill
                sizes="128px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="w-10"></div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-primary" />
            <div className="w-28 h-7 relative">
              <Image
                src="/logo_2026.png"
                alt="Ekenko Logo"
                fill
                sizes="112px"
                className="object-contain"
              />
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <nav className="flex flex-col p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 :  2} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">R&D Portal - 2026 Ekenko</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="max-w-md mx-auto md:max-w-full">
          {children}
      </main>
    </div>
  );
}
