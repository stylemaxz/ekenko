"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, Plus, User, X, Save, Building2, Edit, AlertCircle } from "lucide-react";
import { mockCompanies, Company, Location, CustomerStatus } from "@/utils/mockData";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";

export default function SaleCustomersPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { showToast } = useToast();
  
  // Mock current user ID
  const currentUserId = "1";
  
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    companyName: "",
    branchName: "",
    address: "",
    contactName: "",
    contactPhone: "",
  });
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<{
    company: Company;
    location: Location;
  } | null>(null);
  const [editStatus, setEditStatus] = useState<CustomerStatus>("active");
  const [editNote, setEditNote] = useState("");
  
  // Dropdown visibility state
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(true);
  const [showBranchDropdown, setShowBranchDropdown] = useState(true);

  // Filter: Show only customers created by current user
  const myCustomers = companies.map(company => ({
    ...company,
    locations: company.locations.filter(loc => loc.createdBy === currentUserId)
  })).filter(company => company.locations.length > 0);

  const filteredCompanies = myCustomers.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.locations.some(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAddCustomer = () => {
      setNewCustomer({
        companyName: "",
        branchName: "",
        address: "",
        contactName: "",
        contactPhone: "",
      });
      setShowCompanyDropdown(true);
      setShowBranchDropdown(true);
      setIsModalOpen(true);
  };

  const handleSaveCustomer = () => {
      // Validation
      if (!newCustomer.companyName || !newCustomer.branchName || !newCustomer.address) {
          showToast(t('fill_required'), 'error');
          return;
      }

      // Create new company with location
      const newCompanyId = `c_${Date.now()}`;
      const newLocationId = `loc_${Date.now()}`;
      
      const newLocation: Location = {
          id: newLocationId,
          name: newCustomer.branchName,
          address: newCustomer.address,
          postalCode: "",
          district: "",
          province: "",
          lat: 13.75,
          lng: 100.50,
          contacts: newCustomer.contactName ? [{
              id: `ct_${Date.now()}`,
              name: newCustomer.contactName,
              role: "",
              phone: newCustomer.contactPhone
          }] : [],
          customerStatus: "active", // Default status: กำลังติดตาม
          createdBy: currentUserId, // Track who created this
      };

      const newCompanyData: Company = {
          id: newCompanyId,
          name: newCustomer.companyName,
          taxId: "",
          grade: "C",
          status: "lead",
          locations: [newLocation]
      };

      setCompanies(prev => [...prev, newCompanyData]);
      setIsModalOpen(false);
      showToast(t('save_success'), 'success');
  };

  const handleEditCustomer = (company: Company, location: Location) => {
    setEditingLocation({ company, location });
    setEditStatus(location.customerStatus || "active");
    setEditNote(location.statusNote || "");
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (!editingLocation) return;

    // Validate: require note for closed/inactive status
    if ((editStatus === "closed" || editStatus === "inactive") && !editNote.trim()) {
      showToast(t('status_note_required'), 'error');
      return;
    }

    // Update location status
    setCompanies(prev => prev.map(company => {
      if (company.id === editingLocation.company.id) {
        return {
          ...company,
          locations: company.locations.map(loc => {
            if (loc.id === editingLocation.location.id) {
              return {
                ...loc,
                customerStatus: editStatus,
                statusNote: editNote.trim() || loc.statusNote
              };
            }
            return loc;
          })
        };
      }
      return company;
    }));

    setIsEditModalOpen(false);
    showToast(
      language === 'th' ? 'อัปเดตสถานะเรียบร้อย' : 'Status updated successfully',
      'success'
    );
  };

  const getStatusColor = (status?: CustomerStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusLabel = (status?: CustomerStatus) => {
    switch (status) {
      case 'active':
        return t('status_active');
      case 'closed':
        return t('status_closed');
      case 'inactive':
        return t('status_inactive');
      default:
        return t('status_active');
    }
  };

  return (
    <div className="pb-24 pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t('customers')}</h1>
          <button 
            onClick={handleAddCustomer}
            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
          >
              <Plus size={24} />
          </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
              type="text" 
              placeholder={t('search_customers')}
              className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
      </div>

      {/* Customer List */}
      <div className="space-y-4">
          {filteredCompanies.map(company => (
              <div key={company.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
                  <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                          <div className={clsx(
                             "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
                             company.status === 'existing' ? "bg-indigo-100 text-indigo-600" : "bg-teal-100 text-teal-600"
                          )}>
                             {company.name.substring(0, 1)}
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900">{company.name}</h3>
                              <span className={clsx(
                                  "text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase",
                                  company.status === 'existing' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-teal-50 text-teal-700 border-teal-100"
                              )}>
                                  {company.status === 'existing' ? t('status_existing') : t('status_new')}
                              </span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Locations List */}
                   <div className="space-y-2 mt-3 pl-13 border-t border-slate-50 pt-2">
                       {company.locations.map((loc) => (
                           <div key={loc.id} className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                               <div className="flex-1 min-w-0">
                                   <div className="flex items-center text-sm text-slate-900 font-medium">
                                       <MapPin size={14} className="text-slate-400 mr-2 shrink-0" />
                                       <span className="truncate">{loc.name}</span>
                                   </div>
                                   <div className="ml-6 mt-1">
                                       <span className={clsx(
                                           "text-[10px] px-2 py-0.5 rounded border font-bold inline-block",
                                           getStatusColor(loc.customerStatus)
                                       )}>
                                           {getStatusLabel(loc.customerStatus)}
                                       </span>
                                   </div>
                               </div>
                               <button
                                   onClick={() => handleEditCustomer(company, loc)}
                                   className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                               >
                                   <Edit size={16} />
                               </button>
                           </div>
                       ))}
                   </div>
              </div>
          ))}
          
          {filteredCompanies.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                  <User size={40} className="mx-auto mb-2 opacity-20" />
                  <p>No customers found.</p>
              </div>
          )}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('new_customer')}
        subtitle="Quick Add - Sales Rep"
        footer={
          <>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleSaveCustomer} 
              className="btn btn-primary px-6"
            >
              <Save size={18} />
              {t('save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Company Name with Autocomplete */}
          <div>
            <label className="label flex items-center gap-2">
              <Building2 size={16} className="text-indigo-600" />
              {t('company_info')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="input w-full"
                placeholder="Company Name"
                value={newCustomer.companyName}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, companyName: e.target.value });
                  setShowCompanyDropdown(true);
                }}
              />
              
              {/* Company Suggestions Dropdown */}
              {newCustomer.companyName.length > 0 && showCompanyDropdown && (
                (() => {
                  const matchingCompanies = companies.filter(c => 
                    c.name.toLowerCase().includes(newCustomer.companyName.toLowerCase())
                  );
                  
                  if (matchingCompanies.length > 0) {
                    return (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <div className="p-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 font-medium">
                          ⚠️ {t('language') === 'th' ? 'พบบริษัทที่คล้ายกัน' : 'Similar companies found'}:
                        </div>
                        {matchingCompanies.map(company => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => {
                              setNewCustomer({ 
                                ...newCustomer, 
                                companyName: company.name 
                              });
                              setShowCompanyDropdown(false);
                            }}
                            className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                          >
                            <div className="font-medium text-slate-900">{company.name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {company.locations.length} {t('language') === 'th' ? 'สาขา' : 'branches'} • 
                              <span className={clsx(
                                "ml-1",
                                company.status === 'existing' ? "text-indigo-600" : "text-teal-600"
                              )}>
                                {company.status === 'existing' ? t('status_existing') : t('status_new')}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </div>
          </div>

          {/* Branch Name with Autocomplete */}
          <div>
            <label className="label flex items-center gap-2">
              <MapPin size={16} className="text-indigo-600" />
              {t('branch_name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="input w-full"
                placeholder="Branch Name"
                value={newCustomer.branchName}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, branchName: e.target.value });
                  setShowBranchDropdown(true);
                }}
              />
              
              {/* Branch Suggestions Dropdown */}
              {newCustomer.branchName.length > 0 && newCustomer.companyName.length > 0 && showBranchDropdown && (
                (() => {
                  // Find the selected company
                  const selectedCompany = companies.find(c => 
                    c.name.toLowerCase() === newCustomer.companyName.toLowerCase()
                  );
                  
                  if (selectedCompany) {
                    const matchingBranches = selectedCompany.locations.filter(loc =>
                      loc.name.toLowerCase().includes(newCustomer.branchName.toLowerCase())
                    );
                    
                    if (matchingBranches.length > 0) {
                      return (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          <div className="p-2 bg-red-50 border-b border-red-100 text-xs text-red-700 font-medium">
                            🚫 {t('language') === 'th' ? 'สาขานี้มีอยู่แล้วในระบบ' : 'This branch already exists'}!
                          </div>
                          {matchingBranches.map(branch => (
                            <div
                              key={branch.id}
                              className="p-3 border-b border-slate-50 last:border-0 bg-red-50/50"
                            >
                              <div className="font-medium text-slate-900">{branch.name}</div>
                              <div className="text-xs text-slate-600 mt-1 truncate">{branch.address}</div>
                              {branch.district && branch.province && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {branch.district}, {branch.province}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                  }
                  
                  // Show all branches from all companies with similar names
                  const allMatchingBranches = companies.flatMap(c => 
                    c.locations
                      .filter(loc => loc.name.toLowerCase().includes(newCustomer.branchName.toLowerCase()))
                      .map(loc => ({ company: c, location: loc }))
                  );
                  
                  if (allMatchingBranches.length > 0) {
                    return (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <div className="p-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-medium">
                          ℹ️ {t('language') === 'th' ? 'พบสาขาที่คล้ายกันในบริษัทอื่น' : 'Similar branches in other companies'}:
                        </div>
                        {allMatchingBranches.map((item, idx) => (
                          <div
                            key={`${item.company.id}-${item.location.id}`}
                            className="p-3 border-b border-slate-50 last:border-0"
                          >
                            <div className="font-medium text-slate-900">{item.location.name}</div>
                            <div className="text-xs text-indigo-600 font-medium mt-0.5">{item.company.name}</div>
                            <div className="text-xs text-slate-500 mt-1 truncate">{item.location.address}</div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  return null;
                })()
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="label">
              {t('address')} <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input w-full h-20 resize-none"
              placeholder="Full Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            />
          </div>

          {/* Contact Person (Optional) */}
          <div className="border-t border-slate-100 pt-4">
            <label className="label text-slate-500 text-sm mb-3">
              {t('contact_person')} ({t('language') === 'th' ? 'ไม่บังคับ' : 'Optional'})
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                className="input"
                placeholder="Name"
                value={newCustomer.contactName}
                onChange={(e) => setNewCustomer({ ...newCustomer, contactName: e.target.value })}
              />
              <input
                type="tel"
                className="input"
                placeholder="Phone"
                value={newCustomer.contactPhone}
                onChange={(e) => setNewCustomer({ ...newCustomer, contactPhone: e.target.value })}
              />
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
            <strong>💡 {t('language') === 'th' ? 'หมายเหตุ' : 'Note'}:</strong> {t('language') === 'th' 
              ? 'ข้อมูลเพิ่มเติม เช่น รหัสไปรษณีย์ และพิกัด GPS สามารถเพิ่มได้ภายหลังโดยผู้จัดการ' 
              : 'Additional details like postal code and GPS coordinates can be added later by the manager.'}
          </div>
        </div>
      </Modal>

      {/* Edit Customer Status Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('edit_customer')}
        subtitle={editingLocation?.location.name}
        footer={
          <>
            <button 
              onClick={() => setIsEditModalOpen(false)} 
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleSaveStatus} 
              className="btn btn-primary px-6"
            >
              <Save size={18} />
              {t('save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Customer Status */}
          <div>
            <label className="label">{t('customer_status')}</label>
            <div className="space-y-2">
              {(['active', 'closed', 'inactive'] as CustomerStatus[]).map(status => (
                <label
                  key={status}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    editStatus === status
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={editStatus === status}
                    onChange={(e) => setEditStatus(e.target.value as CustomerStatus)}
                    className="hidden"
                  />
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    editStatus === status
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-slate-300"
                  )}>
                    {editStatus === status && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="font-medium text-slate-900">{getStatusLabel(status)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Note */}
          <div>
            <label className="label flex items-center gap-2">
              {t('status_note')}
              {(editStatus === 'closed' || editStatus === 'inactive') && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <textarea
              className="input w-full h-24 resize-none"
              placeholder={language === 'th' ? 'ระบุเหตุผล...' : 'Enter reason...'}
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
            />
            {(editStatus === 'closed' || editStatus === 'inactive') && (
              <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">{t('status_note_required')}</p>
              </div>
            )}
          </div>

          {/* Previous Note (if exists) */}
          {editingLocation?.location.statusNote && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs font-medium text-slate-600 mb-1">
                {language === 'th' ? 'หมายเหตุก่อนหน้า:' : 'Previous note:'}
              </p>
              <p className="text-sm text-slate-700">{editingLocation.location.statusNote}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
