"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { mockActivityLogs, ActivityLog, ActivityType, mockEmployees } from "@/utils/mockData";
import { format } from "date-fns";
import { th, enUS } from "date-fns/locale";
import { 
  Activity, 
  UserPlus, 
  LogIn, 
  LogOut, 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle,
  Edit,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { clsx } from "clsx";

export default function ActivityLogsPage() {
  const { t, language } = useLanguage();
  const locale = language === "th" ? th : enUS;

  const [logs] = useState<ActivityLog[]>(mockActivityLogs);
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Initialize dates
  // Initialize dates on client side only to prevent hydration mismatch
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const isInRange = (dateString: string) => {
    if (!startDate || !endDate) return true;
    const date = new Date(dateString).getTime();
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (selectedEmployee !== 'all' && log.employeeId !== selectedEmployee) return false;
    if (!isInRange(log.timestamp)) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'customer_created':
        return <UserPlus size={18} className="text-teal-600" />;
      case 'customer_status_changed':
        return <Edit size={18} className="text-indigo-600" />;
      case 'check_in':
        return <MapPin size={18} className="text-purple-600" />;
      case 'clock_in':
        return <LogIn size={18} className="text-green-600" />;
      case 'clock_out':
        return <LogOut size={18} className="text-slate-600" />;
      case 'leave_requested':
        return <FileText size={18} className="text-amber-600" />;
      case 'leave_approved':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'leave_rejected':
        return <XCircle size={18} className="text-red-600" />;
      case 'task_created':
      case 'task_completed':
        return <Activity size={18} className="text-blue-600" />;
      default:
        return <Activity size={18} className="text-slate-600" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'customer_created':
        return 'bg-teal-50 border-teal-100';
      case 'customer_status_changed':
        return 'bg-indigo-50 border-indigo-100';
      case 'check_in':
        return 'bg-purple-50 border-purple-100';
      case 'clock_in':
        return 'bg-green-50 border-green-100';
      case 'clock_out':
        return 'bg-slate-50 border-slate-100';
      case 'leave_requested':
        return 'bg-amber-50 border-amber-100';
      case 'leave_approved':
        return 'bg-green-50 border-green-100';
      case 'leave_rejected':
        return 'bg-red-50 border-red-100';
      case 'task_created':
      case 'task_completed':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  const activityTypes: { value: ActivityType | 'all'; label: string }[] = [
    { value: 'all', label: language === 'th' ? 'ทั้งหมด' : 'All' },
    { value: 'clock_in', label: language === 'th' ? 'เข้างาน' : 'Clock In' },
    { value: 'clock_out', label: language === 'th' ? 'ออกงาน' : 'Clock Out' },
    { value: 'check_in', label: language === 'th' ? 'เช็คอิน' : 'Check-in' },
    { value: 'customer_created', label: language === 'th' ? 'สร้างลูกค้า' : 'Customer Created' },
    { value: 'customer_status_changed', label: language === 'th' ? 'เปลี่ยนสถานะ' : 'Status Changed' },
    { value: 'leave_requested', label: language === 'th' ? 'ขอลา' : 'Leave Request' },
  ];

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {language === 'th' ? 'บันทึกกิจกรรม' : 'Activity Logs'}
        </h1>
        <p className="text-slate-600 text-sm">
          {language === 'th' ? 'ติดตามความเคลื่อนไหวทั้งหมดในระบบ' : 'Track all system activities'}
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">{logs.length}</div>
          <div className="text-xs text-slate-600 mt-1">
            {language === 'th' ? 'กิจกรรมทั้งหมด' : 'Total Activities'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.type === 'clock_in').length}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {language === 'th' ? 'เข้างาน' : 'Clock Ins'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-2xl font-bold text-indigo-600">
            {logs.filter(l => l.type === 'check_in').length}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {language === 'th' ? 'เช็คอิน' : 'Check-ins'}
          </div>
        </div>
      </div>

      {/* Advanced Filter (Date & Employee) */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Filter size={18} />
            {language === 'th' ? 'ตัวกรอง' : 'Filters'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">{language === 'th' ? 'พนักงาน' : 'Employee'}</label>
                <select 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={selectedEmployee}
                    onChange={(e) => { setSelectedEmployee(e.target.value); setCurrentPage(1); }}
                >
                    <option value="all">{language === 'th' ? 'พนักงานทั้งหมด' : 'All Employees'}</option>
                    {mockEmployees.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
             </div>
             <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">{language === 'th' ? 'วันที่เริ่มต้น' : 'Start Date'}</label>
                <input 
                    type="date" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                />
             </div>
             <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">{language === 'th' ? 'วันที่สิ้นสุด' : 'End Date'}</label>
                 <input 
                    type="date" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                />
             </div>
        </div>
      </div>

       {/* Type Tags Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-600" />
          <span className="text-sm font-medium text-slate-700">
            {language === 'th' ? 'กรองตามประเภท' : 'Filter by Type'}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {activityTypes.map(type => (
            <button
              key={type.value}
              onClick={() => {
                setFilterType(type.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                filterType === type.value
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3 mb-6">
        {paginatedLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity size={40} className="mx-auto mb-2 opacity-20" />
            <p>{language === 'th' ? 'ไม่พบกิจกรรม' : 'No activities found'}</p>
          </div>
        ) : (
          paginatedLogs.map((log, index) => (
            <div
              key={log.id}
              className={clsx(
                "bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow",
                getActivityColor(log.type)
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {getActivityIcon(log.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-slate-900">{log.description}</p>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {format(new Date(log.timestamp), "HH:mm", { locale })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-medium">{log.employeeName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(log.timestamp), "d MMM yyyy", { locale })}
                    </span>
                  </div>

                  {/* Metadata */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 p-2 bg-white/50 rounded-lg border border-slate-100">
                      <div className="text-xs space-y-1">
                        {log.metadata.note && (
                          <div>
                            <span className="font-medium text-slate-700">
                              {language === 'th' ? 'หมายเหตุ: ' : 'Note: '}
                            </span>
                            <span className="text-slate-600">{log.metadata.note}</span>
                          </div>
                        )}
                        {log.metadata.oldStatus && log.metadata.newStatus && (
                          <div>
                            <span className="text-slate-600">
                              {log.metadata.oldStatus} → {log.metadata.newStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-600">
            {language === 'th' 
              ? `แสดง ${startIndex + 1}-${Math.min(endIndex, filteredLogs.length)} จาก ${filteredLogs.length} รายการ`
              : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredLogs.length)} of ${filteredLogs.length} items`
            }
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={clsx(
                "p-2 rounded-lg border transition-colors",
                currentPage === 1
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              )}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-slate-700 px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={clsx(
                "p-2 rounded-lg border transition-colors",
                currentPage === totalPages
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              )}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
