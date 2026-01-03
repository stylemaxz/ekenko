"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Search, 
  Plus, 
  MapPin, 
  Trash2, 
  Save, 
  User, 
  Edit,
  UserPlus,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";

import { Company, Location, ContactPerson, Employee } from "@/types";
import { clsx } from "clsx";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { searchAddressByPostalCode } from "@/utils/thaiAddressData";

// --- Region Mapping Logic ---
const REGION_MAPPING: Record<string, string[]> = {
    // Bangkok Districts (BKK1)
    "BKK1": ["ดอนเมือง", "สายไหม", "หลักสี่", "บางเขน", "คลองสามวา", "บางซื่อ", "จตุจักร", "ลาดพร้าว", "บึงกุ่ม", "คันนายาว", "วังทองหลาง", "บางกะปิ", "พญาไท", "ราชเทวี", "ดินแดง", "ห้วยขวาง",
             "Don Mueang", "Sai Mai", "Lak Si", "Bang Khen", "Khlong Sam Wa", "Bang Sue", "Chatuchak", "Lat Phrao", "Bueng Kum", "Khan Na Yao", "Wang Thonglang", "Bang Kapi", "Phaya Thai", "Ratchathewi", "Din Daeng", "Huai Khwang"],
    // Bangkok Districts (BKK2)
    "BKK2": ["ทวีวัฒนา", "ตลิ่งชัน", "บางพลัด", "บางกอกน้อย", "บางกอกใหญ่", "ภาษีเจริญ", "ธนบุรี", "คลองสาน", "พระนคร", "ป้อมปราบศัตรูพ่าย", "สัมพันธวงศ์", "หนองแขม", "บางแค", "จอมทอง", "ราษฎร์บูรณะ", "ทุ่งครุ", "บางขุนเทียน", "บางบอน",
             "Thawi Watthana", "Taling Chan", "Bang Phlat", "Bangkok Noi", "Bangkok Yai", "Phasi Charoen", "Thon Buri", "Khlong San", "Phra Nakhon", "Pom Prap Sattru Phai", "Samphanthawong", "Nong Khaem", "Bang Khae", "Chom Thong", "Rat Burana", "Thung Khru", "Bang Khun Thian", "Bang Bon"],
    // Bangkok Districts (BKK3) - Note: Also includes Samut Prakan Province
    "BKK3": ["หนองจอก", "มีนบุรี", "ลาดกระบัง", "สะพานสูง", "สวนหลวง", "วัฒนา", "คลองเตย", "พระโขนง", "บางนา", "ประเวศ", 
             "Nong Chok", "Min Buri", "Lat Krabang", "Saphan Sung", "Suan Luang", "Watthana", "Khlong Toei", "Phra Khanong", "Bang Na", "Prawet"],
    // Bangkok Districts (BKK4)
    "BKK4": ["ปทุมวัน", "บางรัก", "สาทร", "บางคอแหลม", "ยานนาวา",
             "Pathum Wan", "Bang Rak", "Sathon", "Bang Kho Laem", "Yan Nawa"],
    
    // Northern Provinces (NOR)
    "NOR": ["เชียงราย", "แม่ฮ่องสอน", "เชียงใหม่", "พะเยา", "น่าน", "ลำพูน", "ลำปาง", "แพร่", "อุตรดิตถ์", "สุโขทัย", "ตาก", "พิษณุโลก",
            "Chiang Rai", "Mae Hong Son", "Chiang Mai", "Phayao", "Nan", "Lamphun", "Lampang", "Phrae", "Uttaradit", "Sukhothai", "Tak", "Phitsanulok"],
    
    // Northeast (ESA1)
    "ESA1": ["เลย", "หนองคาย", "บึงกาฬ", "อุดรธานี", "สกลนคร", "นครพนม", "หนองบัวลำภู", "ขอนแก่น", "กาฬสินธุ์", "มุกดาหาร", "ชัยภูมิ",
             "Loei", "Nong Khai", "Bueng Kan", "Udon Thani", "Sakon Nakhon", "Nakhon Phanom", "Nong Bua Lamphu", "Khon Kaen", "Kalasin", "Mukdahan", "Chaiyaphum"],
    
    // Northeast (ESA2)
    "ESA2": ["นครราชสีมา", "มหาสารคาม", "ร้อยเอ็ด", "ยโสธร", "อำนาจเจริญ", "อุบลราชธานี", "บุรีรัมย์", "สุรินทร์", "ศรีสะเกษ",
             "Nakhon Ratchasima", "Maha Sarakham", "Roi Et", "Yasothon", "Amnat Charoen", "Ubon Ratchathani", "Buri Ram", "Surin", "Si Sa Ket"],
    
    // Central & West (CEN)
    "CEN": ["กำแพงเพชร", "พิจิตร", "เพชรบูรณ์", "นครสวรรค์", "อุทัยธานี", "ชัยนาท", "สิงห์บุรี", "ลพบุรี", "อ่างทอง", "สระบุรี", "นครนายก", "พระนครศรีอยุธยา", "สุพรรณบุรี", "กาญจนบุรี", "ปทุมธานี", "นนทบุรี", "นครปฐม", "สมุทรสาคร", "สมุทรสงคราม", "ราชบุรี", "เพชรบุรี", "ประจวบคีรีขันธ์",
            "Kamphaeng Phet", "Phichit", "Phetchabun", "Nakhon Sawan", "Uthai Thani", "Chai Nat", "Sing Buri", "Lop Buri", "Ang Thong", "Saraburi", "Nakhon Nayok", "Phra Nakhon Si Ayutthaya", "Suphan Buri", "Kanchanaburi", "Pathum Thani", "Nonthaburi", "Nakhon Pathom", "Samut Sakhon", "Samut Songkhram", "Ratchaburi", "Phetchaburi", "Prachuap Khiri Khan"],
    
    // East (EST)
    "EST": ["ปราจีนบุรี", "สระแก้ว", "ฉะเชิงเทรา", "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด",
            "Prachin Buri", "Sa Kaeo", "Chachoengsao", "Chon Buri", "Rayong", "Chanthaburi", "Trat"],
            
    // South (SOU)
    "SOU": ["ชุมพร", "ระนอง", "สุราษฎร์ธานี", "พังงา", "นครศรีธรรมราช", "กระบี่", "ภูเก็ต", "ตรัง", "พัทลุง", "สตูล", "สงขลา", "ปัตตานี", "ยะลา", "นราธิวาส",
            "Chumphon", "Ranong", "Surat Thani", "Phangnga", "Nakhon Si Thammarat", "Krabi", "Phuket", "Trang", "Phatthalung", "Satun", "Songkhla", "Pattani", "Yala", "Narathiwat"]
};

