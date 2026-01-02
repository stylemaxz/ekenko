"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon,
  MapPin,
  Building2,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { mockTasks, mockCompanies, mockEmployees, Task } from "@/utils/mockData";
import { clsx } from "clsx";
import { format } from "date-fns";
import { enUS, th } from "date-fns/locale";

export default function SaleTasksPage() {
  const { t, language } = useLanguage();
  const locale = language === "th" ? th : enUS;

  // Mock Current User (Sales Rep)
  const currentUserId = "1"; // In reality, get from Auth Context

  // Filter tasks for current user
  const myTasks = mockTasks.filter(task => task.assigneeId === currentUserId);

  // Group by status
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTasks = myTasks.filter(task => {
    if (statusFilter === "all") return true;
    if (statusFilter === "all") return true;
    return task.status === statusFilter;
  }).sort((a,b) => {
    // 1. Sort by Priority
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const pDiff = (priorityWeight[b.priority || 'medium'] || 2) - (priorityWeight[a.priority || 'medium'] || 2);
    if (pDiff !== 0) return pDiff;

    // 2. Sort by Due Date (Ascending - urgent first)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const statusCounts = {
    all: myTasks.length,
    pending: myTasks.filter(t => t.status === "pending").length,
    in_progress: myTasks.filter(t => t.status === "in_progress").length,
    completed: myTasks.filter(t => t.status === "completed").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={16} className="text-green-600" />;
      case "in_progress":
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <Circle size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('my_tasks')}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {myTasks.length} {language === 'th' ? 'งานทั้งหมด' : 'tasks total'}
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {[
          { key: "all", label: language === 'th' ? 'ทั้งหมด' : 'All', count: statusCounts.all },
          { key: "pending", label: t('status_pending'), count: statusCounts.pending },
          { key: "in_progress", label: t('status_in_progress'), count: statusCounts.in_progress },
          { key: "completed", label: t('status_completed'), count: statusCounts.completed },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all shrink-0",
              statusFilter === filter.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
            )}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const company = mockCompanies.find(c => c.id === task.customerId);
            const location = company?.locations.find(l => l.id === task.locationId);
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
            const priorityColors = {
              high: "bg-red-50 text-red-600 border-red-200",
              medium: "bg-amber-50 text-amber-600 border-amber-200",
              low: "bg-blue-50 text-blue-600 border-blue-200"
            };

            return (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-[0.99] transition-transform relative overflow-hidden"
              >
                {/* Priority Stripe for High Priority */}
                {task.priority === 'high' && <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500"></div>}

                {/* Header */}
                <div className="flex items-start justify-between mb-3 pl-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getStatusIcon(isOverdue ? 'overdue' : task.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                          <span className={clsx(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                              priorityColors[task.priority || 'medium']
                          )}>
                              {task.priority === 'high' ? 'HIGH' : task.priority === 'medium' ? 'MED' : 'LOW'}
                          </span>
                          <h3 className="font-bold text-slate-900 truncate">{task.title}</h3>
                       </div>
                      {task.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 shrink-0 ml-2" />
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  {company && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="truncate">{company.name}</span>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="truncate">{location.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarIcon size={14} className="text-slate-400" />
                    <span>
                      {language === 'th' ? 'ครบกำหนด: ' : 'Due: '}
                      {format(new Date(task.dueDate), "d MMM yyyy", { locale })}
                    </span>
                  </div>
                </div>

                {/* Objectives */}
                {task.objectives && task.objectives.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.objectives.slice(0, 2).map((obj) => (
                      <span
                        key={obj}
                        className="text-[10px] px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-medium"
                      >
                        {t(`obj_${obj}` as any)}
                      </span>
                    ))}
                    {task.objectives.length > 2 && (
                      <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                        +{task.objectives.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span
                    className={clsx(
                      "text-xs px-2.5 py-1 rounded-full border font-bold uppercase",
                      getStatusColor(isOverdue ? 'overdue' : task.status)
                    )}
                  >
                    {isOverdue ? t('status_overdue') : t(`status_${task.status}` as any)}
                  </span>
                  
                  {task.status !== 'completed' && (
                    <button className="text-xs text-indigo-600 font-bold hover:text-indigo-700">
                      {language === 'th' ? 'อัปเดต' : 'Update'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <Circle size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">
              {language === 'th' ? 'ไม่มีงานในสถานะนี้' : 'No tasks in this status'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
