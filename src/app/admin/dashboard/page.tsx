"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Filter, 
  ChevronRight,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Target,
  UserPlus
} from "lucide-react";
import { mockVisits, mockEmployees, mockCompanies, Visit, Employee, Company } from "@/utils/mockData";
import { clsx } from "clsx";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const { t } = useLanguage();

  // Date Range State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Initialize date on client side only
  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setLastUpdated(now.toLocaleTimeString());
    
    // Default range: Beginning of month to End of month
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(end));
  }, []);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Helper to check if date is in selected range
  const isInRange = (dateString: string) => {
    if (!startDate || !endDate) return true;
    const date = new Date(dateString).getTime();
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  // --- METRIC CALCULATIONS ---

  // 1. Existing Customer Coverage % (Location-based)
  const coverageData = mockEmployees.map(emp => {
    // Find visits by this employee within range
    const empVisits = mockVisits.filter(v => v.employeeId === emp.id && isInRange(v.checkInTime));
    
    // Find unique locations visited belonging to 'existing' companies
    const uniqueLocationsVisited = new Set<string>();
    
    empVisits.forEach(v => {
      // Find company for this location
      const company = mockCompanies.find(c => c.locations.some(l => l.id === v.locationId));
      if (company && company.status === 'existing') {
        uniqueLocationsVisited.add(v.locationId);
      }
    });

    const visitedCount = uniqueLocationsVisited.size;
    const totalAssigned = emp.portfolioSize || 1; // Total target locations assigned
    const percentage = Math.round((visitedCount / totalAssigned) * 100);

    return {
      ...emp,
      coverage: {
        visited: visitedCount,
        total: totalAssigned,
        percentage
      }
    };
  }).sort((a, b) => b.coverage.percentage - a.coverage.percentage);

  // 2. New Prospect Visits (Monthly)
  const huntingData = mockEmployees.map(emp => {
     // Find visits by this employee in selected range
    const empVisits = mockVisits.filter(v => v.employeeId === emp.id && isInRange(v.checkInTime));
    
    // Count visits to locations belonging to 'lead' companies
    let leadVisitCount = 0;
    empVisits.forEach(v => {
      const company = mockCompanies.find(c => c.locations.some(l => l.id === v.locationId));
      if (company && company.status === 'lead') {
        leadVisitCount++;
      }
    });

    return {
      ...emp,
      huntingCount: leadVisitCount
    }
  }).sort((a, b) => b.huntingCount - a.huntingCount);


  // --- FEED PREPARATION ---
  
  // Enrich visits with related data for the feed
  const enrichedVisits = mockVisits.map(visit => {
    const employee = mockEmployees.find(e => e.id === visit.employeeId);
    let locationName = "Unknown Location";
    let companyName = "Unknown Company";
    let companyStatus = "existing";
    
    mockCompanies.forEach(c => {
        const foundLoc = c.locations.find(l => l.id === visit.locationId);
        if (foundLoc) {
            locationName = foundLoc.name;
            companyName = c.name;
            companyStatus = c.status;
        }
    });

    return {
      ...visit,
      employeeName: employee?.name || "Unknown",
      locationName,
      companyName,
      companyStatus
    };
  }).sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

  // Filter feed
  const filteredVisits = enrichedVisits.filter(v => {
    if (selectedEmployee !== "all" && v.employeeId !== selectedEmployee) return false;
    if (!isInRange(v.checkInTime)) return false;
    return true;
  }).slice(0, 20); // Limit to 20 latest activities

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('manager_dashboard')}</h1>
          <p className="text-slate-500 text-sm">{t('dashboard_subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
                {t('last_updated')}: {lastUpdated}
             </div>
        </div>
      </div>

      {/* --- BANNER 1: EXISTING CUSTOMER COVERAGE --- */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                <Target size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">{t('existing_coverage')}</h2>
                <p className="text-sm text-slate-500">{t('coverage_subtitle')}</p>
            </div>
        </div>

        <div className="space-y-4">
            {coverageData.map((data) => (
                <div key={data.id} className="relative">
                    <div className="flex justify-between items-end mb-1 text-sm">
                        <div className="font-semibold text-slate-700 flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                {data.name.charAt(0)}
                             </div>
                             {data.name}
                        </div>
                        <div className="font-bold text-blue-700">
                            {data.coverage.visited} / {data.coverage.total} <span className="text-slate-400 text-xs font-normal ml-1">({data.coverage.percentage}%)</span>
                        </div>
                    </div>
                    {/* Progress Track */}
                    <div className="h-3 w-full bg-blue-200/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${data.coverage.percentage}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- BANNER 2: NEW PROSPECT VISITS (MONTHLY) --- */}
      <div className="card bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-200">
                <UserPlus size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">{t('prospect_hunting')}</h2>
                <p className="text-sm text-slate-500">{t('hunting_subtitle')}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {huntingData.map((data, index) => (
                <div key={data.id} className="bg-white/60 p-4 rounded-xl border border-emerald-100/50 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-lg text-slate-500">#{index + 1}</div>
                        <div>
                            <div className="font-semibold text-slate-800">{data.name}</div>
                            <div className="text-xs text-slate-500">{t('sales_rep')}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">{data.huntingCount}</div>
                        <div className="text-[10px] font-bold text-emerald-800/50 uppercase">{t('visits')}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>


      {/* --- ACTIVITY FEED SECTION --- */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Helper/Filter Sidebar for Feed */}
        <div className="w-full md:w-64 space-y-4">
            <div className="card sticky top-24">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Filter size={18} />
                    {t('feed_filter')}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Employee</label>
                        <select 
                            className="input appearance-none w-full"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="all">{t('all_employees')}</option>
                            {mockEmployees.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                    
                     <div className="pt-4 border-t border-slate-100 space-y-3">
                         <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">{t('start_date') || "Start Date"}</label>
                            <input 
                                type="date" 
                                className="input w-full text-sm"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">{t('end_date') || "End Date"}</label>
                            <input 
                                type="date" 
                                className="input w-full text-sm"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                         </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-sm mb-2">
                             <span className="text-slate-600">{t('total_activities')}</span>
                             <span className="font-bold">{filteredVisits.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 card">
             <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Clock className="text-primary" size={20} />
                {t('recent_activity')}
            </h2>

            <div className="space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-100"></div>

                {filteredVisits.map((visit) => (
                    <div key={visit.id} className="relative pl-16 py-3">
                        {/* Time Bubble */}
                        <div className="absolute left-2 top-3 w-8 h-8 rounded-full bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-600 z-10">
                            {new Date(visit.checkInTime).getHours()}:
                            {new Date(visit.checkInTime).getMinutes().toString().padStart(2, '0')}
                        </div>

                        <div className="card shadow-sm hover:shadow-md transition-all border border-slate-100 bg-white p-5 group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={clsx(
                                            "badge border",
                                            visit.companyStatus === 'lead' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                            visit.companyStatus === 'existing' ? "bg-green-50 text-green-600 border-green-100" :
                                            (visit.companyStatus === 'closed' || visit.companyStatus === 'inactive' || visit.companyStatus === 'terminate') ? "bg-red-50 text-red-600 border-red-100" :
                                            "bg-slate-50 text-slate-500 border-slate-200"
                                        )}>
                                            {t(`status_${visit.companyStatus}` as any)}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(visit.checkInTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        {visit.companyName}
                                        <span className="text-slate-400 font-normal text-sm">@ {visit.locationName}</span>
                                    </h3>
                                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{visit.employeeName}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{t('checked_in')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100/50 text-sm">
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {(visit.objectives || []).map(p => (
                                        <span key={p} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm text-slate-600">
                                            {t(`obj_${p}` as any)}
                                        </span>
                                    ))}
                                </div>
                                {visit.notes && <p className="text-slate-600 italic">"{visit.notes}"</p>}
                            </div>

                            {visit.images && visit.images.length > 0 && (
                                <div className="mt-3 flex gap-2">
                                    {visit.images.map((img, idx) => (
                                        <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors relative">
                                            <Image
                                                src={img} 
                                                alt={`Proof ${idx + 1}`} 
                                                className="object-cover"
                                                fill
                                                unoptimized
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
