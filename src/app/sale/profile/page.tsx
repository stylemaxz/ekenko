"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, ChevronRight, Globe, User, Edit, Save, Camera, Mail, Phone, Lock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { clsx } from "clsx";

export default function SaleProfilePage() {
  const { t, setLanguage, language } = useLanguage();
  const router = useRouter();
  const { showToast } = useToast();

  // Mock Current User (ID: 1)
  const currentUserId = "1";
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch employee data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/employees/${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          setFormData({ ...data, password: "" });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [currentUserId]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({ password: "" });

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        showToast('Logged out successfully', 'success');
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  };


  const toggleEdit = () => {
    if (isEditing) {
      // Cancel edit
      setIsEditing(false);
      setFormData({ ...profileData, password: "" });
    } else {
      // Start edit
      setIsEditing(true);
      setFormData({ ...profileData, password: "" });
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.username) {
        showToast(t('fill_required'), 'error');
        return;
    }

    // TODO: Update via API
    // await fetch(`/api/employees/${currentUserId}`, { method: 'PATCH', body: JSON.stringify(formData) });

    setProfileData(formData as any);
    setIsEditing(false);
    showToast(t('save_success'), 'success');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image too large (max 5MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { 
      label: t('language'), 
      icon: Globe,
      value: language === 'en' ? 'English' : 'ไทย',
      action: () => setLanguage(language === 'en' ? 'th' : 'en')
    },
  ];

  return (
    <div className="pb-24 pt-8 px-4 bg-slate-50 min-h-screen">
       {/* Profile Header & Form */}
       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
           <div className="flex justify-between items-start mb-6">
               <h2 className="text-lg font-bold text-slate-900">
                  {isEditing 
                    ? (language === 'th' ? 'แก้ไขข้อมูล' : 'Edit Profile')
                    : (language === 'th' ? 'โปรไฟล์ของฉัน' : 'My Profile')
                  }
                </h2>
               <button 
                  onClick={isEditing ? handleSave : toggleEdit}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all",
                    isEditing 
                        ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
               >
                  {isEditing ? <Save size={16} /> : <Edit size={16} />}
                  {isEditing ? t('save') : 'Edit'}
               </button>
           </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 mt-4">Loading profile...</p>
              </div>
            ) : !profileData ? (
              <div className="text-center py-12">
                <p className="text-red-500">Failed to load profile data</p>
              </div>
            ) : (
              <>
            <div className="flex flex-col items-center mb-8">
       <div className="relative group">
                   <div className={clsx(
                       "w-28 h-28 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden relative",
                       isEditing && "cursor-pointer ring-4 ring-primary/20"
                   )} onClick={handleImageClick}>
                       <Image 
                          src={isEditing ? (formData.avatar || profileData?.avatar || "/default-avatar.png") : (profileData?.avatar || "/default-avatar.png")} 
                          alt="Profile" 
                          fill
                          className="object-cover"
                          unoptimized
                       />
                       {isEditing && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                               <Camera className="text-white" size={24} />
                           </div>
                       )}
                   </div>
                   {isEditing && (
                     <>
                        <p className="text-xs text-center text-slate-400 mt-2">Tap to change</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                     </>
                   )}
               </div>
               
               {!isEditing && (
                   <div className="text-center mt-4">
                       <h2 className="text-xl font-bold text-slate-900">{profileData.name}</h2>
                       <p className="text-slate-500 capitalize">{profileData.role}</p>
                   </div>
               )}
           </div>

           {/* View Mode */}
           {!isEditing && (
               <div className="space-y-4">
                   <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                           <Mail size={18} />
                       </div>
                       <div>
                           <div className="text-xs text-slate-400 font-medium uppercase">{t('email')}</div>
                           <div className="text-sm font-medium text-slate-700">{profileData.email}</div>
                       </div>
                   </div>
                   <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                           <Phone size={18} />
                       </div>
                       <div>
                           <div className="text-xs text-slate-400 font-medium uppercase">{t('phone')}</div>
                           <div className="text-sm font-medium text-slate-700">{profileData.phone}</div>
                       </div>
                   </div>
                   <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                           <User size={18} />
                       </div>
                       <div>
                           <div className="text-xs text-slate-400 font-medium uppercase">{t('username')}</div>
                           <div className="text-sm font-medium text-slate-700">{profileData.username}</div>
                       </div>
                   </div>
               </div>
           )}

           {/* Edit Mode */}
           {isEditing && (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                   <div>
                       <label className="label">{t('col_name')}</label>
                       <input 
                           className="input w-full"
                           value={formData.name || ''}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                   </div>
                   <div>
                       <label className="label">{t('email')}</label>
                       <input 
                           className="input w-full"
                           value={formData.email || ''}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                       />
                   </div>
                   <div>
                       <label className="label">{t('phone')}</label>
                       <input 
                           className="input w-full"
                           value={formData.phone || ''}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                       />
                   </div>
                   
                   <div className="pt-4 border-t border-slate-100">
                       <h3 className="font-bold text-slate-700 text-sm mb-3">Login Credentials</h3>
                       <div className="space-y-3">
                           <div>
                               <label className="label">{t('username')}</label>
                               <div className="relative">
                                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                   <input 
                                       className="input w-full pl-9"
                                       value={formData.username || ''}
                                       onChange={(e) => setFormData({...formData, username: e.target.value})}
                                   />
                               </div>
                           </div>
                           <div>
                               <label className="label">{t('password')} <span className="text-xs font-normal text-slate-400">(Leave blank to keep current)</span></label>
                               <div className="relative">
                                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                   <input 
                                       type="password"
                                       className="input w-full pl-9"
                                       placeholder="New Password"
                                       value={formData.password || ''}
                                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                                   />
                               </div>
                           </div>
                       </div>
                   </div>

                   <button 
                       onClick={toggleEdit}
                       className="w-full py-3 mt-4 text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                   >
                       Cancel
                   </button>
               </div>
           )}
           </>
           )}
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           {menuItems.map((item, idx) => (
               <button 
                  key={idx} 
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
               >
                   <div className="flex items-center gap-3">
                       <item.icon size={20} className="text-slate-600" />
                       <span className="font-medium text-slate-900">{item.label}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       {item.value && <span className="text-sm text-slate-500">{item.value}</span>}
                       <ChevronRight size={18} className="text-slate-400" />
                   </div>
               </button>
           ))}
       </div>

       <button 
           onClick={handleLogout}
           className="w-full mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
       >
           <LogOut size={20} />
           <span className="font-medium">{t('logout')}</span>
       </button>
       
       <div className="text-center mt-8 text-xs text-slate-400">
           App Version 1.0.0 (MVP)
       </div>
    </div>
  );
}
