"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import { format } from "date-fns";
import { enUS, th } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import {
  MapPin,
  UserPlus,
  ClipboardList,
  Clock,
  LogOut,
  ChevronRight,
  FileText,
  Home
} from "lucide-react";
import { useRouter } from "next/navigation";
import { mockVisits, mockCompanies } from "@/utils/mockData";
import { useState, useEffect } from "react";

export default function SaleDashboardPage() {
  const { t, language } = useLanguage();
  const { confirm } = useConfirmDialog();
  const router = useRouter();
  const locale = language === "th" ? th : enUS;
  const BANGKOK_TZ = "Asia/Bangkok";

  // Mock State for Clock In/Out (In a real app, this would be global state/context)
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState({ hours: 0, minutes: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  // WFH State
  const [isWorkFromHome, setIsWorkFromHome] = useState(false);

  // Load clock-in state and WFH from localStorage on mount
  useEffect(() => {
    const savedClockIn = localStorage.getItem('clockInTime');
    if (savedClockIn) {
      const savedTime = new Date(savedClockIn);
      setClockInTime(savedTime);
      setIsClockedIn(true);
    }
    
    // Load WFH Setting
    const savedWFH = localStorage.getItem('isWorkFromHome') === 'true';
    setIsWorkFromHome(savedWFH);
  }, []);
  
  const toggleWFH = () => {
    const newState = !isWorkFromHome;
    setIsWorkFromHome(newState);
    localStorage.setItem('isWorkFromHome', String(newState));
  };

  // Update current time every second (Bangkok timezone)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(toZonedTime(new Date(), BANGKOK_TZ));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (isClockedIn && clockInTime) {
      const interval = setInterval(() => {
        const now = toZonedTime(new Date(), BANGKOK_TZ);
        const diff = now.getTime() - clockInTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setElapsedTime({ hours, minutes });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isClockedIn, clockInTime]);

  // Mock Current User (Sales Rep) - In reality, get from Auth Context
  const currentUserId = "1"; // Assuming '1' is the logged-in sales rep

  const handleClockInOut = async () => {
    if (!isClockedIn) {
      // Clocking in
      const bangkokTime = toZonedTime(new Date(), BANGKOK_TZ);
      setClockInTime(bangkokTime);
      setIsClockedIn(true);
      // Save to localStorage
      localStorage.setItem('clockInTime', bangkokTime.toISOString());
    } else {
      // Clocking out - check if worked less than 8 hours
      const now = toZonedTime(new Date(), BANGKOK_TZ);
      const diff = clockInTime ? now.getTime() - clockInTime.getTime() : 0;
      const hoursWorked = diff / (1000 * 60 * 60);
      
      if (hoursWorked < 8) {
        const confirmClockOut = await confirm({
          title: language === 'th' ? 'ยังไม่ครบ 8 ชั่วโมง' : 'Less than 8 Hours',
          message: language === 'th' 
            ? `คุณทำงานไปเพียง ${elapsedTime.hours} ชั่วโมง ${elapsedTime.minutes} นาที\n(ยังไม่ครบ 8 ชั่วโมง)\n\nต้องการออกงานจริงหรือไม่?`
            : `You have worked only ${elapsedTime.hours} hours ${elapsedTime.minutes} minutes\n(less than 8 hours)\n\nAre you sure you want to clock out?`,
          confirmText: language === 'th' ? 'ออกงาน' : 'Clock Out',
          cancelText: language === 'th' ? 'ยกเลิก' : 'Cancel',
          type: 'warning'
        });
        
        if (!confirmClockOut) {
          return; // Cancel clock out
        }
      }
      
      // Proceed with clock out
      setIsClockedIn(false);
      setClockInTime(null);
      setElapsedTime({ hours: 0, minutes: 0 });
      // Remove from localStorage
      localStorage.removeItem('clockInTime');
    }
    // In real app: API call to record time & location
  };

  // Filter recent activity for this user
  const myRecentVisits = mockVisits
    .filter((v) => v.employeeId === currentUserId)
    .sort(
      (a, b) =>
        new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    )
    .slice(0, 5);

  const quickActions = [
    {
      icon: MapPin,
      label: t("check_in"),
      color: "bg-primary",
      onClick: () => router.push("/sale/check-in"),
    },
    {
      icon: UserPlus,
      label: t("new_customer"),
      color: "bg-teal-600",
      onClick: () => router.push("/sale/customers?action=new"),
    },
    {
      icon: FileText,
      label: t("leave_request"),
      color: "bg-purple-600",
      onClick: () => router.push("/sale/leave"),
    },
    {
      icon: ClipboardList,
      label: t("my_tasks"),
      color: "bg-amber-500",
      onClick: () => router.push("/sale/tasks"), // To be implemented
    },
  ];

  return (
    <div className="pb-24">
      {/* Header Section */}
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t("welcome_back")}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {format(currentTime, "EEEE, d MMM yyyy", { locale })} • {format(currentTime, "HH:mm")}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
            S
          </div>
        </div>

        {/* Clock In/Out Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                {isClockedIn ? (language === 'th' ? 'กำลังทำงาน' : 'Currently Working') : (language === 'th' ? 'ยังไม่เข้างาน' : 'Off Duty')}
              </div>
              <div className="text-3xl font-bold font-mono tracking-tight">
                {format(new Date(), "HH:mm")}
              </div>
              {/* Elapsed Time Display */}
              {isClockedIn && (
                <div className="mt-2 flex items-center gap-2">
                  <Clock size={14} className="text-red-400" />
                  <span className="text-sm font-medium text-red-300">
                    {String(elapsedTime.hours).padStart(2, '0')}:{String(elapsedTime.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {language === 'th' ? 'ชม.' : 'hrs'}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleClockInOut}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 ${
                isClockedIn
                  ? "bg-slate-500 hover:bg-slate-600 text-white shadow-lg shadow-slate-900/20"
                  : "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-black/20"
              }`}
            >
              {isClockedIn ? t("clock_out") : t("clock_in")}
            </button>
          </div>
          <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* WFH Toggle (Moved from CheckIn Page) */}
        {!isClockedIn && (
           <div className="mt-4 flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl">
              <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isWorkFromHome ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-400'}`}>
                      <Home size={16} />
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                      Work From Home
                  </div>
              </div>
              <label className={`relative inline-flex items-center cursor-pointer`}>
                <input type="checkbox" className="sr-only peer" checked={isWorkFromHome} onChange={toggleWFH} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
           </div>
        )}
      </div>

      <div className="px-6 -mt-4">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="flex flex-col items-center gap-3 group"
            >
              <div
                className={`${action.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md shadow-slate-200 group-active:scale-95 transition-transform`}
              >
                <action.icon size={24} />
              </div>
              <span className="text-xs font-medium text-slate-600 text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-lg">
              {t("recent_activity_feed")}
            </h2>
            <button className="text-primary text-xs font-bold">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {myRecentVisits.length > 0 ? (
              myRecentVisits.map((visit) => {
                const company = mockCompanies.find((c) =>
                  c.locations.some((l) => l.id === visit.locationId)
                );
                const location = company?.locations.find(
                  (l) => l.id === visit.locationId
                );

                return (
                  <div
                    key={visit.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-primary shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 truncate">
                          {company?.name || "Unknown Company"}
                        </h3>
                        <span className="text-[10px] font-medium text-slate-400">
                          {format(new Date(visit.checkInTime), "HH:mm")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-2">
                        {location?.name}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(visit.objectives || []).slice(0, 2).map((obj) => (
                          <span
                            key={obj}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                          >
                            {t(`obj_${obj}` as any)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border-dashed border border-slate-200">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
