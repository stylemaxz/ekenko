"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical,
  Box,
  BarChart3,
  Edit,
  Trash2,
  History,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { clsx } from "clsx";
import type { Asset, AssetStatus, AssetCondition } from "@prisma/client";

// Extended Asset Type for Frontend if needed (e.g. including relations)
interface ExtendedAsset extends Asset {
    location?: { 
        id: string;
        name: string;
        company?: { 
            id: string;
            name: string;
        };
    };
    contractItems?: { contract: { contractNumber: string, customer: { name: string } } }[];
}

export default function AdminAssetsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  const [assets, setAssets] = useState<ExtendedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'ALL'>('ALL');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Partial<Asset> | null>(null);
  
  // Customer Assignment States
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Fetch Assets
  const fetchAssets = async () => {
    try {
        setLoading(true);
        const res = await fetch('/api/assets'); 
        if (!res.ok) throw new Error('Failed to fetch assets');
        const data = await res.json();
        setAssets(data);
    } catch (error) {
        console.error(error);
        showToast(t('load_failed'), 'error');
    } finally {
        setLoading(false);
    }
  };

  const fetchCompanies = async () => {
      try {
          const res = await fetch('/api/companies');
          if (res.ok) {
              const data = await res.json();
              setCompanies(data);
          }
      } catch (error) {
          console.error("Failed to fetch companies", error);
      }
  };

  useEffect(() => {
    fetchAssets();
    fetchCompanies();
  }, []);

  // Filter Logic
  const filteredAssets = assets.filter(asset => {
      const matchesSearch = 
        asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.modelName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;
      
      return matchesSearch && matchesStatus;
  });

  // Calculate Statistics
  const totalAssets = assets.length;
  const assetsByStatus = {
      AVAILABLE: assets.filter(a => a.status === 'AVAILABLE').length,
      RENTED: assets.filter(a => a.status === 'RENTED').length,
      MAINTENANCE: assets.filter(a => a.status === 'MAINTENANCE').length,
      RESERVED: assets.filter(a => a.status === 'RESERVED').length,
      SPARE: assets.filter(a => a.status === 'SPARE').length,
      DISPOSAL: assets.filter(a => a.status === 'DISPOSAL').length,
      LOST: assets.filter(a => a.status === 'LOST').length,
  };

  // Handle Company Selection to filter Locations
  useEffect(() => {
      if (selectedCompanyId) {
          const company = companies.find(c => c.id === selectedCompanyId);
          if (company) {
              setAvailableLocations(company.locations || []);
          } else {
              setAvailableLocations([]);
          }
      } else {
          setAvailableLocations([]);
      }
  }, [selectedCompanyId, companies]);

  // Handlers
  const handleAddAsset = () => {
      setEditingAsset({
          serialNumber: "",
          modelName: "",
          status: "AVAILABLE",
          condition: "NEW",
          purchaseDate: new Date(),
          cost: 0,
          currentLocationId: null
      });
      setSelectedCompanyId("");
      setIsModalOpen(true);
  };

  const handleEditAsset = (asset: ExtendedAsset) => {
      setEditingAsset(asset);
      // Pre-fill selection if asset has location
      if (asset.location?.company?.id) {
          setSelectedCompanyId(asset.location.company.id);
          setCustomerSearchQuery(asset.location.company.name || "");
          setLocationSearchQuery(asset.location.name || "");
      } else {
          setSelectedCompanyId("");
          setCustomerSearchQuery("");
          setLocationSearchQuery("");
      }
      setIsModalOpen(true);
  };

  const handleSave = async () => {
      if (!editingAsset) return;
      
      try {
          const method = editingAsset.id ? 'PUT' : 'POST';
          const url = editingAsset.id ? `/api/assets/${editingAsset.id}` : '/api/assets';
          
          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(editingAsset)
          });
          
          if (!res.ok) throw new Error('Save failed');
          
          showToast(t('save_success'), 'success');
          setIsModalOpen(false);
          fetchAssets();
          
      } catch (error) {
           console.error(error);
           showToast(t('save_failed'), 'error');
      }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('asset_management_title')}</h1>
           <p className="text-slate-500 text-sm">{t('asset_management_subtitle')}</p>
        </div>
        <button onClick={handleAddAsset} className="btn btn-primary shadow-lg shadow-indigo-200">
           <Plus size={20} />
           {t('add_asset')}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="card p-4">
              <div className="text-sm text-slate-500 mb-1">{t('total_assets')}</div>
              <div className="text-2xl font-bold text-slate-900">{totalAssets}</div>
          </div>
          <div className="card p-4">
              <div className="text-sm text-slate-500 mb-1">{t('status_available')}</div>
              <div className="text-2xl font-bold text-green-600">{assetsByStatus.AVAILABLE}</div>
          </div>
          <div className="card p-4">
              <div className="text-sm text-slate-500 mb-1">{t('status_rented')}</div>
              <div className="text-2xl font-bold text-blue-600">{assetsByStatus.RENTED}</div>
          </div>
          <div className="card p-4">
              <div className="text-sm text-slate-500 mb-1">{t('status_spare')}</div>
              <div className="text-2xl font-bold text-indigo-600">{assetsByStatus.SPARE}</div>
          </div>
          <div className="card p-4">
              <div className="text-sm text-slate-500 mb-1">{t('status_maintenance')}</div>
              <div className="text-2xl font-bold text-amber-600">{assetsByStatus.MAINTENANCE}</div>
          </div>
          <div className="card p-4">
              <div className="text-sm text-slate-500 mb-1">{t('status_reserved')}</div>
              <div className="text-2xl font-bold text-purple-600">{assetsByStatus.RESERVED}</div>
          </div>
          <div className="card p-4">
              <div className="text-sm text-slate-500 mb-1">{t('status_disposal')}</div>
              <div className="text-2xl font-bold text-slate-600">{assetsByStatus.DISPOSAL}</div>
          </div>
          <div className="card p-4">
              <div className="text-sm text-slate-500 mb-1">{t('status_lost')}</div>
              <div className="text-2xl font-bold text-red-600">{assetsByStatus.LOST}</div>
          </div>
      </div>


      {/* Filters */}
      <div className="card mb-6 p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                 type="text" 
                 placeholder={t('search_asset_placeholder')}
                 className="input pl-10 w-full"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          <select 
             className="input w-full md:w-48"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value as any)}
          >
              <option value="ALL">{t('all_status')}</option>
              <option value="AVAILABLE">{t('status_available')}</option>
              <option value="RENTED">{t('status_rented')}</option>
              <option value="MAINTENANCE">{t('status_maintenance')}</option>
              <option value="RESERVED">{t('status_reserved')}</option>
              <option value="SPARE">{t('status_spare')}</option>
              <option value="DISPOSAL">{t('status_disposal')}</option>
              <option value="LOST">{t('status_lost')}</option>
          </select>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('col_asset_info')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('status')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('col_condition')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('col_location')}</th>
                      <th className="px-6 py-4 text-end text-xs font-bold text-slate-500 uppercase tracking-wider">{t('col_actions')}</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center"><div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 rounded-full border-t-transparent"></div></td></tr>
                  ) : filteredAssets.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">{t('no_activities_found')}</td></tr>
                  ) : filteredAssets.map((asset) => (
                      <tr 
                        key={asset.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/assets/${asset.id}`)}
                      >
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                      <Box size={20} />
                                  </div>
                                  <div>
                                      <div className="font-bold text-slate-900 group-hover:text-indigo-600">
                                          {asset.modelName}
                                      </div>
                                      <div className="text-xs text-slate-500 font-mono">{asset.serialNumber}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <span className={clsx(
                                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                                  asset.status === 'AVAILABLE' ? "bg-green-100 text-green-700" :
                                  asset.status === 'RENTED' ? "bg-blue-100 text-blue-700" :
                                  asset.status === 'MAINTENANCE' ? "bg-orange-100 text-orange-700" :
                                  "bg-slate-100 text-slate-700"
                              )}>
                                  {t(`status_${asset.status.toLowerCase()}` as any) || asset.status}
                              </span>
                          </td>
                          <td className="px-6 py-4">
                               <span className="text-sm text-slate-600 capitalize">{t(`condition_${asset.condition.toLowerCase()}` as any) || asset.condition}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                               {asset.location?.company?.name ? (
                                   <div className="flex flex-col">
                                       <span className="font-semibold">{asset.location.company.name}</span>
                                       <span className="text-xs text-slate-400">{asset.location.name}</span>
                                   </div>
                               ) : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                  <div className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600">
                                      <Eye size={16} />
                                  </div>
                                  <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditAsset(asset);
                                    }} 
                                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600"
                                  >
                                      <Edit size={16} />
                                  </button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
      
       <Modal 
           isOpen={isModalOpen} 
           onClose={() => setIsModalOpen(false)}
           title={editingAsset?.id ? t('edit_asset') : t('add_new_asset')}
       >
           <div className="space-y-4">
               <div>
                   <label className="label">{t('serial_number')}</label>
                   <input 
                       className="input w-full" 
                       value={editingAsset?.serialNumber || ''} 
                       onChange={e => setEditingAsset({...editingAsset, serialNumber: e.target.value})}
                   />
               </div>
               <div>
                   <label className="label">{t('model_name')}</label>
                   <input 
                       className="input w-full" 
                       value={editingAsset?.modelName || ''} 
                       onChange={e => setEditingAsset({...editingAsset, modelName: e.target.value})}
                   />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="label">{t('status')}</label>
                       <select 
                           className="input w-full"
                           value={editingAsset?.status || 'AVAILABLE'}
                           onChange={e => setEditingAsset({...editingAsset, status: e.target.value as any})}
                       >
                            <option value="AVAILABLE">{t('status_available')}</option>
                            <option value="RENTED">{t('status_rented')}</option>
                            <option value="MAINTENANCE">{t('status_maintenance')}</option>
                            <option value="RESERVED">{t('status_reserved')}</option>
                            <option value="SPARE">{t('status_spare')}</option>
                            <option value="DISPOSAL">{t('status_disposal')}</option>
                            <option value="LOST">{t('status_lost')}</option>
                       </select>
                   </div>
                   <div>
                       <label className="label">{t('condition')}</label>
                       <select 
                           className="input w-full"
                           value={editingAsset?.condition || 'NEW'}
                           onChange={e => setEditingAsset({...editingAsset, condition: e.target.value as any})}
                       >
                            <option value="NEW">{t('condition_new')}</option>
                            <option value="USED">{t('condition_used')}</option>
                            <option value="REFURBISHED">{t('condition_refurbished')}</option>
                            <option value="BROKEN">{t('condition_broken')}</option>
                       </select>
                   </div>
               </div>

               <div className="border-t border-slate-100 pt-4">
                   <h4 className="text-sm font-semibold text-slate-900 mb-3">Customer Assignment</h4>
                   <div className="grid grid-cols-1 gap-4">
                        <div className="relative">
                            <label className="label">{t('customer_company')}</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder={t('search_customer')}
                                value={customerSearchQuery}
                                onChange={e => setCustomerSearchQuery(e.target.value)}
                                onFocus={() => setShowCustomerDropdown(true)}
                                onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                            />
                            {showCustomerDropdown && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    <div
                                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-slate-500"
                                        onClick={() => {
                                            setSelectedCompanyId("");
                                            setCustomerSearchQuery("");
                                            setEditingAsset({...editingAsset, currentLocationId: null});
                                            setShowCustomerDropdown(false);
                                        }}
                                    >
                                        {t('no_assignment')}
                                    </div>
                                    {companies
                                        .filter(c => c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()))
                                        .map(c => (
                                            <div
                                                key={c.id}
                                                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedCompanyId(c.id);
                                                    setCustomerSearchQuery(c.name);
                                                    setEditingAsset({...editingAsset, currentLocationId: null});
                                                    setShowCustomerDropdown(false);
                                                }}
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                       
                        {selectedCompanyId && (
                            <div className="relative">
                                <label className="label">{t('location_branch')}</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder={t('search_location')}
                                    value={locationSearchQuery}
                                    onChange={e => setLocationSearchQuery(e.target.value)}
                                    onFocus={() => setShowLocationDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                                />
                                {showLocationDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        <div
                                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-slate-500"
                                            onClick={() => {
                                                setEditingAsset({...editingAsset, currentLocationId: null});
                                                setLocationSearchQuery("");
                                                setShowLocationDropdown(false);
                                            }}
                                        >
                                            {t('select_branch')}
                                        </div>
                                        {availableLocations
                                            .filter(loc => loc.name.toLowerCase().includes(locationSearchQuery.toLowerCase()))
                                            .map(loc => (
                                                <div
                                                    key={loc.id}
                                                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                                                    onClick={() => {
                                                        setEditingAsset({...editingAsset, currentLocationId: loc.id});
                                                        setLocationSearchQuery(loc.name);
                                                        setShowLocationDropdown(false);
                                                    }}
                                                >
                                                    {loc.name}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                
                <div className="pt-4 flex justify-end gap-2">
                    <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost">{t('close')}</button>
                    <button onClick={handleSave} className="btn btn-primary">{t('save_changes')}</button>
                </div>
               </div>
           </div>
       </Modal>
    </div>
  );
}
