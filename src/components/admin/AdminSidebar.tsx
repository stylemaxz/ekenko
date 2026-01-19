"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  MapPin, 
  BarChart, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Calendar,
  Building2,
  Briefcase,
  FileText,
  FileCheck,
  Activity
} from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/contexts/ToastContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        showToast(t('logout_success'), 'success');
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showToast(t('logout_failed'), 'error');
    }
  };


  const navItems = [
    { href: "/admin/dashboard", label: t('dashboard'), icon: LayoutDashboard },
    { href: "/admin/calendar", label: t('calendar_title'), icon: Calendar },
    { href: "/admin/employees", label: t('employees'), icon: Users },
    { label: t('customers'), href: '/admin/customers', icon: Building2 },
    { label: t('tasks'), href: '/admin/tasks', icon: Briefcase },
    { label: t('leave_management'), href: '/admin/leave', icon: FileCheck },
    { label: t('activity_logs_title'), href: '/admin/activity-logs', icon: Activity },
    { label: t('reports'), href: '/admin/reports', icon: FileText },
  ];

  return (
    <aside className="sidebar">
      <div className="p-6 border-b border-slate-200 flex items-center justify-center">
        <div className="w-40 h-10 relative">
          <Image 
            src="/logo_2026.png" 
            alt="Ekenko Logo" 
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1.5">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2 mb-1">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-primary text-white shadow-sm shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={18} className={clsx(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-auto pt-4 border-t border-slate-200">
          <Link
            href="/admin/settings"
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
              pathname.startsWith("/admin/settings")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Settings size={18} className="text-slate-400" />
            {t('settings')}
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-red-600 hover:bg-red-50 mt-1"
          >
            <LogOut size={18} className="text-red-400" />
            {t('logout')}
          </button>
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border-2 border-white shadow-sm">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">Admin User</span>
            <span className="text-xs text-slate-500">{t('role_manager')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
