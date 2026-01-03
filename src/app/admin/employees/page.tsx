"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Search, Trash2, Edit, User, Mail, Phone, Save, X } from "lucide-react";
import { Employee } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";

export default function EmployeesPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
  
  // Delete Dialog States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
  );

  // --- Actions ---

  const handleAdd = () => {
    setCurrentEmployee({
        id: `emp_${Date.now()}`,
        name: "",
        email: "",
        phone: "",
        role: "sales",
        portfolioSize: 0,
        username: "",
        password: "",
        avatar: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setCurrentEmployee({ ...emp, password: "" }); // Clear password for security/editing
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setEmployeeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
        try {
            const res = await fetch(`/api/employees/${employeeToDelete}`, {
                method: 'DELETE',
            });
            
            if (!res.ok) throw new Error('Delete failed');
            
            showToast(t('delete_success'), 'success');
            setEmployeeToDelete(null);
            setIsDeleteDialogOpen(false);
            fetchEmployees(); // Refresh list
        } catch (error) {
            console.error(error);
            showToast('Failed to delete employee', 'error');
        }
    }
  };

  const handleSave = async () => {
      // Basic validation
      if (!currentEmployee.name || !currentEmployee.email || !currentEmployee.username) {
          showToast(t('fill_required'), 'error');
          return;
      }

      const isNew = !employees.some(e => e.id === currentEmployee.id);
      
      if (isNew && !currentEmployee.password) {
         showToast("Password is required for new employees", "error");
         return;
      }

      try {
          if (isNew) {
              // Create
              const res = await fetch('/api/employees', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(currentEmployee),
              });
              
              if (!res.ok) {
                  const error = await res.json();
                  throw new Error(error.error || 'Failed to create');
              }
          } else {
              // Update
              const res = await fetch(`/api/employees/${currentEmployee.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(currentEmployee),
              });
              
              if (!res.ok) {
                  const error = await res.json();
                  throw new Error(error.error || 'Failed to update');
              }
          }
          
          setIsModalOpen(false);
          showToast(t('save_success'), 'success');
          fetchEmployees(); // Refresh list
      } catch (error: any) {
          console.error(error);
          showToast(error.message || 'Failed to save', 'error');
      }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('employees')}</h1>
          <p className="text-slate-500 text-sm">{t('manage_team')}</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <Plus size={18} />
          {t('add_employee')}
        </button>
      </div>

      <div className="card bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder={t('search_employees')}
                    className="input pl-10 w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">{t('col_name')}</th>
                <th className="p-4">{t('username')}</th>
                <th className="p-4">{t('col_role')}</th>
                <th className="p-4">{t('col_contact')}</th>
                <th className="p-4 text-center">{t('portfolio_size')}</th>
                <th className="p-4 text-right">{t('col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {emp.avatar ? (
                          <Image 
                            src={emp.avatar} 
                            alt={emp.name} 
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                            unoptimized
                          />
                      ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                            {emp.name.charAt(0)}
                          </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900">{emp.name}</div>
                        <div className="text-sm text-slate-500">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {emp.username || "-"}
                  </td>
                  <td className="p-4">
                    <span className="badge badge-neutral bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                        {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-mono">
                    {emp.phone}
                  </td>
                  <td className="p-4 text-center font-medium text-slate-700">
                    {emp.portfolioSize}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleEdit(emp)} className="btn-icon p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(emp.id)}
                        className="btn-icon p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    {t('no_employees')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         title={currentEmployee.id?.startsWith('emp_') ? t('add_employee') : t('edit_details')}
         footer={
             <>
                 <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                     {t('cancel')}
                 </button>
                 <button onClick={handleSave} className="btn btn-primary px-6">
                     <Save size={18} />
                     {t('save')}
                 </button>
             </>
         }
      >
          <div className="space-y-6">
              {/* Profile Image & Basic Info */}
              <div className="flex gap-6 items-start">
                   <div className="shrink-0 flex flex-col items-center gap-2">
                       <input 
                           type="file"
                           accept="image/*"
                           id="avatar-upload"
                           className="hidden"
                           onChange={async (e) => {
                               if (e.target.files && e.target.files[0]) {
                                   const file = e.target.files[0];
                                   showToast('Uploading avatar...', 'info');
                                   
                                   try {
                                       const formData = new FormData();
                                       formData.append('file', file);
                                       formData.append('folder', 'avatars');

                                       const res = await fetch('/api/upload', {
                                           method: 'POST',
                                           body: formData,
                                       });

                                       if (!res.ok) throw new Error('Upload failed');

                                       const data = await res.json();
                                       setCurrentEmployee({...currentEmployee, avatar: data.url});
                                       showToast('Avatar uploaded successfully', 'success');
                                   } catch (error) {
                                       console.error(error);
                                       showToast('Failed to upload avatar', 'error');
                                   }
                               }
                           }}
                       />
                       <label 
                           htmlFor="avatar-upload"
                           className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative group cursor-pointer hover:border-indigo-400 transition-colors"
                        >
                           {currentEmployee.avatar ? (
                               <Image 
                                   src={currentEmployee.avatar} 
                                   alt="Profile" 
                                   fill
                                   className="object-cover"
                                   unoptimized
                               />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-slate-300">
                                   <User size={40} />
                               </div>
                           )}
                           {/* Upload Overlay */}
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                               <Plus className="text-white opacity-80" size={24} />
                           </div>
                       </label>
                       <label htmlFor="avatar-upload" className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Click to Upload</label>
                   </div>

                   <div className="flex-1 space-y-4">
                        <div>
                            <label className="label">{t('col_name')}</label>
                            <input 
                                className="input w-full" 
                                value={currentEmployee.name || ''}
                                onChange={(e) => setCurrentEmployee({...currentEmployee, name: e.target.value})}
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <label className="label">{t('email')}</label>
                            <input 
                                className="input w-full" 
                                value={currentEmployee.email || ''}
                                onChange={(e) => setCurrentEmployee({...currentEmployee, email: e.target.value})}
                                placeholder="Email Address"
                            />
                        </div>
                   </div>
              </div>

              {/* Login Credentials */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                   <h3 className="font-bold text-slate-700 text-sm">Login Credentials</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label className="label">{t('username')} <span className="text-red-500">*</span></label>
                           <input 
                               className="input w-full bg-white" 
                               value={currentEmployee.username || ''}
                               onChange={(e) => setCurrentEmployee({...currentEmployee, username: e.target.value})}
                               placeholder="Username"
                           />
                       </div>
                       <div>
                           <label className="label">{t('password')} {currentEmployee.id?.startsWith('emp_') && <span className="text-red-500">*</span>}</label>
                           <input 
                               type="password"
                               className="input w-full bg-white" 
                               value={currentEmployee.password || ''}
                               onChange={(e) => setCurrentEmployee({...currentEmployee, password: e.target.value})}
                               placeholder={!currentEmployee.id?.startsWith('emp_') ? t('password_placeholder') : "Password"}
                           />
                       </div>
                   </div>
              </div>

              {/* Contact & Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="label">{t('phone')}</label>
                      <input 
                          className="input w-full" 
                          value={currentEmployee.phone || ''}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, phone: e.target.value})}
                          placeholder="Phone Number"
                      />
                  </div>
                  <div>
                      <label className="label">{t('col_role')}</label>
                      <select 
                          className="input w-full"
                          value={currentEmployee.role || 'sales'}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, role: e.target.value as any})}
                      >
                          <option value="sales">Sales Representative</option>
                          <option value="manager">Manager</option>
                      </select>
                  </div>
              </div>

               <div>
                  <label className="label">{t('portfolio_size')}</label>
                  <input 
                      type="number"
                      className="input w-full" 
                      value={currentEmployee.portfolioSize || 0}
                      onChange={(e) => setCurrentEmployee({...currentEmployee, portfolioSize: parseInt(e.target.value) || 0})}
                  />
                  <p className="text-xs text-slate-400 mt-1">Number of locations assigned</p>
               </div>
          </div>
      </Modal>

      {/* --- CONFIRM DELETE --- */}
      <ConfirmDialog 
         isOpen={isDeleteDialogOpen}
         onClose={() => setIsDeleteDialogOpen(false)}
         onConfirm={handleConfirmDelete}
         title={t('delete')}
         message={t('confirm_delete_employee')}
         type="danger"
      />
    </div>
  );
}
