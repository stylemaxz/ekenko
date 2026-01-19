"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { MapPin, Camera, X, Check, Search, Navigation, SwitchCamera, Briefcase, Plus } from "lucide-react";
import { Company, Location, VisitObjective, VisitObjectives } from "@/types";
import { clsx } from "clsx";

export default function CheckInPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch companies
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/companies');
        if (res.ok) setCompanies(await res.json());
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Step 1: Select Location, Step 2: Fill Report
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLocation, setSelectedLocation] = useState<{ company: Company, location: Location } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWorkFromHome, setIsWorkFromHome] = useState(false);
  
  // Load WFH setting from localStorage
  useEffect(() => {
    const savedWFH = localStorage.getItem('isWorkFromHome') === 'true';
    setIsWorkFromHome(savedWFH);
  }, []);
  
  // Location State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({ lat: 13.7563, lng: 100.5018 }); // Default for demo
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Form State
  const [objectives, setObjectives] = useState<VisitObjective[]>([]);
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [assetImages, setAssetImages] = useState<string[]>([]); // For asset inspection photos
  const [metOwner, setMetOwner] = useState<boolean>(true); // Default to true
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [photoType, setPhotoType] = useState<'visit' | 'asset'>('visit'); // Track which type of photo
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // --- Helpers ---
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in km
  };

  const handleUpdateLocation = () => {
      setIsLocating(true);
      setLocationError(null);
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  setUserLocation({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  });
                  setIsLocating(false);
              },
              (error) => {
                  console.error("Error getting location", error);
                  setLocationError("Could not retrieve location.");
                  setIsLocating(false);
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
      } else {
          setLocationError("Geolocation is not supported by this browser.");
          setIsLocating(false);
      }
  };

  // Find nearby locations (within 500m i.e., 0.5km) OR All locations if WFH
  const nearbyLocations = companies.flatMap(c => 
      c.locations.map(l => {
          const distance = userLocation 
              ? calculateDistance(userLocation.lat, userLocation.lng, l.lat || 0, l.lng || 0) 
              : Infinity;
          return { company: c, location: l, distance };
      })
  ).filter(item => {
      // 1. If WFH, ignore distance check. Else, must be within 500m (0.5km)
      if (!isWorkFromHome && item.distance > 0.5) return false;
      
      // 2. Filter by search query if exists
      if (searchQuery) {
          return item.company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 item.location.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
  }).sort((a, b) => a.distance - b.distance);

  const closestLocationName = nearbyLocations.length > 0 ? nearbyLocations[0].location.name : "Unknown / No Store Nearby";

  const handleLocationSelect = (item: { company: Company, location: Location }) => {
      setSelectedLocation(item);
      setStep(2);
  };
  
  const toggleObjective = (obj: VisitObjective) => {
      if (objectives.includes(obj)) {
          setObjectives(objectives.filter(o => o !== obj));
      } else {
          setObjectives([...objectives, obj]);
      }
  };

  const handleImageUpload = async (type: 'visit' | 'asset' = 'visit') => {
      setPhotoType(type);
      try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: facingMode } 
          });
          setStream(mediaStream);
          setIsCameraOpen(true);
          
          // Wait for video element to be ready
          setTimeout(() => {
              if (videoRef.current) {
                  videoRef.current.srcObject = mediaStream;
              }
          }, 100);
      } catch (error) {
          console.error('Camera access denied:', error);
          alert('Cannot access camera. Please allow camera permission.');
      }
  };

  const flipCamera = async () => {
      // Stop current stream
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
      }
 
      // Toggle facing mode
      const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(newFacingMode);
 
      // Start new stream with new facing mode
      try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: newFacingMode } 
          });
          setStream(mediaStream);
          
          setTimeout(() => {
              if (videoRef.current) {
                  videoRef.current.srcObject = mediaStream;
              }
          }, 100);
      } catch (error) {
          console.error('Failed to flip camera:', error);
      }
  };

  const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0);
              const imageUrl = canvas.toDataURL('image/jpeg');
              
              // Save to appropriate array based on photo type
              if (photoType === 'asset') {
                  setAssetImages([...assetImages, imageUrl]);
              } else {
                  setImages([...images, imageUrl]);
              }
              
              closeCamera();
          }
      }
  };

  const closeCamera = () => {
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
      }
      setIsCameraOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const imageUrl = URL.createObjectURL(file);
          setImages([...images, imageUrl]);
      }
  };
  
  const removeImage = (idx: number) => {
      setImages(images.filter((_, i) => i !== idx));
  };

  // Fetch current user ID
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const employee = await res.json();
          setCurrentUserId(employee.id); // Use employee.id instead of data.userId
        } else {
          console.error('Failed to fetch current user, status:', res.status);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    }
    fetchCurrentUser();
  }, []);

  const handleSubmit = async () => {
    // Validation checks
    if (!selectedLocation) {
      alert(t('select_location_required'));
      return;
    }

    if (!currentUserId) {
      alert(t('user_not_found'));
      return;
    }

    if (images.length === 0) {
      alert(t('photo_required'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Create Visit Record
      const visitResponse = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUserId,
          locationId: selectedLocation.location.id,
          objectives: objectives,
          notes: notes,
          images: images,
          metOwner: metOwner
        })
      });

      if (!visitResponse.ok) {
        throw new Error('Failed to create visit');
      }

      const visit = await visitResponse.json();

      // 2. Create Activity Log
      const activityResponse = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUserId,
          type: 'check_in',
          description: `เช็คอิน ${selectedLocation.location.name}`,
          metadata: {
            visitId: visit.id,
            locationId: selectedLocation.location.id,
            locationName: selectedLocation.location.name,
            companyName: selectedLocation.company.name,
            objectives: objectives,
            metOwner: metOwner
          }
        })
      });

      if (!activityResponse.ok) {
        console.error('Failed to create activity log');
      }

      // Success - redirect to dashboard
      router.push('/sale/dashboard');
    } catch (error) {
      console.error('Error submitting check-in:', error);
      alert(t('save_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use objectives from common types - import from type definition
  const objectiveList: VisitObjective[] = VisitObjectives;

  // --- RENDER STEP 1: SELECT LOCATION ---
  if (step === 1) {
      return (
          <div className="pb-20 pt-6 px-4 min-h-screen bg-slate-50">
              <div className="mb-6">
                  <h1 className="text-xl font-bold text-slate-900">{t('check_in')} - Select Location</h1>
              </div>

              {/* Status Bar */}
              <div className="bg-primary text-white p-4 rounded-xl shadow-lg shadow-black/20 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          {isLocating ? (
                              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          ) : (
                              <Navigation size={20} />
                          )}
                      </div>
                      <div className="min-w-0">
                          <div className="text-xs opacity-80 uppercase font-semibold">Current Location</div>
                          <div className="font-bold text-sm truncate max-w-[180px]">
                              {userLocation 
                                  ? (nearbyLocations.length > 0 ? `Near: ${closestLocationName}` : "No registered store nearby")
                                  : "Location not found"
                              }
                          </div>
                      </div>
                  </div>
                  <button 
                      onClick={handleUpdateLocation}
                      disabled={isLocating}
                      className="text-xs bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 backdrop-blur-sm disabled:opacity-50"
                  >
                      {isLocating ? "Updating..." : "Update"}
                  </button>
              </div>

              
              {locationError && (
                  <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                      {locationError}
                  </div>
              )}

              {/* Search */}
              <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                      type="text" 
                      placeholder="Search nearby customer..."
                      className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>

              {/* List */}
              <div className="space-y-3">
                  {nearbyLocations.length > 0 ? (
                      nearbyLocations.map((item, idx) => (
                          <button 
                              key={`${item.company.id}-${item.location.id}`}
                              onClick={() => handleLocationSelect(item)}
                              className="w-full text-left bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform flex items-start gap-3"
                          >
                              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-primary shrink-0 mt-1">
                                  <MapPin size={20} />
                              </div>
                              <div className="min-w-0">
                                  <h3 className="font-bold text-slate-900 truncate">{item.location.name}</h3>
                                  <p className="text-sm text-slate-600 font-medium truncate">{item.company.name}</p>
                                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                     <Navigation size={10} />
                                     {(item.distance * 1000).toFixed(0)}m away
                                  </p>
                              </div>
                          </button>
                      ))
                  ) : (
                      <div className="text-center py-10">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
                              <MapPin size={32} />
                          </div>
                          <h3 className="text-slate-900 font-bold mb-1">No Stores Nearby</h3>
                          <p className="text-slate-500 text-sm mb-4">We couldn't find any registered stores within 500m of your location.</p>
                          
                          <button 
                              onClick={() => router.push('/sale/customers')}
                              className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-black/10 active:scale-95 transition-transform flex items-center gap-2 mx-auto"
                          >
                              <Plus size={18} />
                              {t('add_customer')}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- RENDER STEP 2: FILL REPORT ---
  return (
      <div className="pb-32 pt-6 px-4 min-h-screen bg-slate-50">
          <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="p-2 rounded-full bg-white shadow-sm border border-slate-200">
                  <X size={20} className="text-slate-600" />
              </button>
              <div>
                  <h1 className="text-lg font-bold text-slate-900">{selectedLocation?.location.name}</h1>
                  <p className="text-xs text-slate-500">{selectedLocation?.company.name}</p>
              </div>
          </div>

          <div className="space-y-6">
              {/* Image Upload Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Camera size={16} className="text-primary" />
                      {t('confirmation_images')} <span className="text-red-500">*</span>
                  </h3>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2">
                       {/* Add Button */}
                       <button 
                          onClick={() => handleImageUpload('visit')}
                          className="w-20 h-20 rounded-lg border-2 border-dashed border-red-200 bg-red-50 flex flex-col items-center justify-center text-primary-hover hover:bg-red-100 shrink-0"
                       >
                           <Camera size={24} />
                           <span className="text-[10px] font-bold mt-1">Add Photo</span>
                       </button>

                       {/* Preview Images */}
                       {images.map((url, idx) => (
                           <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                               <img src={url} alt="Visit" className="w-full h-full object-cover" />
                               <button 
                                  onClick={() => removeImage(idx)}
                                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                               >
                                   <X size={12} />
                               </button>
                           </div>
                       ))}
                  </div>
                  
                  {/* Hidden Camera Input */}
                  <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileChange}
                  />
              </div>

              {/* Objectives Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">{t('visit_objectives')}</h3>
                  <div className="space-y-2">
                      {objectiveList.map(obj => {
                          // Simplified logic as 'check_assets' is not in VisitObjective type
                          // If 'check_assets' was a required feature, it must be added to type first. 
                          // For now, removing the isDisabled logic related to 'check_assets' to avoid type errors.
                          
                          return (
                              <label key={obj} className={clsx(
                                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                  "bg-slate-50 border-slate-100 cursor-pointer active:bg-red-50"
                              )}>
                                  <div className={clsx(
                                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                      objectives.includes(obj) ? "bg-primary border-primary text-white" : "bg-white border-slate-300"
                                  )}>
                                      {objectives.includes(obj) && <Check size={14} />}
                                  </div>
                                  <input 
                                      type="checkbox" 
                                      className="hidden"
                                      checked={objectives.includes(obj)}
                                      onChange={() => toggleObjective(obj)}
                                  />
                                  <span className="text-sm text-slate-700">
                                      {t(`obj_${obj}` as any)}
                                  </span>
                              </label>
                          );
                      })}
                  </div>
              </div>


              {/* Asset Inspection Photos (shown only when check_assets is selected) */}
              {objectives.includes('check_assets') && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <Camera size={16} className="text-primary" />
                          {t('asset_photos')} 
                          <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">
                          {t('asset_photos_desc')}
                      </p>
                      
                      <div className="flex gap-3 overflow-x-auto pb-2">
                           <button 
                              onClick={() => handleImageUpload('asset')}
                              className="w-20 h-20 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50 flex flex-col items-center justify-center text-purple-500 hover:bg-purple-100 shrink-0"
                           >
                               <Camera size={24} />
                               <span className="text-[10px] font-bold mt-1">
                                   {t('add_photo')}
                               </span>
                           </button>

                           {assetImages.map((url, idx) => (
                               <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                   <img src={url} alt="Asset" className="w-full h-full object-cover" />
                                   <button 
                                      onClick={() => setAssetImages(assetImages.filter((_, i) => i !== idx))}
                                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                                   >
                                       <X size={12} />
                                   </button>
                               </div>
                           ))}
                      </div>
                  </div>
              )}

              {/* Met Owner Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      {t('met_owner')} 
                      <span className="text-red-500">*</span>
                  </h3>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer flex-1 active:bg-red-50 transition-colors">
                          <div className={clsx(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              metOwner ? "border-primary bg-primary" : "border-slate-300 bg-white"
                          )}>
                              {metOwner && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                          <input 
                              type="radio" 
                              className="hidden"
                              checked={metOwner}
                              onChange={() => setMetOwner(true)}
                          />
                          <span className="text-sm font-medium text-slate-700">
                              {t('yes')}
                          </span>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer flex-1 active:bg-red-50 transition-colors">
                          <div className={clsx(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              !metOwner ? "border-primary bg-primary" : "border-slate-300 bg-white"
                          )}>
                              {!metOwner && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                          <input 
                              type="radio" 
                              className="hidden"
                              checked={!metOwner}
                              onChange={() => setMetOwner(false)}
                          />
                          <span className="text-sm font-medium text-slate-700">
                              {t('no')}
                          </span>
                      </label>
                  </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{t('notes_label')}</h3>
                  <textarea 
                      className="w-full h-24 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter visit details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                  />
              </div>

              {/* Save Button */}
              <div className="mt-6 mb-6">
                  <button 
                      onClick={handleSubmit}
                      disabled={images.length === 0 || isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-black/20 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-transform"
                  >
                      {isSubmitting ? t('saving') : t('save')}
                  </button>
              </div>
          </div>

          {/* Camera Modal */}
          {isCameraOpen && (
              <div className="fixed inset-0 bg-black z-[2000] flex flex-col">
                  {/* Camera Preview */}
                  <div className="flex-1 relative">
                      <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Camera Controls */}
                  <div className="bg-black/80 p-6 flex items-center justify-between">
                      <button
                          onClick={closeCamera}
                          className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white"
                      >
                          <X size={24} />
                      </button>

                      <button
                          onClick={capturePhoto}
                          className="w-16 h-16 rounded-full bg-white border-4 border-white/30 active:scale-95 transition-transform"
                      />

                      <button
                          onClick={flipCamera}
                          className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
                      >
                          <SwitchCamera size={24} />
                      </button>
                  </div>
              </div>
          )}
      </div>
  );
}
