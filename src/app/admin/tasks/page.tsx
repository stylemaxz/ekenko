"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  Search,
  User,
  MapPin,
  Building2,
  X,
  Save,
  AlertCircle,
  Target
} from "lucide-react";
import { mockTasks, mockEmployees, mockCompanies, Task, TaskStatus, VisitObjectives, VisitObjective } from "@/utils/mockData";
import { clsx } from "clsx";
import { format } from "date-fns";
import { enUS, th } from "date-fns/locale";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";

export default function TasksPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchEmployee, setSearchEmployee] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
      title: "",
      description: "",
      objectives: [],
      assigneeId: "",
      customerId: "",
      locationId: "", 
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending'
  });

  const locale = language === 'th' ? th : enUS;

  // --- Filter Logic ---
  const filteredTasks = tasks.filter(task => {
      // 1. Status Filter
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      
      // 2. Employee Search Filter
      if (searchEmployee) {
          const assignee = mockEmployees.find(e => e.id === task.assigneeId);
          if (!assignee?.name.toLowerCase().includes(searchEmployee.toLowerCase())) return false;
      }
      
      return true;
      return true;
  }).sort((a,b) => {
      // Sort by Priority (High > Medium > Low)
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const diff = (priorityWeight[b.priority!] || 2) - (priorityWeight[a.priority!] || 2);
      if (diff !== 0) return diff;
      
      // Then by Date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // --- Create Task Logic ---
  const handleSave = () => {
      if (!newTask.title || !newTask.assigneeId || !newTask.dueDate) {
          showToast(t('fill_required'), 'error');
          return;
      }

      const task: Task = {
          id: `t_${Date.now()}`,
          title: newTask.title || "",
          description: newTask.description,
          objectives: newTask.objectives,
          assigneeId: newTask.assigneeId!,
          customerId: newTask.customerId,
          locationId: newTask.locationId,
          dueDate: new Date(newTask.dueDate!).toISOString(),
          priority: newTask.priority || 'medium',
          status: 'pending',
          createdAt: new Date().toISOString()
      };

      setTasks([task, ...tasks]);
      setIsModalOpen(false);
      showToast(t('task_assigned'), 'success');
      
      // Reset form
      setNewTask({
          title: "",
          description: "",
          objectives: [],
          assigneeId: "",
          customerId: "",
          locationId: "",
          dueDate: new Date().toISOString().split('T')[0],
          priority: 'medium',
          status: 'pending'
      });
  };

  const toggleObjective = (obj: VisitObjective) => {
      const current = newTask.objectives || [];
      if (current.includes(obj)) {
          setNewTask({ ...newTask, objectives: current.filter(o => o !== obj) });
      } else {
          setNewTask({ ...newTask, objectives: [...current, obj] });
      }
  };

  const statusColors = {
      pending: "bg-slate-100 text-slate-600 border-slate-200",
      in_progress: "bg-blue-50 text-blue-600 border-blue-200",
      completed: "bg-green-50 text-green-600 border-green-200",
      overdue: "bg-red-50 text-red-600 border-red-200"
  };

  const statusLabels = {
      pending: t('status_pending'),
      in_progress: t('status_in_progress'),
      completed: t('status_completed'),
      overdue: t('status_overdue')
  };

  // Helper to find location options based on selected customer
  const locationOptions = newTask.customerId 
      ? mockCompanies.find(c => c.id === newTask.customerId)?.locations || []
      : [];

  return (
    <div className="p-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('manage_tasks')}</h1>
           <p className="text-slate-500 text-sm">{t('dashboard_subtitle')}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary shadow-lg shadow-indigo-200">
           <Plus size={20} />
           {t('add_task')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'pending', 'in_progress', 'completed', 'overdue'].map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={clsx(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap",
                        filterStatus === status 
                            ? "bg-slate-800 text-white border-slate-800" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                >
                    {status === 'all' ? t('all_employees').replace('All Employees', 'All') : statusLabels[status as TaskStatus]}
                </button>
            ))}
        </div>

        {/* Employee Search */}
        <div className="relative max-w-xs w-full ml-auto">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
                 type="text" 
                 placeholder={t('search_employees') || "Search Employee..."}
                 className="input pl-9 py-2 w-full text-sm"
                 onChange={(e) => setSearchEmployee(e.target.value)}
             />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
          {filteredTasks.map(task => {
              const assignee = mockEmployees.find(e => e.id === task.assigneeId);
              const company = mockCompanies.find(c => c.id === task.customerId);
              const location = company?.locations.find(l => l.id === task.locationId);

              return (
                  <div key={task.id} className="card hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4">
                      {/* Status Stripe */}
                      <div className={clsx("w-1.5 self-stretch rounded-full", 
                          task.status === 'pending' ? "bg-slate-300" :
                          task.status === 'in_progress' ? "bg-blue-500" :
                          task.status === 'completed' ? "bg-green-500" : "bg-red-500"
                      )}></div>
                      
                      <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                              <div>
                                  <h3 className="font-bold text-slate-900 text-lg">{task.title}</h3>
                                  {task.description && <p className="text-slate-500 text-sm mt-1">{task.description}</p>}
                                  {/* Objectives Display */}
                                  {task.objectives && task.objectives.length > 0 && (
                                     <div className="flex flex-wrap gap-2 mt-2">
                                          {/* Priority Badge */}
                                          <span className={clsx(
                                              "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                              task.priority === 'high' ? "bg-red-100 text-red-700 border border-red-200" :
                                              task.priority === 'medium' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                              "bg-blue-50 text-blue-700 border border-blue-200"
                                          )}>
                                              <AlertCircle size={10} />
                                              {task.priority === 'high' ? t('priority_high') : task.priority === 'medium' ? t('priority_medium') : t('priority_low')}
                                          </span>

                                         {task.objectives.map(obj => (
                                             <span key={obj} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                 <Target size={10} />
                                                 {t(`obj_${obj}` as any)}
                                             </span>
                                         ))}
                                     </div>
                                  )}
                              </div>
                              <span className={clsx("badge border", statusColors[task.status])}>
                                  {statusLabels[task.status]}
                              </span>
                          </div>

                          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                  <User size={14} className="text-indigo-500" />
                                  <span className="font-medium text-slate-700">{assignee?.name || "Unassigned"}</span>
                              </div>
                              
                              {company && (
                                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                      <Building2 size={14} className="text-teal-500" />
                                      <span>{company.name}</span>
                                      {location && <span className="text-slate-400">@ {location.name}</span>}
                                  </div>
                              )}

                              <div className={clsx(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                                  new Date(task.dueDate) < new Date() && task.status !== 'completed' 
                                    ? "bg-red-50 border-red-100 text-red-600" 
                                    : "bg-slate-50 border-slate-100"
                              )}>
                                  <Clock size={14} />
                                  <span>{t('due_date')}: {format(new Date(task.dueDate), 'dd MMM yyyy', { locale })}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              )
          })}
          {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                  No tasks found.
              </div>
          )}
      </div>

      {/* --- ADD TASK MODAL --- */}
      <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t('create_task')}
          width="max-w-xl md:max-w-2xl"
          footer={
             <>
                 <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                     {t('cancel')}
                 </button>
                 <button onClick={handleSave} className="btn btn-primary px-6">
                     <Save size={18} />
                     {t('create_task')}
                 </button>
             </>
          }
      >
          <div className="space-y-6">
              <div className="space-y-4">
                  <div>
                      <label className="label">{t('task_title')}</label>
                      <input 
                          className="input w-full" 
                          value={newTask.title}
                          onChange={e => setNewTask({...newTask, title: e.target.value})}
                          placeholder="e.g. Monthly Stock Check"
                      />
                  </div>
                  <div>
                      <label className="label">{t('task_detail')}</label>
                      <textarea 
                          className="input w-full min-h-[100px]" 
                          value={newTask.description}
                          onChange={e => setNewTask({...newTask, description: e.target.value})}
                          placeholder="Enter detailed instructions..."
                      />
                  </div>

                  {/* Visit Objectives Selection */}
                  <div>
                      <label className="label flex items-center gap-1">
                          {t('visit_objectives')}
                          <span className="text-red-500">*</span>
                       </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {VisitObjectives.map((obj) => (
                              <label key={obj} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                  <div className={clsx(
                                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                      newTask.objectives?.includes(obj) 
                                        ? "bg-indigo-600 border-indigo-600 text-white" 
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="label">{t('select_employee')}</label>
                          <select 
                              className="input w-full"
                              value={newTask.assigneeId}
                              onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                          >
                              <option value="">-- Select --</option>
                              {mockEmployees.map(e => (
                                  <option key={e.id} value={e.id}>{e.name}</option>
                              ))}
                          </select>
                      </div>
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
                  </div>
                  
                  <div>
                      <div>
                          <label className="label">{t('due_date')}</label>
                          <input 
                              type="date"
                              className="input w-full"
                              value={newTask.dueDate}
                              onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <MapPin size={16} />
                          Target Location (Optional)
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                          <div>
                              <label className="label text-xs uppercase">{t('select_customer')}</label>
                              <select 
                                  className="input w-full text-sm"
                                  value={newTask.customerId}
                                  onChange={e => setNewTask({...newTask, customerId: e.target.value, locationId: ""})}
                              >
                                  <option value="">-- None --</option>
                                  {mockCompanies.map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                              </select>
                          </div>
                          {locationOptions.length > 0 && (
                             <div>
                                  <label className="label text-xs uppercase">{t('select_location')}</label>
                                  <select 
                                      className="input w-full text-sm"
                                      value={newTask.locationId}
                                      onChange={e => setNewTask({...newTask, locationId: e.target.value})}
                                  >
                                      <option value="">-- All Locations / Head Office --</option>
                                      {locationOptions.map(l => (
                                          <option key={l.id} value={l.id}>{l.name}</option>
                                      ))}
                                  </select>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </Modal>
    </div>
  );
}
