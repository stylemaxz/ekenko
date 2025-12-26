"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Search, 
  Plus, 
  MapPin, 
  Trash2, 
  Save, 
  User, 
  Edit
} from "lucide-react";
import { mockCompanies, Company, Location, ContactPerson } from "@/utils/mockData";
import { clsx } from "clsx";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { searchAddressByPostalCode } from "@/utils/thaiAddressData";

export default function CustomersPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.taxId && company.taxId.includes(searchQuery)) ||
    company.locations.some(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.district && loc.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (loc.province && loc.province.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  // --- Modal Logic ---

  const openAddModal = () => {
      // Initialize a new empty company template
      setEditingCompany({
          id: `new_${Date.now()}`,
          name: "",
          taxId: "",
          grade: "C",
          status: "lead",
          locations: []
      });
      setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
      setEditingCompany({ ...company }); 
      setIsModalOpen(true);
  };

  const deleteCompany = (id: string) => {
      setCompanyToDelete(id);
      setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
      if (companyToDelete) {
          setCompanies(prev => prev.filter(c => c.id !== companyToDelete));
          showToast(t('delete_success'), 'success');
          setCompanyToDelete(null);
      }
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingCompany) return;

      if (companies.some(c => c.id === editingCompany.id)) {
          // Update
          setCompanies(prev => prev.map(c => c.id === editingCompany.id ? editingCompany : c));
      } else {
          // Create
          setCompanies(prev => [...prev, { ...editingCompany, id: `c_${Date.now()}` }]);
      }
      setIsModalOpen(false);
      showToast(t('save_success'), 'success');
  };

  // --- Helpers to update editingCompany state ---
  const updateField = (field: keyof Company, value: any) => {
      if (editingCompany) {
          setEditingCompany({ ...editingCompany, [field]: value });
      }
  };

  const addBranch = () => {
    if (editingCompany) {
        const newBranch: Location = {
            id: `loc_${Date.now()}`,
            name: "",
            address: "",
            postalCode: "",
            district: "",
            province: "",
            lat: 13.75,
            lng: 100.50,
            contacts: []
        };
        setEditingCompany({
            ...editingCompany,
            locations: [...editingCompany.locations, newBranch]
        });
    }
  };

  const updateBranch = (index: number, field: keyof Location, value: any) => {
      if (editingCompany) {
          const newLocs = [...editingCompany.locations];
          newLocs[index] = { ...newLocs[index], [field]: value };

          // Auto-fill address if postal code changes
          if (field === 'postalCode') {
              const matches = searchAddressByPostalCode(value);
              if (matches.length > 0) {
                  // Auto-select the first match for simplicity
                  if (language === 'th') {
                      newLocs[index].district = matches[0].districtTH;
                      newLocs[index].province = matches[0].provinceTH;
                  } else {
                      newLocs[index].district = matches[0].district;
                      newLocs[index].province = matches[0].province;
                  }
              }
          }

          setEditingCompany({ ...editingCompany, locations: newLocs });
      }
  };

  const removeBranch = (index: number) => {
      if (editingCompany) {
          const newLocs = editingCompany.locations.filter((_, i) => i !== index);
          setEditingCompany({ ...editingCompany, locations: newLocs });
      }
  };

  // Minimal contact management for now: just 1 contact per branch for editing simplicity in this sprint
  const updateContact = (locIndex: number, field: keyof ContactPerson, value: any) => {
      if (editingCompany) {
            const newLocs = [...editingCompany.locations];
            const currentContacts = newLocs[locIndex].contacts;
            
            if (currentContacts.length === 0) {
                // Create potentially empty contact if typing
                currentContacts.push({ id: `ct_${Date.now()}`, name: "", role: "", phone: "" });
            }
            
            currentContacts[0] = { ...currentContacts[0], [field]: value };
            setEditingCompany({ ...editingCompany, locations: newLocs });
      }
  };


  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('manage_clients')}</h1>
           <p className="text-slate-500 text-sm">{t('registered_locations')}: {companies.reduce((acc, c) => acc + c.locations.length, 0)}</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary shadow-lg shadow-indigo-200">
           <Plus size={20} />
           {t('add_customer')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6 p-4">
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                 type="text" 
                 placeholder={t('search_customers')}
                 className="input pl-10 w-full md:w-96"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {filteredCompanies.map((company) => (
             <div key={company.id} className="card hover:shadow-md transition-shadow group relative">
                 <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(company)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => deleteCompany(company.id)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded text-red-600">
                        <Trash2 size={16} />
                    </button>
                 </div>

                 <div className="flex justify-between items-start mb-4 pr-16">
                     <div className="flex items-start gap-3">
                         <div className={clsx(
                             "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm",
                             company.status === 'existing' ? "bg-indigo-100 text-indigo-600" : "bg-teal-100 text-teal-600"
                         )}>
                             {company.name.substring(0, 1)}
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-900">{company.name}</h3>
                             <div className="flex items-center gap-2 mt-1">
                                 <span className={clsx(
                                     "text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase",
                                     company.grade === 'A' ? "bg-green-50 text-green-700 border-green-200" :
                                     company.grade === 'B' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                     "bg-slate-50 text-slate-600 border-slate-200"
                                     )}>
                                     Grade {company.grade}
                                 </span>
                                 <span className={clsx(
                                     "text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase",
                                     company.status === 'existing' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                     )}>
                                     {company.status === 'existing' ? t('status_existing') : t('status_new')}
                                 </span>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="space-y-3">
                     <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                         <span>Branches ({company.locations.length})</span>
                     </div>
                     
                     <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                         {company.locations.length === 0 ? (
                             <div className="text-slate-400 italic text-sm">{t('no_locations')}</div>
                         ) : (
                             company.locations.map(loc => (
                                 <div key={loc.id} className="p-2 rounded bg-slate-50 border border-slate-100 text-sm">
                                     <div className="font-medium text-slate-700 flex items-center gap-2">
                                         <MapPin size={14} className="text-slate-400" />
                                         {loc.name}
                                     </div>
                                     <div className="text-xs text-slate-400 pl-5 truncate mb-1">{loc.address}</div>
                                     {(loc.district || loc.province) && (
                                         <div className="text-xs text-slate-500 pl-5 mb-2 font-medium">
                                             {loc.district ? `${loc.district}, ` : ''}{loc.province} {loc.postalCode}
                                         </div>
                                     )}
                                     
                                     {/* Map Button */}
                                     {loc.googleMapLink && (
                                         <a 
                                            href={loc.googleMapLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="ml-5 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold hover:bg-indigo-100 transition-colors mb-2"
                                         >
                                             <MapPin size={12} />
                                             {t('view_map')}
                                         </a>
                                     )}

                                     {loc.contacts.length > 0 && (
                                         <div className="pt-1.5 border-t border-slate-200/50 pl-5 flex items-center gap-2 text-xs text-slate-500">
                                             <User size={12} />
                                             <span className="truncate">{loc.contacts[0].name} ({loc.contacts[0].role})</span>
                                         </div>
                                     )}
                                 </div>
                             ))
                         )}
                     </div>
                 </div>

                 <div className="mt-4 pt-4 border-t border-slate-100">
                     <button onClick={() => openEditModal(company)} className="w-full py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                         {t('view_details')}
                     </button>
                 </div>
             </div>
         ))}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={editingCompany?.id.startsWith('new_') ? t('add_customer') : t('edit_details')}
          subtitle={t('company_info')}
          width="max-w-4xl"
          footer={
             <>
                 <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition-colors">
                     {t('cancel')}
                 </button>
                 <button onClick={handleSave} className="btn btn-primary px-6">
                     <Save size={18} />
                     {t('save')}
                 </button>
             </>
          }
      >
          {editingCompany && (
             <div className="space-y-8">
                 {/* Section 1: Company Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                         <label className="label">{t('company_info')}</label>
                         <input 
                            value={editingCompany.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="input w-full"
                            placeholder="Company Name"
                         />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="label">{t('tax_id')}</label>
                             <input 
                                value={editingCompany.taxId || ''}
                                onChange={(e) => updateField('taxId', e.target.value)}
                                className="input w-full"
                                placeholder="Tax ID"
                             />
                         </div>
                         <div>
                             <label className="label">{t('grade')}</label>
                             <select 
                                value={editingCompany.grade}
                                onChange={(e) => updateField('grade', e.target.value)}
                                className="input w-full"
                             >
                                 <option value="A">Grade A</option>
                                 <option value="B">Grade B</option>
                                 <option value="C">Grade C</option>
                             </select>
                         </div>
                     </div>
                     <div>
                         <label className="label">{t('status')}</label>
                         <select 
                            value={editingCompany.status}
                            onChange={(e) => updateField('status', e.target.value)}
                            className="input w-full"
                         >
                             <option value="existing">{t('status_existing')}</option>
                             <option value="lead">{t('status_new')}</option>
                             <option value="inactive">Inactive</option>
                         </select>
                     </div>
                 </div>

                 {/* Section 2: Branches */}
                 <div>
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                             <MapPin className="text-indigo-600" size={20} />
                             {t('branches')}
                         </h3>
                         <button onClick={addBranch} className="btn bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200">
                             <Plus size={16} />
                             {t('add_branch')}
                         </button>
                     </div>
                     
                     <div className="space-y-4">
                         {editingCompany.locations.map((loc, idx) => (
                             <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group">
                                 <button onClick={() => removeBranch(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1">
                                     <Trash2 size={16} />
                                 </button>
                                 
                                  <div className="space-y-4 mb-4">
                                      <div>
                                          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('branch_name')}</label>
                                          <input 
                                              value={loc.name}
                                              onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                                              className="input w-full bg-white h-9 text-sm"
                                              placeholder="Branch Name"
                                          />
                                      </div>
                                      
                                      <div>
                                          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('address')}</label>
                                          <input 
                                              value={loc.address}
                                              onChange={(e) => updateBranch(idx, 'address', e.target.value)}
                                              className="input w-full bg-white h-9 text-sm"
                                              placeholder="Address (Text)"
                                          />
                                      </div>
                                      
                                      {/* Postal Code & Address Fields */}
                                      <div className="grid grid-cols-3 gap-3">
                                           <div className="col-span-1">
                                               <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">{t('postal_code')}</label>
                                               <input 
                                                   value={loc.postalCode || ''}
                                                   onChange={(e) => updateBranch(idx, 'postalCode', e.target.value)}
                                                   className="input w-full bg-white h-9 text-xs"
                                                   placeholder="Code"
                                                   maxLength={5}
                                               />
                                           </div>
                                           <div className="col-span-1">
                                               <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">{t('district')}</label>
                                               {searchAddressByPostalCode(loc.postalCode || '').length > 0 ? (
                                                   <select
                                                        value={loc.district || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            // Manual update to avoid race condition of calling updateBranch twice
                                                            if (editingCompany) {
                                                                const newLocs = [...editingCompany.locations];
                                                                const currentLoc = { ...newLocs[idx] };
                                                                
                                                                // Update District
                                                                currentLoc.district = val;

                                                                // Find and Update Province
                                                                const matches = searchAddressByPostalCode(loc.postalCode || '');
                                                                const match = matches.find(m => 
                                                                    language === 'th' ? m.districtTH === val : m.district === val
                                                                );
                                                                if (match) {
                                                                    currentLoc.province = language === 'th' ? match.provinceTH : match.province;
                                                                }

                                                                newLocs[idx] = currentLoc;
                                                                setEditingCompany({ ...editingCompany, locations: newLocs });
                                                            }
                                                        }}
                                                        className="input w-full bg-slate-50 h-9 text-xs p-1"
                                                   >
                                                        <option value="">{t('select_district') || "Select..."}</option>
                                                        {searchAddressByPostalCode(loc.postalCode || '').map((m, i) => (
                                                            <option key={i} value={language === 'th' ? m.districtTH : m.district}>
                                                                {language === 'th' ? m.districtTH : m.district}
                                                            </option>
                                                        ))}
                                                   </select>
                                               ) : (
                                                   <input 
                                                       value={loc.district || ''}
                                                       readOnly
                                                       disabled
                                                       className="input w-full bg-slate-100 text-slate-500 h-9 text-xs cursor-not-allowed"
                                                       placeholder={t('district')}
                                                   />
                                               )}
                                           </div>
                                           <div className="col-span-1">
                                               <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">{t('province')}</label>
                                               <input 
                                                   value={loc.province || ''}
                                                   readOnly
                                                   disabled
                                                   className="input w-full bg-slate-100 text-slate-500 h-9 text-xs cursor-not-allowed"
                                                   placeholder={t('province')}
                                               />
                                           </div>
                                      </div>

                                      <div>
                                          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block text-indigo-600">{t('google_maps_link')}</label>
                                          <input 
                                              value={loc.googleMapLink || ''}
                                              onChange={(e) => updateBranch(idx, 'googleMapLink', e.target.value)}
                                              className="input w-full bg-white h-9 text-sm border-indigo-200 focus:border-indigo-400 focus:ring-indigo-100"
                                              placeholder="https://maps.app.goo.gl/..."
                                          />
                                      </div>
                                 </div>
                                 
                                 
                                 {/* Simple Contact for Branch */}
                                 <div className="bg-white p-3 rounded-lg border border-slate-100">
                                     <div className="text-xs font-bold text-indigo-600 mb-2">{t('contact_person')}</div>
                                     <div className="grid grid-cols-3 gap-2">
                                          <input 
                                              value={loc.contacts[0]?.name || ''}
                                              onChange={(e) => updateContact(idx, 'name', e.target.value)}
                                              className="input h-8 text-xs"
                                              placeholder="Name"
                                          />
                                          <input 
                                              value={loc.contacts[0]?.role || ''}
                                              onChange={(e) => updateContact(idx, 'role', e.target.value)}
                                              className="input h-8 text-xs"
                                              placeholder="Role"
                                          />
                                          <input 
                                              value={loc.contacts[0]?.phone || ''}
                                              onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                                              className="input h-8 text-xs"
                                              placeholder="Phone"
                                          />
                                     </div>
                                 </div>
                             </div>
                         ))}
                         {editingCompany.locations.length === 0 && (
                             <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                                 No branches added yet.
                             </div>
                         )}
                     </div>
                 </div>
             </div>
          )}
      </Modal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog 
         isOpen={isDeleteDialogOpen}
         onClose={() => setIsDeleteDialogOpen(false)}
         onConfirm={handleDeleteConfirm}
         title={t('delete')}
         message={t('confirm_delete')}
         type="danger"
      />
    </div>
  );
}
