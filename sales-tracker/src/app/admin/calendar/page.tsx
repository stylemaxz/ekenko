"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Modal } from "@/components/ui/Modal";
import { mockVisits, mockCompanies, mockEmployees, Visit, VisitObjectives, VisitObjective } from "@/utils/mockData";
import Image from "next/image";
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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import clsx from "clsx";

type ViewType = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);

  const locale = language === 'th' ? th : enUS;

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
  const events = mockVisits.map(v => {
      const company = mockCompanies.find(c => c.locations.some(l => l.id === v.locationId));
      const location = company?.locations.find(l => l.id === v.locationId);
      const employee = mockEmployees.find(e => e.id === v.employeeId);
      
      return {
          ...v,
          customerName: company?.name || "Unknown Company",
          employeeName: employee?.name || "Unknown",
          province: location?.province || "Unknown",
          startTime: new Date(v.checkInTime),
      };
  });

  const getEventsForDay = (date: Date) => {
      return events.filter(e => isSameDay(e.startTime, date));
  };

  // Helper to get formatted objective label
  const getObjectiveLabel = (obj: string) => {
      return t(`obj_${obj}` as any) || obj;
  };

  // --- Renderers ---

  const renderHeader = () => {
    let dateFormat = "MMMM yyyy";
    if (view === 'day') dateFormat = "d MMMM yyyy";
    
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
              <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                  <button onClick={prev} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-600">
                      <ChevronLeft size={20} />
                  </button>
                  <span className="min-w-[140px] text-center font-bold text-slate-700 text-sm">
                      {format(currentDate, dateFormat, { locale })}
                  </span>
                  <button onClick={next} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-600">
                      <ChevronRight size={20} />
                  </button>
              </div>
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
                                            <div key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-1 rounded border border-indigo-100 font-medium truncate flex items-center gap-1 justify-between">
                                                <div className="flex items-center gap-1 truncate">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                                                    <span className="truncate">{prov}</span>
                                                </div>
                                                <span className="font-bold bg-indigo-100 text-indigo-800 px-1 rounded text-[9px]">{count}</span>
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
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group hover:border-indigo-300"
                        >
                            <div className="text-xs text-indigo-600 font-bold mb-1">
                                {format(event.startTime, "HH:mm")}
                            </div>
                            <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-700">
                                {event.customerName}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600">
                                    {event.employeeName.charAt(0)}
                                </div>
                                <span className="truncate">{event.employeeName}</span>
                            </div>
                        </div>
                    ))}
                    {dayEvents.length === 0 && (
                        <div className="h-full flex items-center justify-center text-xs text-slate-300 italic">
                            No visits
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
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex gap-4"
                     >
                         <div className="flex flex-col items-center">
                             <div className="text-sm font-bold text-slate-500 mb-2 whitespace-nowrap">
                                 {format(event.startTime, "HH:mm")}
                             </div>
                             <div className="w-0.5 h-full bg-slate-100 group-hover:bg-indigo-100 transition-colors relative min-h-[40px]">
                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                             </div>
                         </div>
                         
                         <div className="flex-1 pb-2">
                             <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">
                                 {event.customerName}
                             </h3>
                             <div className="flex flex-wrap items-center gap-2 mb-3">
                                 <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
                                    <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] font-bold">
                                        {event.employeeName.charAt(0)}
                                    </div>
                                    <span className="text-xs text-slate-600 font-medium">{event.employeeName}</span>
                                 </div>
                                 <span className="text-slate-300">•</span>
                                 <div className="flex gap-1 flex-wrap">
                                     {event.objectives?.slice(0, 3).map((obj: string, i: number) => (
                                         <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                                            {getObjectiveLabel(obj)}
                                         </span>
                                     ))}
                                     {(event.objectives?.length || 0) > 3 && (
                                         <span className="text-xs text-slate-400 pl-1">+{event.objectives.length - 3}</span>
                                     )}
                                 </div>
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
                         <p>No visits scheduled for this day</p>
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
                {/* Images */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                        {t('confirmation_images')} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {selectedVisit.images && selectedVisit.images.length > 0 ? (
                            selectedVisit.images.map((img: string, idx: number) => (
                                <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                                    <Image 
                                        src={img} 
                                        alt={`Visit ${idx + 1}`} 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-32 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                                No images
                            </div>
                        )}
                        {/* Mock Add Image Button (Visual Only) */}
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-white">
                            <Clock size={20} className="mb-1 opacity-50" /> 
                            <span className="text-xs">Add Image</span>
                        </div>
                    </div>
                </div>

                {/* Objectives */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                        {t('visit_objectives')} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2">
                         {VisitObjectives.map((obj) => (
                             <label key={obj} className={clsx(
                                 "flex items-center gap-3 p-3 border rounded-lg transition-colors",
                                 selectedVisit.objectives?.includes(obj) ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 opacity-60"
                             )}>
                                 <input 
                                    type="checkbox" 
                                    checked={selectedVisit.objectives?.includes(obj) || false} 
                                    readOnly
                                    disabled
                                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600"
                                 />
                                 <span className={clsx(
                                     "text-sm font-medium",
                                     selectedVisit.objectives?.includes(obj) ? "text-indigo-900" : "text-slate-500"
                                 )}>{getObjectiveLabel(obj)}</span>
                             </label>
                         ))}
                    </div>
                </div>

                {/* Met Owner */}
                <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">
                        {t('met_owner')} <span className="text-red-500">*</span>
                     </label>
                     <div className="flex gap-6">
                         <label className="flex items-center gap-2">
                             <input type="radio" checked={selectedVisit.metOwner === true} readOnly disabled className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600" />
                             <span className="text-slate-700 text-sm font-medium">{t('met_owner_yes')}</span>
                         </label>
                         <label className="flex items-center gap-2">
                             <input type="radio" checked={selectedVisit.metOwner === false} readOnly disabled className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600" />
                             <span className="text-slate-700 text-sm font-medium">{t('met_owner_no')}</span>
                         </label>
                     </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                        {t('notes_label')} <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-4 min-h-[100px] shadow-sm">
                        {selectedVisit.notes || "-"}
                    </div>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
}
