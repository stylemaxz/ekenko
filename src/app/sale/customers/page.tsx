"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, Plus, User, X, Save, Building2, Edit, AlertCircle, CheckCircle2, FileText, Image as ImageIcon, Navigation, Eye } from "lucide-react";
import Image from "next/image";
import { Company, Location, LocationStatus } from "@/types";
import { thaiAddressDatabase } from "@/utils/thaiAddressData";
import { clsx } from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";

export default function SaleCustomersPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { showToast } = useToast();
  
  // Mock current user ID
  // Current User State
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch companies and current user
  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, userRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/auth/me')
        ]);

        if (companiesRes.ok && userRes.ok) {
          const companiesData = await companiesRes.json();
          const userData = await userRes.json();
          setCompanies(companiesData);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load customers', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
  const [editStatus, setEditStatus] = useState<LocationStatus>("lead");
  const [editNote, setEditNote] = useState("");
  
  // Existing Customer Details State
  const [editOfficialName, setEditOfficialName] = useState("");
  const [editCustomerType, setEditCustomerType] = useState<"individual" | "juristic">("individual");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editOwnerPhone, setEditOwnerPhone] = useState("");
  const [editDocuments, setEditDocuments] = useState<string[]>([]);
  const [editShippingAddress, setEditShippingAddress] = useState("");
  const [editReceiverName, setEditReceiverName] = useState("");
  const [editReceiverPhone, setEditReceiverPhone] = useState("");
  const [editCreditTerm, setEditCreditTerm] = useState(0);
  const [editVatType, setEditVatType] = useState<"ex-vat" | "in-vat" | "non-vat">("in-vat");
  const [editPromotionNotes, setEditPromotionNotes] = useState("");
  
  // Address & Map Fields
  const [editCode, setEditCode] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editProvince, setEditProvince] = useState("");
  const [editGoogleMapLink, setEditGoogleMapLink] = useState("");
  const [editRegion, setEditRegion] = useState("");
  
  // Dropdown visibility state
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(true);
  const [showBranchDropdown, setShowBranchDropdown] = useState(true);

  // Filter: Show customers created by OR assigned to current user
  const myCustomers = (!currentUser || loading) ? [] : companies.map(company => ({
    ...company,
    locations: company.locations.filter(loc => 
        loc.createdBy === currentUser.id || 
        (loc.assignedEmployeeIds && loc.assignedEmployeeIds.includes(currentUser.id))
    )
  })).filter(company => company.locations.length > 0);

  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  const filteredCompanies = myCustomers.filter(company => {
    // 1. Search Query
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.locations.some(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Status Filter
    const matchesStatus = !statusFilter || company.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPageTitle = () => {
      if (statusFilter === 'lead') {
          return language === 'th' ? 'ลูกค้าใหม่' : 'New Customers';
      }
      return t('customers');
  };

  const searchAddressByPostalCode = (code: string) => {
    if (!code || code.length < 5) return [];
    return thaiAddressDatabase[code] || [];
  };

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

  const handleSaveCustomer = async () => {
      // Validation
      if (!newCustomer.companyName || !newCustomer.branchName || !newCustomer.address) {
          showToast(t('fill_required'), 'error');
          return;
      }

      try {
          // If the company already exists (selected from dropdown), we should probably use its ID.
          // BUT, companyService.createCompany creates a NEW company.
          // If the company name matches an existing one, the backend/db might create a duplicate or we should handle it.
          // For now, let's assume we are sending a structure that the backend can handle.
          // Ideally, we should check if company exists: if so, add location to it. If not, create everything.
          // However, the current backend `createCompany` creates a whole new structure.
          // Let's optimize: Check if company name matches existing company in `companies` state.
          
          const existingCompany = companies.find(c => c.name.toLowerCase() === newCustomer.companyName.toLowerCase());

          if (existingCompany) {
              // Add location to existing company
              // We need an endpoint for adding location or use UPDATE company.
              // companyService.updateCompany uses "upsert" for locations.
              // So we can send the existing company ID with the new location appended.
              
              const newLocation = {
                  // No ID or starts with loc_ tells backend it's new
                  name: newCustomer.branchName,
                  address: newCustomer.address,
                  lat: 13.75, // Default or use GPS if we had it
                  lng: 100.50,
                  status: "lead",
                  createdBy: currentUser?.id,
                  contacts: newCustomer.contactName ? [{
                      name: newCustomer.contactName,
                      role: "Owner", // Default role
                      phone: newCustomer.contactPhone
                  }] : []
              };

              const updatedCompany = {
                  ...existingCompany,
                  locations: [...existingCompany.locations, newLocation]
              };

              const res = await fetch(`/api/companies/${existingCompany.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedCompany)
              });

              if (!res.ok) throw new Error('Failed to update company');
              
              const data = await res.json();
               // Update local state with returning data from server to ensure sync
               // We should probably re-fetch or replace the item in the list
               setCompanies(prev => prev.map(c => c.id === data.id ? data : c));

              // Log Activity: New Branch Added
              await fetch('/api/activity-logs', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      employeeId: currentUser?.id,
                      type: 'customer_created', // Or create a new type 'branch_created' if preferred, but customer_created fits generic 'new customer'
                      description: language === 'th' ? `เพิ่มสาขาใหม่: ${newCustomer.companyName} (${newCustomer.branchName})` : `Added New Branch: ${newCustomer.companyName} (${newCustomer.branchName})`,
                      metadata: {
                         companyName: newCustomer.companyName,
                         branchName: newCustomer.branchName
                      }
                  })
              });

          } else {
            // Create New Company
            const newCompanyPayload = {
                name: newCustomer.companyName,
                grade: "C",
                status: "lead",
                locations: [{
                    name: newCustomer.branchName,
                    address: newCustomer.address,
                    lat: 13.75,
                    lng: 100.50,
                    status: "lead",
                    createdBy: currentUser?.id,
                    contacts: newCustomer.contactName ? [{
                        name: newCustomer.contactName,
                        role: "Owner",
                        phone: newCustomer.contactPhone
                    }] : []
                }]
            };

            const res = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCompanyPayload)
            });

            if (!res.ok) throw new Error('Failed to create company');
            
            const data = await res.json();
            setCompanies(prev => [data, ...prev]);

            // Log Activity: Customer Created
            await fetch('/api/activity-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: currentUser?.id,
                    type: 'customer_created',
                    description: language === 'th' ? `สร้างลูกค้าใหม่: ${newCustomer.companyName}` : `Created New Customer: ${newCustomer.companyName}`,
                    metadata: {
                       companyName: newCustomer.companyName,
                       branchName: newCustomer.branchName
                    }
                })
            });
          }

          setIsModalOpen(false);
          showToast(t('save_success'), 'success');
          
      } catch (error) {
          console.error("Error saving customer:", error);
          showToast('Failed to save customer', 'error');
      }
  };

  const handleEditCustomer = (company: Company, location: Location) => {
    setEditingLocation({ company, location });
    setEditStatus(location.status || "lead");
    setEditNote(location.statusNote || "");
    
    // Load existing customer details
    setEditOfficialName(location.officialName || "");
    setEditCustomerType(location.customerType || "individual");
    setEditOwnerName(location.ownerName || "");
    setEditOwnerPhone(location.ownerPhone || "");
    setEditDocuments(location.documents || []);
    setEditShippingAddress(location.shippingAddress || "");
    setEditReceiverName(location.receiverName || "");
    setEditReceiverPhone(location.receiverPhone || "");
    setEditCreditTerm(location.creditTerm || 0);
    setEditVatType(location.vatType || "in-vat");
    setEditPromotionNotes(location.promotionNotes || "");

    // Load Address & Map
    setEditCode(location.code || "");
    setEditAddress(location.address || "");
    setEditPostalCode(location.postalCode || "");
    setEditDistrict(location.district || "");
    setEditProvince(location.province || "");
    setEditGoogleMapLink(location.googleMapLink || "");
    setEditRegion(location.region || "");
    
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!editingLocation) return;

    // Validate: require note for closed/inactive status
    if ((editStatus === "closed" || editStatus === "inactive") && !editNote.trim()) {
      showToast(t('status_note_required'), 'error');
      return;
    }

    try {
        // We need to update the specific location in the company
        // Prepare the updated company object
        const companyToUpdate = companies.find(c => c.id === editingLocation.company.id);
        if (!companyToUpdate) return;

        const updatedLocations = companyToUpdate.locations.map(loc => {
            if (loc.id === editingLocation.location.id) {
                return {
                    ...loc,
                    status: editStatus,
                    statusNote: editNote.trim() || loc.statusNote,
                    // Update detailed fields if status is existing
                    ...(editStatus === 'existing' ? {
                        officialName: editOfficialName,
                        customerType: editCustomerType,
                        ownerName: editOwnerName,
                        ownerPhone: editOwnerPhone,
                        documents: editDocuments,
                        shippingAddress: editShippingAddress,
                        receiverName: editReceiverName,
                        receiverPhone: editReceiverPhone,
                        creditTerm: editCreditTerm,
                        vatType: editVatType,
                        promotionNotes: editPromotionNotes
                    } : {}),
                    // Update basic details always
                    code: editCode,
                    address: editAddress,
                    postalCode: editPostalCode,
                    district: editDistrict,
                    province: editProvince,
                    googleMapLink: editGoogleMapLink,
                    region: editRegion
                };
            }
            return loc;
        });

        const updatedCompany = {
            ...companyToUpdate,
            locations: updatedLocations
        };

        const res = await fetch(`/api/companies/${editingLocation.company.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCompany)
        });

        if (!res.ok) throw new Error('Failed to update status');

        const data = await res.json();
        
        // Update local state
        setCompanies(prev => prev.map(c => c.id === data.id ? data : c));

        // Call API to log activity
        await fetch('/api/activity-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employeeId: currentUser?.id,
                type: 'customer_status_changed',
                description: language === 'th' ? `เปลี่ยนสถานะลูกค้า: ${editingLocation.company.name}` : `Customer Status Changed: ${editingLocation.company.name}`,
                metadata: {
                   companyName: editingLocation.company.name,
                   oldStatus: editingLocation.location.status,
                   newStatus: editStatus,
                   note: editNote
                }
            })
        });

        setIsEditModalOpen(false);
        showToast(
            language === 'th' ? 'อัปเดตสถานะเรียบร้อย' : 'Status updated successfully',
            'success'
        );

    } catch (error) {
        console.error("Error updating status:", error);
        showToast('Failed to update status', 'error');
    }
  };

  const getStatusColor = (status?: LocationStatus) => {
    switch (status) {
      case 'existing':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'lead':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'terminate':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusLabel = (status?: LocationStatus) => {
    return t(`status_${status || 'lead'}` as any);
  };

  return (
    <div className="pb-24 pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{getPageTitle()}</h1>
          <button 
            onClick={handleAddCustomer}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-black/20 active:scale-95 transition-transform"
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
              className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                             "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-slate-100",
                             !company.logo && (company.status === 'existing' ? "bg-indigo-100 text-indigo-600" : "bg-teal-100 text-teal-600")
                          )}>
                             {company.logo ? (
                                 <Image 
                                    src={company.logo} 
                                    alt={company.name} 
                                    width={48} 
                                    height={48} 
                                    className="w-full h-full object-cover"
                                    unoptimized
                                 />
                             ) : (
                                 company.name.substring(0, 1)
                             )}
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900 text-lg">{company.name}</h3>
                              <span className={clsx(
                                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide",
                                  company.status === 'existing' || company.status === 'active' 
                                    ? "bg-green-100 text-green-700 border border-green-200" 
                                    : "bg-blue-50 text-blue-700 border border-blue-100"
                              )}>
                                  {company.status === 'existing' || company.status === 'active' 
                                    ? t('status_existing') // Use 'Existing' label for both active/existing for consistency if desired, or verify key
                                    : t('status_lead')}
                              </span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Locations List */}
                   <div className="space-y-4 mt-4 pl-2 border-t border-slate-50 pt-3">
                       {company.locations.map((loc) => (
                           <div key={loc.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                               <div className="flex items-start justify-between gap-2 mb-3">
                                   <div className="flex-1 min-w-0">
                                       <div className="flex items-center text-base text-slate-900 font-semibold mb-1">
                                           <MapPin size={16} className="text-primary mr-2 shrink-0" />
                                           <span className="truncate">{loc.name}</span>
                                       </div>
                                       <p className="text-xs text-slate-500 pl-6 leading-relaxed line-clamp-2">
                                           {loc.address} 
                                           {loc.district && `, ${loc.district}`}
                                           {loc.province && `, ${loc.province}`}
                                       </p>
                                   </div>
                                    <div className="flex items-center gap-1">
                                       <a
                                           href={loc.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           className="w-8 h-8 flex items-center justify-center text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                                           onClick={(e) => e.stopPropagation()}
                                       >
                                            <Navigation size={14} />
                                       </a>
                                       <button
                                           onClick={() => handleEditCustomer(company, loc)}
                                           className="w-8 h-8 flex items-center justify-center text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-colors"
                                       >
                                           <Edit size={14} />
                                       </button>
                                    </div>
                               </div>

                               {/* Contact Person Section */}
                               {loc.contacts && loc.contacts.length > 0 && (
                                   <div className="pl-6 border-t border-slate-200/50 pt-2 mt-2">
                                       {loc.contacts.map((contact, cIdx) => (
                                           <div key={cIdx} className="flex justify-between items-center py-1">
                                               <div>
                                                   <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                                       <User size={12} className="text-slate-400" />
                                                       {contact.name}
                                                       {contact.role && (
                                                           <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 rounded-sm font-normal">
                                                               {contact.role}
                                                           </span>
                                                       )}
                                                   </div>
                                                   {contact.phone && (
                                                       <div className="text-xs text-slate-500 pl-5">
                                                           {contact.phone}
                                                       </div>
                                                   )}
                                               </div>
                                               <div className="flex gap-2">
                                                   {contact.phone && (
                                                       <a href={`tel:${contact.phone}`} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                       </a>
                                                   )}
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               )}
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
              <Building2 size={16} className="text-primary" />
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
                        {matchingCompanies.map(company => {
                          const myBranchCount = company.locations.filter(loc => 
                             loc.createdBy === currentUser?.id || 
                             (loc.assignedEmployeeIds && loc.assignedEmployeeIds.includes(currentUser?.id))
                          ).length;

                          return (
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
                                {myBranchCount} {t('language') === 'th' ? 'สาขาที่คุณดูแล' : 'my branches'} • 
                                <span className={clsx(
                                    "ml-1",
                                    company.status === 'existing' ? "text-blue-600" : "text-teal-600"
                                )}>
                                    {company.status === 'existing' ? t('status_existing') : t('status_lead')}
                                </span>
                                </div>
                            </button>
                          );
                        })}
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
              <MapPin size={16} className="text-primary" />
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
                      loc.name.toLowerCase().includes(newCustomer.branchName.toLowerCase()) &&
                      (loc.createdBy === currentUser?.id || (loc.assignedEmployeeIds && loc.assignedEmployeeIds.includes(currentUser?.id)))
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
                  
                  // Show all branches from all companies with similar names (Only My Branches)
                  const allMatchingBranches = companies.flatMap(c => 
                    c.locations
                      .filter(loc => 
                          loc.name.toLowerCase().includes(newCustomer.branchName.toLowerCase()) &&
                          (loc.createdBy === currentUser?.id || (loc.assignedEmployeeIds && loc.assignedEmployeeIds.includes(currentUser?.id)))
                      )
                      .map(loc => ({ company: c, location: loc }))
                  );
                  
                  if (allMatchingBranches.length > 0) {
                    return (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <div className="p-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-medium">
                          ℹ️ {t('language') === 'th' ? 'พบสาขาที่คล้ายกัน' : 'Similar branches found'}:
                        </div>
                        {allMatchingBranches.map((item, idx) => (
                          <div
                            key={`${item.company.id}-${item.location.id}`}
                            className="p-3 border-b border-slate-50 last:border-0"
                          >
                            <div className="font-medium text-slate-900">{item.location.name}</div>
                            <div className="text-xs text-blue-600 font-medium mt-0.5">{item.company.name}</div>
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
        width="max-w-2xl"
      >
        <div className="space-y-4">
           {/* Company Logo & Header */}
           <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="relative w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                  {editingLocation?.company.logo ? (
                      <Image 
                          src={editingLocation.company.logo} 
                          alt="Logo" 
                          fill 
                          className="object-cover" 
                          unoptimized
                      />
                  ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-300">
                          <Building2 size={24} />
                      </div>
                  )}
              </div>
              <div>
                  <h3 className="font-bold text-slate-900 text-lg">{editingLocation?.company.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-xs">
                          {editingLocation?.company.taxId || 'Tax ID: -'}
                      </span>
                      <span>•</span>
                      <span>Grade {editingLocation?.company.grade || '-'}</span>
                  </div>
              </div>
           </div>

          {/* Customer Status */}
          <div>
            <label className="label">{t('customer_status')}</label>
            <div className="space-y-2">
              {(['lead', 'existing', 'closed', 'inactive', 'terminate'] as LocationStatus[]).map(status => (
                <label
                  key={status}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    editStatus === status
                      ? "border-primary bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={editStatus === status}
                    onChange={(e) => setEditStatus(e.target.value as LocationStatus)}
                    className="hidden"
                  />
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    editStatus === status
                      ? "border-primary bg-primary"
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
          {/* Existing Customer Details Form */}
          {editStatus === 'existing' && (
            <div className="p-4 bg-green-50/50 rounded-lg border border-green-100 space-y-4">
               <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 border-b border-green-200 pb-2 flex items-center gap-2">
                   <CheckCircle2 size={14} />
                   Active Customer Details
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                       <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('official_name')}</label>
                       <input 
                           value={editOfficialName}
                           onChange={(e) => setEditOfficialName(e.target.value)}
                           className="input w-full bg-white h-8 text-xs"
                           placeholder="Official Registered Name"
                       />
                   </div>
                   <div>
                       <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('customer_type')}</label>
                       <div className="flex gap-4 pt-1">
                           <label className="flex items-center gap-2 cursor-pointer">
                               <input 
                                   type="radio" 
                                   name="edit_ctype"
                                   checked={editCustomerType === 'individual'} 
                                   onChange={() => setEditCustomerType('individual')}
                                   className="text-green-600 focus:ring-green-500"
                               />
                               <span className="text-xs text-slate-700">{t('cust_individual')}</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                               <input 
                                   type="radio" 
                                   name="edit_ctype"
                                   checked={editCustomerType === 'juristic'}
                                   onChange={() => setEditCustomerType('juristic')}
                                   className="text-green-600 focus:ring-green-500"
                               />
                               <span className="text-xs text-slate-700">{t('cust_juristic')}</span>
                           </label>
                       </div>
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('owner_name')}</label>
                       <input 
                           value={editOwnerName}
                           onChange={(e) => setEditOwnerName(e.target.value)}
                           className="input w-full bg-white h-8 text-xs"
                       />
                   </div>
                   <div>
                       <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('owner_phone')}</label>
                       <input 
                           value={editOwnerPhone}
                           onChange={(e) => setEditOwnerPhone(e.target.value)}
                           className="input w-full bg-white h-8 text-xs"
                       />
                   </div>
               </div>

                {/* Address & Map */}
                <div className="bg-slate-50/50 p-3 rounded border border-slate-100">
                   <div className="grid grid-cols-2 gap-4 mb-3">
                       <div>
                           <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('store_code')}</label>
                           <input 
                               value={editCode}
                               onChange={(e) => setEditCode(e.target.value)}
                               className="input w-full bg-white h-8 text-xs"
                               placeholder="Store Code"
                           />
                       </div>
                       <div>
                           <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('google_maps_link')}</label>
                           <input 
                               value={editGoogleMapLink}
                               onChange={(e) => setEditGoogleMapLink(e.target.value)}
                               className="input w-full bg-white h-8 text-xs text-blue-600"
                               placeholder="https://maps..."
                           />
                       </div>
                   </div>
                   
                   <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('address')}</label>
                   <input 
                       value={editAddress}
                       onChange={(e) => setEditAddress(e.target.value)}
                       className="input w-full bg-white h-8 text-xs mb-3"
                       placeholder="Address"
                   />
                   
                   <div className="grid grid-cols-3 gap-3">
                       <div>
                           <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('postal_code')}</label>
                           <input 
                               value={editPostalCode}
                               onChange={(e) => setEditPostalCode(e.target.value)}
                               className="input w-full bg-white h-8 text-xs"
                               placeholder="Postal Code"
                               maxLength={5}
                           />
                       </div>
                       <div>
                           <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('district')}</label>
                           {searchAddressByPostalCode(editPostalCode).length > 0 ? (
                               <select
                                    value={editDistrict}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setEditDistrict(val);
                                        const matches = searchAddressByPostalCode(editPostalCode);
                                        const match = matches.find(m => 
                                            language === 'th' ? m.districtTH === val : m.district === val
                                        );
                                        if (match) {
                                            setEditProvince(language === 'th' ? match.provinceTH : match.province);
                                        }
                                    }}
                                    className="input w-full bg-white h-8 text-xs p-1"
                               >
                                    <option value="">{t('select_district') || "Select..."}</option>
                                    {searchAddressByPostalCode(editPostalCode).map((m, i) => (
                                        <option key={i} value={language === 'th' ? m.districtTH : m.district}>
                                            {language === 'th' ? m.districtTH : m.district}
                                        </option>
                                    ))}
                               </select>
                           ) : (
                               <input 
                                   value={editDistrict}
                                   onChange={(e) => setEditDistrict(e.target.value)}
                                   className="input w-full bg-white h-8 text-xs"
                                   placeholder="District"
                               />
                           )}
                       </div>
                       <div>
                           <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('province')}</label>
                           <input 
                               value={editProvince}
                               onChange={(e) => setEditProvince(e.target.value)}
                               className="input w-full bg-white h-8 text-xs"
                               placeholder="Province"
                           />
                       </div>
                   </div>
                   
                   {/* Region Display */}
                   <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Zone / Region</span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {editRegion || t('auto_detected')}
                        </span>
                   </div>
                </div>

               {/* Documents Upload */}
               <div>
                   <label className="text-[10px] font-semibold text-slate-500 uppercase mb-2 block">{t('documents_upload')} (Max 6)</label>
                   <div className="flex flex-wrap gap-2">
                       {editDocuments.map((doc, docIdx) => (
                           <div key={docIdx} className="relative w-16 h-16 bg-white border border-slate-200 rounded flex items-center justify-center group overflow-hidden">
                               {doc.startsWith('data:image') ? (
                                   <Image src={doc} alt="Doc" fill className="object-cover" unoptimized />
                               ) : (
                                   <div className="text-center p-1">
                                       <FileText size={20} className="mx-auto text-slate-400" />
                                       <span className="text-[8px] text-slate-400 block truncate w-14">File {docIdx+1}</span>
                                   </div>
                               )}
                               <button 
                                   onClick={() => setEditDocuments(prev => prev.filter((_, i) => i !== docIdx))}
                                   className="absolute top-0 right-0 p-0.5 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                   <X size={10} />
                               </button>
                           </div>
                       ))}
                       
                       {editDocuments.length < 6 && (
                           <label className="w-16 h-16 border-2 border-dashed border-green-200 rounded flex flex-col items-center justify-center text-green-400 hover:text-green-600 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all">
                               <Plus size={16} />
                               <span className="text-[8px] font-bold">ADD</span>
                               <input 
                                   type="file" 
                                   accept="image/*,application/pdf"
                                   className="hidden"
                                   onChange={(e) => {
                                       if (e.target.files && e.target.files[0]) {
                                           const file = e.target.files[0];
                                           const reader = new FileReader();
                                           reader.onloadend = () => {
                                               setEditDocuments(prev => [...prev, reader.result as string]);
                                           };
                                           reader.readAsDataURL(file);
                                       }
                                   }}
                               />
                           </label>
                       )}
                   </div>
               </div>

               {/* Shipping Info */}
               <div>
                   <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('shipping_address')}</label>
                   <input 
                       value={editShippingAddress}
                       onChange={(e) => setEditShippingAddress(e.target.value)}
                       className="input w-full bg-white h-8 text-xs"
                   />
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('receiver_name')}</label>
                       <input 
                           value={editReceiverName}
                           onChange={(e) => setEditReceiverName(e.target.value)}
                           className="input w-full bg-white h-8 text-xs"
                       />
                   </div>
                   <div>
                       <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('receiver_phone')}</label>
                       <input 
                           value={editReceiverPhone}
                           onChange={(e) => setEditReceiverPhone(e.target.value)}
                           className="input w-full bg-white h-8 text-xs"
                       />
                   </div>
               </div>

               {/* Financials */}
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('credit_term')}</label>
                       <select 
                           value={editCreditTerm} 
                           onChange={(e) => setEditCreditTerm(parseInt(e.target.value))}
                           className="input w-full bg-white h-8 text-xs"
                       >
                           {[0, 5, 15, 30, 45, 60, 90].map(d => (
                               <option key={d} value={d}>{d} {t('days')}</option>
                           ))}
                       </select>
                   </div>
                   <div>
                       <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('vat_type')}</label>
                       <select 
                           value={editVatType} 
                           onChange={(e) => setEditVatType(e.target.value as any)}
                           className="input w-full bg-white h-8 text-xs"
                       >
                           <option value="ex-vat">{t('vat_ex')}</option>
                           <option value="in-vat">{t('vat_in')}</option>
                           <option value="non-vat">{t('vat_non')}</option>
                       </select>
                   </div>
               </div>
               
               {/* Promotion Notes */}
               <div>
                   <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('promotion_notes')}</label>
                   <textarea
                       value={editPromotionNotes}
                       onChange={(e) => setEditPromotionNotes(e.target.value)}
                       className="input w-full bg-white h-20 text-xs resize-none"
                       placeholder="Promotion / Price details..."
                   />
               </div>
            </div>
          )}

          {/* Action Buttons moved inside body */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
             <button 
               onClick={() => setIsEditModalOpen(false)} 
               className="flex-1 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
             >
               {t('cancel')}
             </button>
             <button 
               onClick={handleSaveStatus} 
               className="flex-1 btn btn-primary px-6 flex items-center justify-center gap-2"
             >
               <Save size={18} />
               {t('save')}
             </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
