"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { MapPin, Camera, X, Check, Search, Navigation, SwitchCamera } from "lucide-react";
import { mockCompanies, Company, Location, VisitObjective } from "@/utils/mockData";
import { clsx } from "clsx";

export default function CheckInPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Step 1: Select Location, Step 2: Fill Report
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLocation, setSelectedLocation] = useState<{ company: Company, location: Location } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Mock finding nearby locations
  const nearbyLocations = mockCompanies.flatMap(c => 
      c.locations.map(l => ({ company: c, location: l }))
  ).filter(item => 
      item.company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleSubmit = () => {
      // In a real app, this would post to an API
      // For now, we just simulate a success and go back to dashboard
      console.log("Check-in Submitted:", {
          locationId: selectedLocation?.location.id,
          objectives,
          notes,
          images,
          assetImages,
          metOwner
      });
      router.push('/sale/dashboard');
  };

  const objectiveList: VisitObjective[] = [
      'propose_new_products', 
      'discuss_promotion', 
      'check_assets', 
      'collect_debt', 
      'general_followup'
  ];

  // --- RENDER STEP 1: SELECT LOCATION ---
  if (step === 1) {
      return (
          <div className="pb-20 pt-6 px-4 min-h-screen bg-slate-50">
              <div className="mb-6">
                  <h1 className="text-xl font-bold text-slate-900">{t('check_in')} - Select Location</h1>
              </div>

              {/* Mock Map / GPS Status */}
              <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                          <Navigation size={20} />
                      </div>
                      <div>
                          <div className="text-sm font-medium opacity-90">Current Location</div>
                          <div className="font-bold text-sm">13.7563° N, 100.5018° E</div>
                      </div>
                  </div>
                  <button className="text-xs bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 backdrop-blur-sm">
                      Update
                  </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                      type="text" 
                      placeholder="Search nearby customer..."
                      className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>

              {/* List */}
              <div className="space-y-3">
                  {nearbyLocations.map((item, idx) => (
                      <button 
                          key={`${item.company.id}-${item.location.id}`}
                          onClick={() => handleLocationSelect(item)}
                          className="w-full text-left bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform flex items-start gap-3"
                      >
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                              <MapPin size={20} />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900">{item.location.name}</h3>
                              <p className="text-sm text-slate-600 font-medium">{item.company.name}</p>
                              <p className="text-xs text-slate-400 mt-1 truncate">{item.location.address}</p>
                          </div>
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  // --- RENDER STEP 2: FILL REPORT ---
  return (
      <div className="pb-24 pt-6 px-4 min-h-screen bg-slate-50">
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
                      <Camera size={16} className="text-indigo-600" />
                      {t('confirmation_images')} <span className="text-red-500">*</span>
                  </h3>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2">
                       {/* Add Button */}
                       <button 
                          onClick={() => handleImageUpload('visit')}
                          className="w-20 h-20 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50 flex flex-col items-center justify-center text-indigo-500 hover:bg-indigo-100 shrink-0"
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
                      {objectiveList.map(obj => (
                          <label key={obj} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer active:bg-indigo-50 transition-colors">
                              <div className={clsx(
                                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                  objectives.includes(obj) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"
                              )}>
                                  {objectives.includes(obj) && <Check size={14} />}
                              </div>
                              <input 
                                  type="checkbox" 
                                  className="hidden"
                                  checked={objectives.includes(obj)}
                                  onChange={() => toggleObjective(obj)}
                              />
                              <span className="text-sm text-slate-700">{t(`obj_${obj}` as any)}</span>
                          </label>
                      ))}
                  </div>
              </div>

              {/* Asset Inspection Photos (shown only when check_assets is selected) */}
              {objectives.includes('check_assets') && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <Camera size={16} className="text-indigo-600" />
                          {t('asset_photos')} 
                          <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">
                          {t('asset_photos_desc')}
                      </p>
                      
                      <div className="flex gap-3 overflow-x-auto pb-2">
                           {/* Add Button */}
                           <button 
                              onClick={() => handleImageUpload('asset')}
                              className="w-20 h-20 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50 flex flex-col items-center justify-center text-purple-500 hover:bg-purple-100 shrink-0"
                           >
                               <Camera size={24} />
                               <span className="text-[10px] font-bold mt-1">
                                   {t('add_photo')}
                               </span>
                           </button>

                           {/* Preview Images */}
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
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer flex-1 active:bg-indigo-50 transition-colors">
                          <div className={clsx(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              metOwner ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
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

                      <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer flex-1 active:bg-indigo-50 transition-colors">
                          <div className={clsx(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              !metOwner ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
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
                      className="w-full h-24 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Enter visit details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                  />
              </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50">
              <button 
                  onClick={handleSubmit}
                  disabled={images.length === 0}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
              >
                  {t('save')}
              </button>
          </div>

          {/* Camera Modal */}
          {isCameraOpen && (
              <div className="fixed inset-0 bg-black z-[100] flex flex-col">
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