const getRegion = (province: string, district?: string): string => {
    if (!province) return "";
    
    // Normalize inputs
    const p = province.trim();
    const d = district ? district.trim() : "";

    // 1. Check for Special Province Cases
    if (p === "สมุทรปราการ" || p === "Samut Prakan") return "BKK3";

    // 2. Bangkok Case - Check District
    if (p.includes("กรุงเทพ") || p.includes("Bangkok")) {
        if (!d) return "BKK"; // Fallback if no district
        if (REGION_MAPPING["BKK1"].some(x => d.includes(x))) return "BKK1";
        if (REGION_MAPPING["BKK2"].some(x => d.includes(x))) return "BKK2";
        if (REGION_MAPPING["BKK3"].some(x => d.includes(x))) return "BKK3";
        if (REGION_MAPPING["BKK4"].some(x => d.includes(x))) return "BKK4";
        return "BKK"; // Unknown district
    }

    // 3. Other Provinces
    if (REGION_MAPPING["NOR"].includes(p)) return "NOR";
    if (REGION_MAPPING["ESA1"].includes(p)) return "ESA1";
    if (REGION_MAPPING["ESA2"].includes(p)) return "ESA2";
    if (REGION_MAPPING["CEN"].includes(p)) return "CEN";
    if (REGION_MAPPING["EST"].includes(p)) return "EST";
    if (REGION_MAPPING["SOU"].includes(p)) return "SOU";

    return "Other";
};

