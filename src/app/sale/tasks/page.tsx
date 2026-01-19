"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon,
  MapPin,
  Building2,
  ChevronRight,
  AlertCircle,
  Plus,
  Save,
  X,
  Target
} from "lucide-react";
import { Task, Company, Employee, VisitObjectives, VisitObjective } from "@/types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { enUS, th } from "date-fns/locale";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";

export default function SaleTasksPage() {
  const { t, language } = useLanguage();
  const locale = language === "th" ? th : enUS;
  const { showToast } = useToast();

  // State
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    objectives: [],
    customerId: "",
    locationId: "",
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
  });

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, companiesRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/companies'),
        ]);
        
        if (userRes.ok) {
          const user = await userRes.json();
          setCurrentUser(user);
          
          // Fetch tasks for current user
          const tasksRes = await fetch(`/api/tasks?assigneeId=${user.id}`);
          if (tasksRes.ok) setMyTasks(await tasksRes.json());
        }
        if (companiesRes.ok) setCompanies(await companiesRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  // Update Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>("in_progress");
  const [updateNote, setUpdateNote] = useState("");

  const handleUpdateClick = (task: Task) => {
    setSelectedTask(task);
    setUpdateStatus(task.status);
    setUpdateNote(task.completionNote || "");
    setIsModalOpen(true);
  };

  const handleSaveUpdate = () => {
    if (!selectedTask) return;

    // TODO: Call API to update task status
    // await fetch(`/api/tasks/${selectedTask.id}`, { method: 'PATCH', body: JSON.stringify({ status: updateStatus, completionNote: updateNote }) });

    // Update Local State
    setMyTasks(prev => prev.map(t => 
        t.id === selectedTask.id 
            ? { ...t, status: updateStatus as any, completionNote: updateNote }
            : t
    ));

    setIsModalOpen(false);
  };

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

  // Create Task Logic
  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.dueDate || !currentUser) {
      showToast(t('fill_required'), 'error');
      return;
    }

    try {
      const taskPayload = {
        title: newTask.title,
        description: newTask.description,
        objectives: newTask.objectives,
        assigneeId: currentUser.id, // Auto-assign to self
        customerId: newTask.customerId,
        locationId: newTask.locationId,
        dueDate: new Date(newTask.dueDate).toISOString(),
        priority: newTask.priority || 'medium',
        status: 'pending'
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });

      if (res.ok) {
        const createdTask = await res.json();
        setMyTasks([createdTask, ...myTasks]);
        setIsCreateModalOpen(false);
        showToast(language === 'th' ? 'เพิ่มงานสำเร็จ' : 'Task created successfully', 'success');
        
        // Reset form
        setNewTask({
          title: "",
          description: "",
          objectives: [],
          customerId: "",
          locationId: "",
          dueDate: new Date().toISOString().split('T')[0],
          priority: 'medium',
        });
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Failed to create task', 'error');
    }
  };

  const toggleObjective = (obj: VisitObjective) => {
    const current = newTask.objectives || [];
    if (current.includes(obj)) {
      setNewTask({ ...newTask, objectives: current.filter(o => o !== obj) });
    } else {
      setNewTask({ ...newTask, objectives: [...current, obj] });
    }
  };

  const locationOptions = newTask.customerId 
    ? companies.find(c => c.id === newTask.customerId)?.locations || []
    : [];

  return (
    <div className="pb-24 pt-6 px-4 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('my_tasks')}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {myTasks.length} {language === 'th' ? 'งานทั้งหมด' : 'tasks total'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
        >
          <Plus size={20} />
          {language === 'th' ? 'เพิ่มงาน' : 'Add Task'}
        </button>
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
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-white text-slate-600 border border-slate-200 hover:border-primary/40"
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
            const company = companies.find(c => c.id === task.customerId);
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
                        className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-md font-medium"
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
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleUpdateClick(task); }}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover shadow-sm transition-all shadow-primary/20"
                    >
                      {language === 'th' ? 'อัปเดตสถานะ' : 'Update Status'}
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

       {/* Update Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('language') === 'th' ? 'อัปเดตงาน' : 'Update Task'}
        width="max-w-md"
        footer={
           <>
              <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50"
              >
                  {t('cancel')}
              </button>
              <button 
                  onClick={handleSaveUpdate} 
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-hover flex items-center gap-2"
              >
                  <Save size={16} />
                  {t('language') === 'th' ? 'บันทึก' : 'Save'}
              </button>
           </>
        }
      >
         <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('language') === 'th' ? 'สถานะ' : 'Status'}
                </label>
                <select
                    className="w-full rounded-lg border-slate-200 text-sm p-2.5"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                >
                    <option value="pending">{t('status_pending')}</option>
                    <option value="in_progress">{t('status_in_progress')}</option>
                    <option value="completed">{t('status_completed')}</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('language') === 'th' ? 'ความคืบหน้า / หมายเหตุ' : 'Progress / Note'}
                </label>
                <textarea
                    className="w-full rounded-lg border-slate-200 text-sm p-3 min-h-[100px]"
                    placeholder={t('language') === 'th' ? 'รายละเอียดการทำงาน...' : 'Task execution details...'}
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                />
            </div>
          </div>
       </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        width="max-w-md md:max-w-lg"
      >
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto pb-24">
          <div className="space-y-6">
            <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="label">{t('task_title')} <span className="text-red-500">*</span></label>
              <input 
                className="input w-full" 
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder={language === 'th' ? 'ตัวอย่าง: ตรวจสต็อกประจำเดือน' : 'e.g. Monthly Stock Check'}
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">{t('task_detail')}</label>
              <textarea 
                className="input w-full min-h-[100px]" 
                value={newTask.description ?? ''}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                placeholder={language === 'th' ? 'รายละเอียดงาน...' : 'Enter detailed instructions...'}
              />
            </div>

            {/* Visit Objectives */}
            <div>
              <label className="label flex items-center gap-1">
                {t('visit_objectives')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {VisitObjectives.map((obj) => (
                  <label key={obj} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className={clsx(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                      newTask.objectives?.includes(obj) 
                        ? "bg-primary border-primary text-white" 
                        : "bg-white border-slate-300"
                    )}>
                      {newTask.objectives?.includes(obj) && <CheckCircle2 size={14} />}
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={newTask.objectives?.includes(obj)}
                        onChange={() => toggleObjective(obj)}
                      />
                    </div>
                    <span className="text-sm text-slate-700">{t(`obj_${obj}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('priority')}</label>
                <select 
                  className="input w-full"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                >
                  <option value="low">{t('priority_low')}</option>
                  <option value="medium">{t('priority_medium')}</option>
                  <option value="high">{t('priority_high')}</option>
                </select>
              </div>
              <div>
                <label className="label">{t('due_date')} <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  className="input w-full"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
            </div>

            {/* Customer & Location */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MapPin size={16} />
                {language === 'th' ? 'สถานที่เป้าหมาย (ไม่บังคับ)' : 'Target Location (Optional)'}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label text-xs uppercase">{t('select_customer')}</label>
                  <select 
                    className="input w-full text-sm"
                    value={newTask.customerId ?? ''}
                    onChange={e => setNewTask({...newTask, customerId: e.target.value, locationId: ""})}
                  >
                    <option value="">{language === 'th' ? '-- ไม่ระบุ --' : '-- None --'}</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {locationOptions.length > 0 && (
                  <div>
                    <label className="label text-xs uppercase">{t('select_location')}</label>
                    <select 
                      className="input w-full text-sm"
                      value={newTask.locationId ?? ''}
                      onChange={e => setNewTask({...newTask, locationId: e.target.value})}
                    >
                      <option value="">{language === 'th' ? '-- ทุกสาขา / สำนักงานใหญ่ --' : '-- All Locations / Head Office --'}</option>
                      {locationOptions.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons at Bottom */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="flex-1 px-5 py-3 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleCreateTask} 
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {language === 'th' ? 'สร้างงาน' : 'Create Task'}
              </button>
            </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
