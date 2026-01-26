"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Home, Users, UserPlus, User, Menu, X, Calendar, ClipboardList } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { icon: Home, label: t('nav_dashboard'), path: '/sale/dashboard' },
    { icon: Users, label: t('nav_customers'), path: '/sale/customers' },
    { icon: UserPlus, label: t('new_client'), path: '/sale/customers?status=lead' },
    { icon: Calendar, label: t('my_leave_requests'), path: '/sale/leave' },
    { icon: ClipboardList, label: t('my_tasks'), path: '/sale/tasks' },
    { icon: User, label: t('profile'), path: '/sale/profile' },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  // Check for rejected leave requests on mount
  useEffect(() => {
    const checkRejectedLeaves = async () => {
      try {
        // 1. Get Current User
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) return;
        const user = await authRes.json();

        if (user && user.id) {
          // 2. Get My Leave Requests
          const leaveRes = await fetch(`/api/leave-requests?employeeId=${user.id}`);
          if (!leaveRes.ok) return;
          const leaves = await leaveRes.json();

          // 3. Filter Rejected & Unseen
          const rejectedLeaves = leaves.filter((l: any) => l.status === 'rejected');
          
          rejectedLeaves.forEach((leave: any) => {
             const key = `seen_rejected_leave_${leave.id}`;
             const isSeen = localStorage.getItem(key);

             if (!isSeen) {
                // 4. Show Notification
                // Determine thai label for leave type if possible, or use english
                // We can't easily access the same map from API here without duplicating consts
                // Just use generic message or mapped if simple.
                
                const typeMap: Record<string, string> = {
                    sick: 'ลาป่วย',
                    personal: 'ลากิจ',
                    vacation: 'ลาพักร้อน',
                    other: 'ลาอื่นๆ'
                };
                const typeLabel = typeMap[leave.type] || leave.type;
                const dates = leave.days === 1 
                    ? `วันที่ ${new Date(leave.startDate).toLocaleDateString('th-TH')}`
                    : `วันที่ ${new Date(leave.startDate).toLocaleDateString('th-TH')} - ${new Date(leave.endDate).toLocaleDateString('th-TH')}`;

                showToast(`คำขอ ${typeLabel} (${dates}) ไม่ได้รับการอนุมัติ`, 'error');
                
                // 5. Mark as seen
                localStorage.setItem(key, 'true');
             }
          });
        }
      } catch (error) {
        console.error('Error checking leave status:', error);
      }
    };

    checkRejectedLeaves();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Top Header with Logo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Menu"
          >
            <Menu size={24} className="text-slate-700" />
          </button>
          
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
          
          <div className="w-10">{/* Spacer */}</div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="w-28 h-7 relative">
            <Image 
              src="/logo_2026.png" 
              alt="Ekenko Logo" 
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 active:scale-95 transition-all"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || 
                           (item.path.includes('?') && pathname === item.path.split('?')[0]);
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-medium">{item.label}</span>
                
                {isActive && (
                  <span className="absolute right-4 w-1.5 h-8 bg-primary-foreground rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            © 2026 Ekenko
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="max-w-md mx-auto md:max-w-full">
          {children}
      </main>
    </div>
  );
}