export default function CustomersPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch companies and employees
  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, employeesRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/employees')
        ]);
        
        if (!companiesRes.ok || !employeesRes.ok) throw new Error('Failed to fetch data');
        
        const companiesData = await companiesRes.json();
        const employeesData = await employeesRes.json();
        
        setCompanies(companiesData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  
  // Saving State
  const [isSaving, setIsSaving] = useState(false);

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
      // Create a deep copy
      const copy = JSON.parse(JSON.stringify(company));
      
      // Auto-calculate regions for all locations if missing
      // AND MIGRATE EXISTING -> ACTIVE
      if (copy.status === 'existing') copy.status = 'active';

      copy.locations.forEach((loc: any) => {
          if (!loc.region) {
              loc.region = getRegion(loc.province || '', loc.district || '');
          }
          if (loc.status === 'existing') loc.status = 'active';
      });

      setEditingCompany(copy); 
      setIsModalOpen(true);
  };

  const deleteCompany = (id: string) => {
      setCompanyToDelete(id);
      setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
      if (companyToDelete) {
          try {
              const res = await fetch(`/api/companies/${companyToDelete}`, {
                  method: 'DELETE',
              });
              
              if (!res.ok) throw new Error('Delete failed');
              
              showToast(t('delete_success'), 'success');
              
              const deletedCompany = companies.find(c => c.id === companyToDelete);
              if (deletedCompany) {
                 // Log Activity: Customer Deleted
                 await fetch('/api/activity-logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'customer_status_changed', // Reuse status changed or create new type
                        employeeId: '4',
                        description: language === 'th' ? `ลบลูกค้า: ${deletedCompany.name}` : `Deleted Customer: ${deletedCompany.name}`,
                        metadata: {
                           companyName: deletedCompany.name,
                           action: 'delete'
                        }
                    })
                 });
              }

              setCompanyToDelete(null);
              setIsDeleteDialogOpen(false);
              
              // Refresh companies list
              const refreshRes = await fetch('/api/companies');
              if (refreshRes.ok) {
                  const data = await refreshRes.json();
                  setCompanies(data);
              }
          } catch (error) {
              console.error(error);
              showToast('Failed to delete company', 'error');
          }
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingCompany) return;

      setIsSaving(true);
      try {
          const isExisting = companies.some(c => c.id === editingCompany.id);
          
          if (isExisting) {
              // Update
              const res = await fetch(`/api/companies/${editingCompany.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editingCompany),
              });
              
              if (!res.ok) {
                  const error = await res.json();
                  throw new Error(error.error || 'Failed to update');
              }
              
              // Log Activity: Customer Updated
              await fetch('/api/activity-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'customer_status_changed',
                    employeeId: '4', // Mock Admin ID for now or fetch actual admin
                    description: language === 'th' ? `อัปเดตข้อมูลลูกค้า: ${editingCompany.name}` : `Updated Customer Info: ${editingCompany.name}`,
                    metadata: {
                       companyName: editingCompany.name
                    }
                })
              });
          } else {
              // Create
              const res = await fetch('/api/companies', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editingCompany),
              });
              
              if (!res.ok) {
                  const error = await res.json();
                  throw new Error(error.error || 'Failed to create');
              }

              // Log Activity: Customer Created
              await fetch('/api/activity-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'customer_created',
                    employeeId: '4', // Mock Admin ID
                    description: language === 'th' ? `สร้างลูกค้าใหม่: ${editingCompany.name}` : `Created New Customer: ${editingCompany.name}`,
                    metadata: {
                       companyName: editingCompany.name
                    }
                })
              });
          }
          
          setIsModalOpen(false);
          showToast(t('save_success'), 'success');
          
          // Refresh companies list
          const res = await fetch('/api/companies');
          if (res.ok) {
              const data = await res.json();
              setCompanies(data);
          }
      } catch (error: any) {
          console.error(error);
          showToast(error.message || 'Failed to save', 'error');
      } finally {
          setIsSaving(false);
      }
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
            code: "",
            status: "lead",
            name: "",
            address: "",
            postalCode: "",
            district: "",
            province: "",
            lat: 13.75,
            lng: 100.50,
            contacts: [],
            documents: []
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

          // Calculate Region immediately
          let finalDistrict = newLocs[index].district;
          let finalProvince = newLocs[index].province;

          // Auto-fill address if postal code changes
          if (field === 'postalCode') {
              // Only attempt auto-fill if length is 5 to avoid annoying jumps while typing
              if (String(value).length === 5) {
                  const matches = searchAddressByPostalCode(value);
                  if (matches.length > 0) {
                      // Auto-select the first match for simplicity (most zips have 1 province, maybe multiple districts)
                      // If multiple districts, we usually default to first, but let user change.
                      if (language === 'th') {
                          newLocs[index].district = matches[0].districtTH;
                          newLocs[index].province = matches[0].provinceTH;
                          finalDistrict = matches[0].districtTH;
                          finalProvince = matches[0].provinceTH;
                      } else {
                          newLocs[index].district = matches[0].district;
                          newLocs[index].province = matches[0].province;
                          finalDistrict = matches[0].district;
                          finalProvince = matches[0].province;
                      }
                  }
              }
          }
          
          // Determine Region
          if (field === 'province') finalProvince = value;
          if (field === 'district') finalDistrict = value;

          // If updating district manually, ensure province matches (handled in UI onChange, but good to have safety)
          // But here we just recalc region.
          if (finalProvince || finalDistrict) {
             newLocs[index].region = getRegion(finalProvince || '', finalDistrict);
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

  const addContact = (locIndex: number) => {
      if (editingCompany) {
          const newLocs = [...editingCompany.locations];
          // Ensure contacts array exists
          if (!newLocs[locIndex].contacts) {
             newLocs[locIndex].contacts = [];
          }
          newLocs[locIndex].contacts.push({
              id: `ct_${Date.now()}`,
              name: "",
              role: "",
              phone: ""
          });
          setEditingCompany({ ...editingCompany, locations: newLocs });
      }
  };

  const removeContact = (locIndex: number, contactIndex: number) => {
      if (editingCompany) {
          const newLocs = [...editingCompany.locations];
          if (newLocs[locIndex].contacts) {
              newLocs[locIndex].contacts = newLocs[locIndex].contacts.filter((_, i) => i !== contactIndex);
              setEditingCompany({ ...editingCompany, locations: newLocs });
          }
      }
  };

  const updateContact = (locIndex: number, contactIndex: number, field: keyof ContactPerson, value: any) => {
      if (editingCompany) {
            const newLocs = [...editingCompany.locations];
            const currentContacts = newLocs[locIndex].contacts;
            
            if (currentContacts && currentContacts[contactIndex]) {
                currentContacts[contactIndex] = { ...currentContacts[contactIndex], [field]: value };
                setEditingCompany({ ...editingCompany, locations: newLocs });
            }
      }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingCompany) {
        const file = e.target.files[0];
        
        // Show loading via toast (simple approach first)
        const toastId = showToast('Uploading logo...', 'info'); // Assuming showToast returns ID or we just fire standard toast
        // Actually our toast is simple, let's just show info
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'logos');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setEditingCompany({ ...editingCompany, logo: data.url });
            showToast('Logo uploaded successfully', 'success');

        } catch (error) {
            console.error(error);
            showToast('Failed to upload logo', 'error');
        }
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

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
      {!loading && (
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
                             "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden relative",
                             (company.status === 'existing' || company.status === 'active') ? "bg-indigo-100 text-indigo-600" : "bg-teal-100 text-teal-600"
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
                                     (company.status === 'existing' || company.status === 'active') ? "bg-green-50 text-green-700 border-green-200" :
                                     company.status === 'lead' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                     (company.status === 'closed' || company.status === 'inactive' || company.status === 'terminate') ? "bg-red-50 text-red-700 border-red-200" :
                                     "bg-slate-50 text-slate-600 border-slate-200"
                                     )}>
                                     {t(`status_${company.status}` as any)}
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

                                     {(loc.contacts?.length || 0) > 0 && loc.contacts && (
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
      )}

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
                 <button onClick={handleSave} disabled={isSaving} className="btn btn-primary px-6 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                     {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                     {isSaving ? (language === 'th' ? 'กำลังบันทึก...' : 'Saving...') : t('save')}
                 </button>
             </>
          }
      >
          {editingCompany && (
             <div className="space-y-8">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
                    <div className={clsx(
                        "w-24 h-24 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden relative group cursor-pointer hover:border-indigo-400 transition-colors",
                         !editingCompany.logo && "p-4"
                    )}>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleLogoUpload}
                        />
                        {editingCompany.logo ? (
                            <>
                                <Image
                                    src={editingCompany.logo} 
                                    alt="Logo" 
                                    fill
                                    className="object-cover" 
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <Edit className="text-white" size={20} />
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <ImageIcon className="mx-auto text-slate-400 mb-1" size={24} />
                                <div className="text-[10px] text-slate-400 font-medium">{t('upload_logo')}</div>
                            </div>
                        )}
                        {editingCompany.logo && (
                            <button 
                                onClick={(e) => { e.preventDefault(); setEditingCompany({...editingCompany, logo: undefined}); }}
                                className="absolute top-1 right-1 bg-white/80 p-0.5 rounded-full text-slate-600 hover:text-red-500 z-30"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">{t('company_logo')}</h3>
                        <p className="text-sm text-slate-500">{t('logo_instruction')}</p>
                        <p className="text-xs text-slate-400 mt-1">{t('supported_files')}</p>
                    </div>
                  </div>
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
                                value={editingCompany.taxId ?? ''}
                                onChange={(e) => updateField('taxId', e.target.value)}
                                className="input w-full"
                                placeholder="Tax ID"
                             />
                         </div>
                         <div>
                             <label className="label">{t('grade')}</label>
                             <select 
                                value={editingCompany.grade ?? ''}
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
                             <option value="lead">{t('status_lead')}</option>
                             <option value="active">{t('status_active')}</option>
                             <option value="closed">{t('status_closed')}</option>
                             <option value="inactive">{t('status_inactive')}</option>
                             <option value="terminate">{t('status_terminate')}</option>
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
                                      <div className="grid grid-cols-2 gap-4">
                                          <div>
                                              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('store_code')}</label>
                                              <input 
                                                  value={loc.code ?? ''}
                                                  onChange={(e) => updateBranch(idx, 'code', e.target.value)}
                                                  className="input w-full bg-white h-9 text-sm"
                                                  placeholder="e.g. S001"
                                              />
                                          </div>
                                          <div>
                                              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('status')}</label>
                                              <select 
                                                  value={loc.status || 'lead'}
                                                  onChange={(e) => updateBranch(idx, 'status', e.target.value)}
                                                  className={clsx(
                                                      "input w-full bg-white h-9 text-xs font-medium",
                                                      (loc.status === 'existing' || loc.status === 'active') ? "text-green-600 border-green-200 bg-green-50" :
                                                      loc.status === 'lead' ? "text-blue-600 border-blue-200 bg-blue-50" :
                                                      "text-slate-600"
                                                  )}
                                              >
                                                  <option value="lead">{t('status_lead')}</option>
                                                  <option value="active">{t('status_active')}</option>
                                                  <option value="closed">{t('status_closed')}</option>
                                                  <option value="inactive">{t('status_inactive')}</option>
                                                  <option value="terminate">{t('status_terminate')}</option>
                                              </select>
                                          </div>
                                      </div>

                                      <div>
                                          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('branch_name')}</label>
                                          <input 
                                              value={loc.name}
                                              onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                                              className="input w-full bg-white h-9 text-sm"
                                              placeholder="Branch Name (Internal)"
                                          />
                                      </div>

                                      {/* --- DETAILED FIELDS FOR ACTIVE CUSTOMERS --- */}
                                      {(loc.status === 'existing' || loc.status === 'active') && (
                                          <div className="p-4 bg-green-50/50 rounded-lg border border-green-100 space-y-4">
                                              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 border-b border-green-200 pb-2 flex items-center gap-2">
                                                  <CheckCircle2 size={14} />
                                                  Active Customer Details
                                              </div>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div>
                                                      <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('official_name')}</label>
                                                      <input 
                                                          value={loc.officialName || ''}
                                                          onChange={(e) => updateBranch(idx, 'officialName', e.target.value)}
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
                                                                  name={`ctype_${idx}`}
                                                                  checked={loc.customerType === 'individual'} 
                                                                  onChange={() => updateBranch(idx, 'customerType', 'individual')}
                                                                  className="text-green-600 focus:ring-green-500"
                                                              />
                                                              <span className="text-xs text-slate-700">{t('cust_individual')}</span>
                                                          </label>
                                                          <label className="flex items-center gap-2 cursor-pointer">
                                                              <input 
                                                                  type="radio" 
                                                                  name={`ctype_${idx}`}
                                                                  checked={loc.customerType === 'juristic'}
                                                                  onChange={() => updateBranch(idx, 'customerType', 'juristic')}
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
                                                          value={loc.ownerName || ''}
                                                          onChange={(e) => updateBranch(idx, 'ownerName', e.target.value)}
                                                          className="input w-full bg-white h-8 text-xs"
                                                      />
                                                  </div>
                                                  <div>
                                                      <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('owner_phone')}</label>
                                                      <input 
                                                          value={loc.ownerPhone || ''}
                                                          onChange={(e) => updateBranch(idx, 'ownerPhone', e.target.value)}
                                                          className="input w-full bg-white h-8 text-xs"
                                                      />
                                                  </div>
                                              </div>

                                              {/* Documents Upload */}
                                              <div>
                                                  <label className="text-[10px] font-semibold text-slate-500 uppercase mb-2 block">{t('documents_upload')} (Max 6)</label>
                                                  <div className="flex flex-wrap gap-2">
                                                      {(loc.documents || []).map((doc, docIdx) => (
                                                          <div key={docIdx} className="relative w-16 h-16 bg-white border border-slate-200 rounded flex items-center justify-center group overflow-hidden">
                                                              {(doc.startsWith('data:image') || doc.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || doc.includes('ekenko-media')) ? (
                                                                  <Image src={doc} alt="Doc" fill className="object-cover" unoptimized />
                                                              ) : (
                                                                  <div className="text-center p-1">
                                                                      <FileText size={20} className="mx-auto text-slate-400" />
                                                                      <span className="text-[8px] text-slate-400 block truncate w-14">File {docIdx+1}</span>
                                                                  </div>
                                                              )}
                                                              <button 
                                                                  onClick={() => {
                                                                      const newDocs = (loc.documents || []).filter((_, i) => i !== docIdx);
                                                                      updateBranch(idx, 'documents', newDocs);
                                                                  }}
                                                                  className="absolute top-0 right-0 p-0.5 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                              >
                                                                  <X size={10} />
                                                              </button>
                                                          </div>
                                                      ))}
                                                      
                                                      {(loc.documents?.length || 0) < 6 && (
                                                          <label className="w-16 h-16 border-2 border-dashed border-green-200 rounded flex flex-col items-center justify-center text-green-400 hover:text-green-600 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all">
                                                              <Plus size={16} />
                                                              <span className="text-[8px] font-bold">ADD</span>
                                                              <input 
                                                                  type="file" 
                                                                  accept="image/*,application/pdf"
                                                                  className="hidden"
                                                                  onChange={async (e) => {
                                                                      if (e.target.files && e.target.files[0]) {
                                                                          const file = e.target.files[0];
                                                                          showToast('Uploading document...', 'info');
                                                                          
                                                                          try {
                                                                              const formData = new FormData();
                                                                              formData.append('file', file);
                                                                              formData.append('folder', 'documents');

                                                                              const res = await fetch('/api/upload', {
                                                                                  method: 'POST',
                                                                                  body: formData,
                                                                              });
                                                                              
                                                                              if (!res.ok) throw new Error('Upload failed');
                                                                              
                                                                              const data = await res.json();
                                                                              const newDocs = [...(loc.documents || []), data.url];
                                                                              updateBranch(idx, 'documents', newDocs);
                                                                              showToast('Document uploaded', 'success');
                                                                          } catch (error) {
                                                                              console.error(error);
                                                                              showToast('Upload failed', 'error');
                                                                          }
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
                                                      value={loc.shippingAddress || ''}
                                                      onChange={(e) => updateBranch(idx, 'shippingAddress', e.target.value)}
                                                      className="input w-full bg-white h-8 text-xs"
                                                  />
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                      <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('receiver_name')}</label>
                                                      <input 
                                                          value={loc.receiverName || ''}
                                                          onChange={(e) => updateBranch(idx, 'receiverName', e.target.value)}
                                                          className="input w-full bg-white h-8 text-xs"
                                                      />
                                                  </div>
                                                  <div>
                                                      <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('receiver_phone')}</label>
                                                      <input 
                                                          value={loc.receiverPhone || ''}
                                                          onChange={(e) => updateBranch(idx, 'receiverPhone', e.target.value)}
                                                          className="input w-full bg-white h-8 text-xs"
                                                      />
                                                  </div>
                                              </div>

                                              {/* Financials */}
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                      <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('credit_term')}</label>
                                                      <select 
                                                          value={loc.creditTerm || 0} 
                                                          onChange={(e) => updateBranch(idx, 'creditTerm', parseInt(e.target.value))}
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
                                                          value={loc.vatType || 'in-vat'} 
                                                          onChange={(e) => updateBranch(idx, 'vatType', e.target.value)}
                                                          className="input w-full bg-white h-8 text-xs"
                                                      >
                                                          <option value="ex-vat">{t('vat_ex')}</option>
                                                          <option value="in-vat">{t('vat_in')}</option>
                                                          <option value="non-vat">{t('vat_non')}</option>
                                                      </select>
                                                  </div>
                                              </div>

                                              {/* Notes */}
                                              <div>
                                                  <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('promotion_notes')}</label>
                                                  <textarea 
                                                      value={loc.promotionNotes || ''}
                                                      onChange={(e) => updateBranch(idx, 'promotionNotes', e.target.value)}
                                                      className="input w-full bg-white text-xs min-h-[60px]"
                                                  />
                                              </div>
                                              <div>
                                                  <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">{t('general_note')}</label>
                                                  <textarea 
                                                      value={loc.notes || ''}
                                                      onChange={(e) => updateBranch(idx, 'notes', e.target.value)}
                                                      className="input w-full bg-white text-xs min-h-[60px]"
                                                  />
                                              </div>
                                          </div>
                                      )}
                                      
                                      <div>
                                          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('address')}</label>
                                          <input 
                                              value={loc.address}
                                              onChange={(e) => updateBranch(idx, 'address', e.target.value)}
                                              className="input w-full bg-white h-9 text-sm"
                                              placeholder="Address (Text)"
                                          />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                          {/* Region Display - Full Width or with Space */}
                                          <div className="col-span-2">
                                              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Zone / Region</label>
                                              <div className={clsx(
                                                  "w-full h-9 flex items-center px-3 rounded-lg border text-sm font-bold",
                                                  loc.region ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-400"
                                              )}>
                                                  {loc.region || t('auto_detected')}
                                              </div>
                                          </div>
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
                                              value={loc.googleMapLink ?? ''}
                                              onChange={(e) => updateBranch(idx, 'googleMapLink', e.target.value)}
                                              className="input w-full bg-white h-9 text-sm border-indigo-200 focus:border-indigo-400 focus:ring-indigo-100"
                                              placeholder="https://maps.app.goo.gl/..."
                                          />
                                      </div>

                                      {/* Assigned Sales Representatives */}
                                      <div>
                                          <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                              <UserPlus size={14} className="text-teal-600" />
                                              {language === 'th' ? 'พนักงานดูแล' : 'Assigned Sales'}
                                          </label>
                                          <div className="flex flex-wrap gap-2">
                                              {employees.filter(e => e.role === 'sales').map(emp => {
                                                  const isAssigned = (loc.assignedEmployeeIds || []).includes(emp.id);
                                                  return (
                                                      <button
                                                          key={emp.id}
                                                          onClick={() => {
                                                              if (editingCompany) {
                                                                  const newLocs = [...editingCompany.locations];
                                                                  const currentAssigned = newLocs[idx].assignedEmployeeIds || [];
                                                                  
                                                                  if (isAssigned) {
                                                                      // Remove
                                                                      newLocs[idx].assignedEmployeeIds = currentAssigned.filter(id => id !== emp.id);
                                                                  } else {
                                                                      // Add
                                                                      newLocs[idx].assignedEmployeeIds = [...currentAssigned, emp.id];
                                                                  }
                                                                  setEditingCompany({ ...editingCompany, locations: newLocs });
                                                              }
                                                          }}
                                                          className={clsx(
                                                              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5",
                                                              isAssigned 
                                                                  ? "bg-teal-50 border-teal-200 text-teal-700 shadow-sm" 
                                                                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                                          )}
                                                      >
                                                          {isAssigned && <Check size={12} className="text-teal-600" />}
                                                          {emp.name}
                                                      </button>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  
                                      {/* Contact Persons Management */}
                                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                                          <div className="flex items-center justify-between mb-2">
                                              <div className="text-xs font-bold text-indigo-600">{t('contact_person')} ({loc.contacts?.length || 0})</div>
                                              <button 
                                                  onClick={() => addContact(idx)}
                                                  className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-bold flex items-center gap-1 transition-colors"
                                              >
                                                  <Plus size={12} /> {t('add_branch').replace('Branch', '').replace('สาขา', '')} {/* Quick reuse or just + */}
                                              </button>
                                          </div>
                                          
                                          {(loc.contacts?.length || 0) === 0 && (
                                              <div className="text-center text-xs text-slate-400 py-2 italic bg-slate-50 rounded border border-dashed border-slate-200">
                                                  No contacts added
                                              </div>
                                          )}

                                          <div className="space-y-2">
                                              {(loc.contacts || []).map((contact, contactIdx) => (
                                                  <div key={contact.id || contactIdx} className="grid grid-cols-12 gap-2 items-center group/contact">
                                                      <div className="col-span-4">
                                                          <input 
                                                              value={contact.name}
                                                              onChange={(e) => updateContact(idx, contactIdx, 'name', e.target.value)}
                                                              className="input h-8 text-xs bg-slate-50 focus:bg-white"
                                                              placeholder="Name"
                                                          />
                                                      </div>
                                                      <div className="col-span-3">
                                                          <input 
                                                              value={contact.role}
                                                              onChange={(e) => updateContact(idx, contactIdx, 'role', e.target.value)}
                                                              className="input h-8 text-xs bg-slate-50 focus:bg-white"
                                                              placeholder="Role"
                                                          />
                                                      </div>
                                                      <div className="col-span-4">
                                                          <input 
                                                              value={contact.phone}
                                                              onChange={(e) => updateContact(idx, contactIdx, 'phone', e.target.value)}
                                                              className="input h-8 text-xs bg-slate-50 focus:bg-white"
                                                              placeholder="Phone"
                                                          />
                                                      </div>
                                                      <div className="col-span-1 flex justify-end">
                                                          <button 
                                                              onClick={() => removeContact(idx, contactIdx)}
                                                              className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                              title="Remove Contact"
                                                          >
                                                              <Trash2 size={14} />
                                                          </button>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div> {/* End space-y-4 */}
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
