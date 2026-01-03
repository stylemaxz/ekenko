"use client";

import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { FileText, Download, BarChart, Calendar as CalendarIcon, Filter, Search } from "lucide-react";
import { Visit, VisitObjective, Employee, Company } from "@/types";
import { clsx } from "clsx";

export default function ReportsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [filterText, setFilterText] = useState("");
  
  // Data State
  const [visits, setVisits] = useState<Visit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        const [visitsRes, empRes, compRes] = await Promise.all([
          fetch('/api/visits'),
          fetch('/api/employees'),
          fetch('/api/companies'),
        ]);
        if (visitsRes.ok) setVisits(await visitsRes.json());
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData.filter((e: Employee) => e.role === 'sales'));
        }
        if (compRes.ok) setCompanies(await compRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  const handleExport = () => {
    if (filteredData.length === 0) {
        showToast("No data to export", "error");
        return;
    }

    showToast(t('export_csv') + "...", "info");

    // Generate CSV Content
    const headers = [t('date'), t('time'), t('employee'), t('customer'), t('province'), t('status'), t('type')];
    const csvContent = [
        headers.join(","),
        ...filteredData.map(row => [
            row.date,
            row.time,
            `"${row.employee}"`,
            `"${row.customer}"`,
            `"${row.province}"`,
            row.status,
            `"${row.type}"`
        ].join(","))
    ].join("\n");

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `visits_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(t('save_success'), "success");
    }
  };

  // Helper to translate objectives
  const getObjectiveLabel = (obj: VisitObjective) => {
      return t(`obj_${obj}` as any) || obj;
  };

  // Enrich data for export table
  const reportData = useMemo(() => {
    return visits.map(visit => {
        const employee = employees.find(e => e.id === visit.employeeId);
        let customerName = "Unknown";
        let province = "Unknown";
        let status = "Unknown"; // e.g., New vs Existing
        let statusKey = "";
        
        // Find Company
        companies.forEach(c => {
             const location = c.locations.find(l => l.id === visit.locationId);
             if(location) {
                 customerName = c.name;
                 // Use provinceTH if available and language is Thai, otherwise province default (English usually)
                 // But wait, the mockData might not have provinceTH populated fully yet or the interface might be missing it in some parts.
                 // For now, let's just use 'province' property which is the main one. 
                 // If we want bilingual support here we should ideally check locale. 
                 // As per previous context, we just added 'province'. 
                 province = location.province || "Unknown";
                 
                 statusKey = c.status === 'lead' ? 'status_new' : 'status_existing';
             }
        });

        // Translate Status
        const objectivesStr = (visit.objectives || []).map(o => getObjectiveLabel(o)).join(", ");

        return {
            date: new Date(visit.checkInTime).toLocaleDateString(),
            time: new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            employee: employee?.name || "Unknown",
            customer: customerName,
            province: province,
            statusKey: statusKey, // Keep key for styling
            status: statusKey ? t(statusKey as any) : "Unknown", // Translated status
            type: objectivesStr,
            rawDate: new Date(visit.checkInTime),
        };
      }).sort((a,b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [visits, employees, companies, t]); // Re-calc if language changes

  // Filter Data
  const filteredData = useMemo(() => {
      if (!filterText) return reportData;
      const lowerFilter = filterText.toLowerCase();
      
      return reportData.filter(row => 
          row.employee.toLowerCase().includes(lowerFilter) ||
          row.customer.toLowerCase().includes(lowerFilter) ||
          row.province.toLowerCase().includes(lowerFilter) ||
          row.status.toLowerCase().includes(lowerFilter) ||
          row.type.toLowerCase().includes(lowerFilter) ||
          row.date.includes(lowerFilter)
      );
  }, [reportData, filterText]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('reports_title')}</h1>
          <p className="text-slate-500 text-sm">{t('reports_subtitle')}</p>
        </div>
        
        <button onClick={handleExport} className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all">
             <Download size={18} />
             {t('export_csv')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         {/* Report Card 1 */}
         <div onClick={() => showToast(t('daily_desc'), "info")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                     <CalendarIcon size={24} />
                 </div>
                 <div>
                     <h3 className="font-bold text-slate-800 text-lg">{t('daily_summary')}</h3>
                     <p className="text-xs text-slate-500">{t('daily_desc')}</p>
                 </div>
                 <div className="ml-auto">
                     <Download className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={20} />
                 </div>
             </div>
         </div>

         {/* Report Card 2 */}
         <div onClick={() => showToast(t('performance_desc'), "info")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                     <BarChart size={24} />
                 </div>
                 <div>
                     <h3 className="font-bold text-slate-800 text-lg">{t('performance_report')}</h3>
                     <p className="text-xs text-slate-500">{t('performance_desc')}</p>
                 </div>
                 <div className="ml-auto">
                     <Download className="text-slate-300 group-hover:text-emerald-600 transition-colors" size={20} />
                 </div>
             </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <FileText className="text-indigo-500" size={20} />
                {t('visit_history')}
            </h2>
            <div className="relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder={t('search_customers') || "Search..."} // fallback
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all w-full sm:w-64"
                 />
            </div>
         </div>

         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-200">
                         <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('date')}</th>
                         <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('time')}</th>
                         <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('employee')}</th>
                         <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('customer')}</th>
                         <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('province')}</th>
                         <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('status')}</th>
                         <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('type')}</th>
                     </tr>
                 </thead>
                 <tbody className="text-sm text-slate-600">
                     {filteredData.length > 0 ? (
                         filteredData.map((row, idx) => (
                             <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                 <td className="py-4 px-6 font-mono text-xs">{row.date}</td>
                                 <td className="py-4 px-6 text-slate-400 text-xs">{row.time}</td>
                                 <td className="py-4 px-6 font-medium text-slate-900 flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                         {row.employee.charAt(0)}
                                     </div>
                                     {row.employee}
                                 </td>
                                 <td className="py-4 px-6 font-medium">{row.customer}</td>
                                 <td className="py-4 px-6 font-medium text-slate-500">{row.province}</td>
                                 <td className="py-4 px-6">
                                     <span className={clsx(
                                         "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                                         row.statusKey === 'status_new' ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"
                                         )}>
                                         {row.status}
                                     </span>
                                 </td>
                                 <td className="py-4 px-6 max-w-[200px] truncate text-slate-500" title={row.type}>
                                     {row.type}
                                 </td>
                             </tr>
                         ))
                     ) : (
                         <tr>
                             <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                                 No data matches your search.
                             </td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>
         
         <div className="p-4 border-t border-slate-100 bg-slate-50 text-right text-xs text-slate-400">
             Displaying {filteredData.length} visits
         </div>
      </div>
    </div>
  );
}
