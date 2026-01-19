"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Modal } from "@/components/ui/Modal";
import { Visit, VisitObjective, VisitObjectives, Employee, Company, LeaveRequest } from "@/types";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isSameMonth, 
  isSameDay, 
} from "date-fns";
import { enUS, th } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";

type ViewType = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const { t, language } = useLanguage();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);

  // Data State
  const [visits, setVisits] = useState<Visit[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
      showCheckins: true,
      showLeaves: true,
  });

  const locale = language === 'th' ? th : enUS;

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [visitsRes, empRes, compRes, leavesRes] = await Promise.all([
          fetch('/api/visits'),
          fetch('/api/employees'),
          fetch('/api/companies'),
          fetch('/api/leave-requests'),
        ]);
        if (visitsRes.ok) {
          const visitsData = await visitsRes.json();
          setVisits(visitsData);
        }
        if (leavesRes.ok) {
           const leavesData = await leavesRes.json();
           setLeaveRequests(leavesData);
        }
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData.filter((e: Employee) => e.role === 'sales'));
        }
        if (compRes.ok) setCompanies(await compRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [visitsRes, leavesRes] = await Promise.all([
          fetch('/api/visits'),
          fetch('/api/leave-requests')
      ]);
      
      if (visitsRes.ok) {
        const visitsData = await visitsRes.json();
        setVisits(visitsData);
      }
      if (leavesRes.ok) {
          const leavesData = await leavesRes.json();
          setLeaveRequests(leavesData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };


  // --- Date Logic ---
  
  const next = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const today = () => setCurrentDate(new Date());

  // --- Data Preparation ---
  const events = [
    ...(filters.showCheckins ? visits.map(v => {
      const company = companies.find(c => c.locations.some(l => l.id === v.locationId));
      const location = company?.locations.find(l => l.id === v.locationId);
      const employee = employees.find(e => e.id === v.employeeId);
      
      return {
          id: v.id,
          type: 'visit',
          customerName: company?.name || t('unknown_company'),
          employeeName: employee?.name || t('unknown'),
          province: location?.province || t('unknown'),
          startTime: new Date(v.checkInTime),
          objectives: v.objectives,
          images: v.images,
          metOwner: v.metOwner,
          notes: v.notes,
          locationId: v.locationId,
      };
    }) : []),
    ...(filters.showLeaves ? leaveRequests.filter(l => l.status === 'approved').flatMap(l => {
        const employee = employees.find(e => e.id === l.employeeId);
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const days = [];
        let current = start;

        while (current <= end) {
            days.push({
                id: l.id,
                type: 'leave',
                leaveType: l.type,
                employeeName: employee?.name || t('unknown'),
                startTime: new Date(current), // Clone for specific day
                notes: l.reason,
                days: l.days,
                customerName: t('leave'), // For sorting/display consistency
                province: 'Leave', // For grouping
            });
            current = addDays(current, 1);
        }
        return days;
    }) : [])
  ];

  const getEventsForDay = (date: Date) => {
      return events.filter(e => isSameDay(e.startTime, date));
  };

  // Helper to get formatted objective label
  const getObjectiveLabel = (obj: string) => {
      return t(`obj_${obj}` as any) || obj;
  };
    // Helper to get formatted leave type
  const getLeaveTypeLabel = (type: string) => {
      const key = `leave_type_${type}`; // Make sure these keys exist in translation
      return t(key as any) || type;
  };


  // --- Renderers ---

  const renderHeader = () => {
    let dateFormat = "MMMM yyyy";
    if (view === 'day') dateFormat = "d MMMM yyyy";
    
    return (
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">{t('calendar_title')}</h1>
             <p className="text-slate-500 text-sm">{t('calendar_subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <button 
                onClick={() => setView('month')}
                className={clsx("px-3 py-1.5 rounded-md text-sm font-medium transition-all", view === 'month' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
             >
                {t('view_month')}
             </button>
             <button 
                onClick={() => setView('week')}
                className={clsx("px-3 py-1.5 rounded-md text-sm font-medium transition-all", view === 'week' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
             >
                {t('view_week')}
             </button>
             <button 
                onClick={() => setView('day')}
                className={clsx("px-3 py-1.5 rounded-md text-sm font-medium transition-all", view === 'day' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
             >
                {t('view_day')}
             </button>
          </div>

          <div className="flex items-center gap-4">
              <button onClick={today} className="text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors">
                  {t('today')}
              </button>
              <button 
                  onClick={refreshData} 
                  disabled={loading}
                  className="text-sm font-semibold text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                  <svg className={clsx("w-4 h-4", loading && "animate-spin")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? t('loading') : t('refresh')}
              </button>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                  <button onClick={prev} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-600">
                      <ChevronLeft size={20} />
                  </button>
                  
                  <div 
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="min-w-[140px] text-center font-bold text-slate-700 text-sm cursor-pointer hover:bg-slate-50 py-1.5 rounded-md transition-colors relative"
                  >
                      {format(currentDate, dateFormat, { locale })}
                      <input 
                        ref={dateInputRef}
                        type="date"
                        className="opacity-0 absolute inset-0 w-full h-full pointer-events-none"
                        value={format(currentDate, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            if (e.target.value) {
                                setCurrentDate(new Date(e.target.value));
                            }
                        }}
                      />
                  </div>

                  <button onClick={next} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-600">
                      <ChevronRight size={20} />
                  </button>
              </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm w-fit">
            <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wide">{t('filters') || 'FILTERS'}</span>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition-colors">
                <input 
                    type="checkbox" 
                    checked={filters.showCheckins}
                    onChange={(e) => setFilters(prev => ({ ...prev, showCheckins: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-sm font-medium text-slate-700">{t('check_ins') || 'Check-ins'}</span>
            </label>
            <div className="w-px h-4 bg-slate-200"></div>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition-colors">
                <input 
                    type="checkbox" 
                    checked={filters.showLeaves}
                    onChange={(e) => setFilters(prev => ({ ...prev, showLeaves: e.target.checked }))}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium text-slate-700">{t('leaves') || 'Leaves'}</span>
            </label>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);
      
      const dateFormat = "d";
      const rows = [];
      let days = [];
      let day = startDate;
      let formattedDate = "";

      const weekDays = [];
      for (let i = 0; i < 7; i++) {
          weekDays.push(
              <div key={i} className="text-xs font-bold text-slate-400 uppercase text-center py-2 bg-slate-50 h-10 flex items-center justify-center">
                  {format(addDays(startDate, i), "EEE", { locale })}
              </div>
          );
      }

      while (day <= endDate) {
          for (let i = 0; i < 7; i++) {
              formattedDate = format(day, dateFormat);
              const cloneDay = day;
              const dayEvents = getEventsForDay(cloneDay);
              
              days.push(
                  <div 
                      key={day.toString()} 
                      className={clsx(
                          "min-h-[120px] border-b border-r border-slate-100 p-2 transition-colors relative group",
                          !isSameMonth(day, monthStart) ? "bg-slate-50/50 text-slate-300" : "bg-white",
                          isSameDay(day, new Date()) ? "bg-indigo-50/10" : "hover:bg-slate-50 cursor-pointer"
                      )}
                      onClick={() => { setCurrentDate(cloneDay); setView('day'); }}
                    >
                        <div className="flex justify-between items-start">
                          <span className={clsx(
                              "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1",
                              isSameDay(day, new Date()) ? "bg-indigo-600 text-white shadow-md" : "text-slate-700"
                          )}>
                              {formattedDate}
                          </span>
                        </div>
                        
                        {/* Events List (Grouped by Province) */}
                        <div className="space-y-1 mt-1">
                            {(() => {
                                const provCounts = dayEvents.reduce((acc, ev) => {
                                    const p = ev.province || "N/A";
                                    acc[p] = (acc[p] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>);
                                
                                const sortedProvs = Object.entries(provCounts).sort((a, b) => b[1] - a[1]);
                                
                                return (
                                    <>
                                        {sortedProvs.slice(0, 4).map(([prov, count], idx) => (
                                            <div 
                                                key={idx} 
                                                className={clsx(
                                                    "text-[10px] px-1.5 py-1 rounded border font-medium truncate flex items-center gap-1 justify-between",
                                                    prov === 'Leave' 
                                                        ? "bg-amber-50 text-amber-700 border-amber-100" 
                                                        : "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-1 truncate">
                                                    <div className={clsx(
                                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                                        prov === 'Leave' ? "bg-amber-400" : "bg-indigo-400"
                                                    )}></div>
                                                    <span className="truncate">{prov === 'Leave' ? t('leaves') : prov}</span>
                                                </div>
                                                <span className={clsx(
                                                    "font-bold px-1 rounded text-[9px]",
                                                    prov === 'Leave' ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
                                                )}>{count}</span>
                                            </div>
                                        ))}
                                        {sortedProvs.length > 4 && (
                                            <div className="text-[10px] text-slate-400 font-medium pl-1">
                                                + {sortedProvs.length - 4} more
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
              );
              day = addDays(day, 1);
          }
          rows.push(
              <div className="grid grid-cols-7" key={day.toString()}>
                  {days}
              </div>
          );
          days = [];
      }

      return (
          <div className="card !p-0 overflow-hidden border border-slate-200">
              <div className="grid grid-cols-7 border-b border-slate-200">
                  {weekDays}
              </div>
              <div>{rows}</div>
          </div>
      );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const dayList = [];

    for (let i = 0; i < 7; i++) {
        const current = addDays(startDate, i);
        const dayEvents = getEventsForDay(current);
        const isToday = isSameDay(current, new Date());

        dayList.push(
            <div key={i} className="flex-1 min-w-[140px] border-r border-slate-200 last:border-r-0 flex flex-col h-[600px]">
                {/* Header */}
                <div className={clsx("p-3 text-center border-b border-slate-200", isToday ? "bg-indigo-50" : "bg-white")}>
                    <div className={clsx("text-xs font-bold uppercase mb-1", isToday ? "text-indigo-600" : "text-slate-400")}>
                        {format(current, "EEE", { locale })}
                    </div>
                    <div className={clsx("text-xl font-bold", isToday ? "text-indigo-700" : "text-slate-700")}>
                        {format(current, "d")}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-2 space-y-2 bg-slate-50/30 overflow-y-auto">
                    {dayEvents.map((event, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedVisit(event)}
                          className={clsx(
                              "p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer group",
                              event.type === 'leave' 
                                ? "bg-amber-50 border-amber-100 hover:border-amber-300" 
                                : "bg-white border-slate-200 hover:border-indigo-300"
                          )}
                        >
                            <div className={clsx(
                                "text-xs font-bold mb-1",
                                event.type === 'leave' ? "text-amber-600" : "text-indigo-600"
                            )}>
                                {format(event.startTime, "HH:mm")}
                            </div>
                            <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-amber-700">
                                {event.type === 'leave' ? getLeaveTypeLabel((event as any).leaveType) : event.customerName}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                <div className={clsx(
                                    "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold",
                                    event.type === 'leave' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"
                                )}>
                                    {event.employeeName.charAt(0)}
                                </div>
                                <span className="truncate">{event.employeeName}</span>
                            </div>
                        </div>
                    ))}
                    {dayEvents.length === 0 && (
                        <div className="h-full flex items-center justify-center text-xs text-slate-300 italic">
                            {t('no_visits')}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="card !p-0 overflow-x-auto border border-slate-200">
            <div className="flex min-w-[1000px]">
                {dayList}
            </div>
        </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);

    return (
        <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
             <div className="bg-white p-4 border-b border-slate-200 shadow-sm flex items-center justify-between">
                 <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        {format(currentDate, "EEEE, d MMMM yyyy", { locale })}
                    </h2>
                 </div>
                 <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                     {dayEvents.length} {t('visits') || "visits"}
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {dayEvents.map((event, idx) => (
                     <div 
                        key={idx} 
                        onClick={() => setSelectedVisit(event)}
                        className={clsx(
                            "rounded-xl border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex gap-4",
                            event.type === 'leave' 
                                ? "bg-amber-50/60 border-amber-200 hover:border-amber-300" 
                                : "bg-white border-slate-200 hover:border-indigo-200"
                        )}
                     >
                         <div className="flex flex-col items-center">
                             <div className="text-sm font-bold text-slate-500 mb-2 whitespace-nowrap">
                                 {format(event.startTime, "HH:mm")}
                             </div>
                             <div className={clsx(
                                 "w-0.5 h-full transition-colors relative min-h-[40px]",
                                 event.type === 'leave' ? "bg-amber-200" : "bg-slate-100 group-hover:bg-indigo-100"
                             )}>
                                 <div className={clsx(
                                     "absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ring-4 ring-white",
                                     event.type === 'leave' ? "bg-amber-500" : "bg-indigo-500"
                                 )}></div>
                             </div>
                         </div>
                         
                         <div className="flex-1 pb-2">
                             <h3 className={clsx(
                                 "text-lg font-bold text-slate-800 mb-1 transition-colors",
                                 event.type === 'leave' ? "group-hover:text-amber-700" : "group-hover:text-indigo-700"
                             )}>
                                 {event.customerName}
                             </h3>
                             <div className="flex flex-wrap items-center gap-2 mb-3">
                                 <div className={clsx(
                                     "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
                                     event.type === 'leave' ? "bg-amber-100" : "bg-slate-100"
                                 )}>
                                    <div className={clsx(
                                        "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                                        event.type === 'leave' ? "bg-amber-200 text-amber-700" : "bg-indigo-100 text-indigo-600"
                                    )}>
                                        {event.employeeName.charAt(0)}
                                    </div>
                                    <span className="text-xs text-slate-600 font-medium">{event.employeeName}</span>
                                 </div>
                                 <span className="text-slate-300">•</span>
                                 {event.type === 'visit' && (
                                     <div className="flex gap-1 flex-wrap">
                                         {(event as any).objectives?.slice(0, 3).map((obj: string, i: number) => (
                                             <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                                                {getObjectiveLabel(obj)}
                                             </span>
                                         ))}
                                         {((event as any).objectives?.length || 0) > 3 && (
                                             <span className="text-xs text-slate-400 pl-1">+{(event as any).objectives.length - 3}</span>
                                         )}
                                     </div>
                                 )}
                             </div>
                             
                             {event.notes && (
                                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-600 text-sm italic">
                                     "{event.notes}"
                                 </div>
                             )}
                         </div>
                     </div>
                 ))}
                 {dayEvents.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                         <CalendarIcon size={48} className="mb-2 opacity-50" />
                         <p>{t('no_visits_day')}</p>
                     </div>
                 )}
             </div>
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-[1600px] mx-auto w-full">
      {renderHeader()}

      <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
      </div>

      {/* Visit Details Modal */}
      <Modal
        isOpen={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        title={t('visit_details')}
        width="max-w-xl"
        footer={
            <button 
                onClick={() => setSelectedVisit(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
            >
                {t('close')}
            </button>
        }
      >
        {selectedVisit && (
            <div className="space-y-6">
                {selectedVisit.type === 'leave' ? (
                     <div className="space-y-4">
                        <div>
                            <span className="text-xs text-slate-500 block mb-1">{t('leave_type')}</span>
                            <div className="font-medium text-slate-800 flex items-center gap-2">
                                {getLeaveTypeLabel((selectedVisit as any).leaveType)}
                                 {/* Days count */}
                                {(selectedVisit as any).days && (
                                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {(selectedVisit as any).days} {t('days')}
                                    </span>
                                )}
                            </div>
                        </div>
                         <div>
                            <span className="text-xs text-slate-500 block mb-1">{t('reason')}</span>
                            <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {(selectedVisit as any).notes || "-"}
                            </div>
                        </div>
                     </div>
                ) : (
                    <>
                        {/* Images */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">
                                {t('confirmation_images')} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {(selectedVisit as any).images && (selectedVisit as any).images.length > 0 ? (
                                    (selectedVisit as any).images.map((img: string, idx: number) => (
                                        <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                                            <Image 
                                                src={img} 
                                                alt={`Visit ${idx + 1}`} 
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-32 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                                        {t('no_images')}
                                    </div>
                                )}
                                {/* Mock Add Image Button (Visual Only) */}
                                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-white">
                                    <Clock size={20} className="mb-1 opacity-50" /> 
                                    <span className="text-xs">{t('add_image')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Objectives */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">{t('visit_objectives')}</label>
                            <div className="flex flex-wrap gap-2">
                                {(selectedVisit as any).objectives?.map((obj: string) => (
                                    <span key={obj} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-100">
                                        {t(`obj_${obj}` as any)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Met Owner Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">{t('met_owner')}</label>
                            <div className={clsx(
                                "flex items-center gap-2 p-3 rounded-lg border",
                                (selectedVisit as any).metOwner 
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                    : "bg-rose-50 border-rose-100 text-rose-700"
                            )}>
                                {(selectedVisit as any).metOwner ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                <span className="font-medium">
                                    {(selectedVisit as any).metOwner ? t('met_owner_yes') : t('met_owner_no')}
                                </span>
                            </div>
                        </div>

                         {(selectedVisit as any).notes && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">{t('notes_label')}</label>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-sm">
                                    {(selectedVisit as any).notes}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}
      </Modal>
    </div>
  );
}
