"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  FileText, 
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight
} from "lucide-react";
import { LeaveRequest, LeaveType } from "@/types";
import { clsx } from "clsx";
import { format, differenceInDays } from "date-fns";
import { enUS, th } from "date-fns/locale";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";

export default function SaleLeaveRequestsPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const locale = language === "th" ? th : enUS;
  const { showToast } = useToast();

  // Current User
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user & leave requests
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch current user
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
           if (userRes.status === 401) router.push('/login');
           return;
        }
        const user = await userRes.json();
        setCurrentUser(user);

        // 2. Fetch leave requests for this user
        const res = await fetch(`/api/leave-requests?employeeId=${user.id}`);
        if (res.ok) setLeaveRequests(await res.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    leaveType: 'sick' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
    isPaid: true,
    isHalfDay: false,
    halfDayPeriod: 'morning' as 'morning' | 'afternoon'
  });

  // Filter for current user
  const myRequests = leaveRequests
    .filter(req => req.employeeId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Leave Quotas (Annual)
  const leaveQuotas = {
    vacation: 6,
    sick: 30,
    personal: 3
  };

  // Calculate used days from approved requests only
  const calculateUsedDays = (type: LeaveType) => {
    return leaveRequests
      .filter(req => 
        req.employeeId === currentUser?.id && 
        req.type === type &&
        req.status === 'approved'
      )
      .reduce((sum, req) => sum + (req.days || 0), 0);
  };

  const usedVacation = calculateUsedDays('vacation');
  const usedSick = calculateUsedDays('sick');
  const usedPersonal = calculateUsedDays('personal');

  const remainingVacation = leaveQuotas.vacation - usedVacation;
  const remainingSick = leaveQuotas.sick - usedSick;
  const remainingPersonal = leaveQuotas.personal - usedPersonal;

  const getProgressColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleRequestLeave = () => {
    setNewRequest({
      leaveType: 'sick',
      startDate: '',
      endDate: '',
      reason: '',
      isPaid: true,
      isHalfDay: false,
      halfDayPeriod: 'morning'
    });
    setIsModalOpen(true);
  };

  const calculateDays = (start: string, end: string) => {
    if (newRequest.isHalfDay) return 0.5;
    if (!start || !end) return 0;
    return differenceInDays(new Date(end), new Date(start)) + 1;
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      showToast(t('fill_required'), 'error');
      return;
    }

    if (!currentUser) {
        showToast(t('user_not_found'), "error");
        return;
    }

    const requestedDays = calculateDays(newRequest.startDate, newRequest.endDate);
    
    // Check Quota
    let remaining = 0;
    if (newRequest.leaveType === 'vacation') remaining = remainingVacation;
    else if (newRequest.leaveType === 'sick') remaining = remainingSick;
    else if (newRequest.leaveType === 'personal') remaining = remainingPersonal;
    else remaining = 999; // Other has no strict limit in this requirement

    if (requestedDays > remaining) {
       showToast(t('quota_exceeded', { days: remaining }), 'error');
       return;
    }

    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: currentUser.id,
          type: newRequest.leaveType,
          startDate: newRequest.startDate,
          endDate: newRequest.endDate,
          days: calculateDays(newRequest.startDate, newRequest.endDate),
          reason: newRequest.isHalfDay 
            ? `${t('half_day_reason_prefix', { period: t(newRequest.halfDayPeriod) })} ${newRequest.reason}`
            : newRequest.reason,
          isPaid: newRequest.isPaid,
        }),
      });

      if (res.ok) {
        const createdRequest = await res.json();
        setLeaveRequests(prev => [createdRequest, ...prev]);
        setIsModalOpen(false);
        showToast(t('save_success'), 'success');
        
        // Reset form
        setNewRequest({
          leaveType: 'sick',
          startDate: '',
          endDate: '',
          reason: '',
          isPaid: true,
          isHalfDay: false,
          halfDayPeriod: 'morning'
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create request');
      }
    } catch (error) {
      console.error('Error creating leave request:', error);
      showToast(t('create_failed'), 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 size={18} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <Clock size={18} className="text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-700 border-green-200";
      case 'rejected':
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  // Cancel Confirmation
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  
  const handleConfirmCancel = async () => {
    if (!confirmCancelId) return;
    
    try {
        const res = await fetch(`/api/leave-requests/${confirmCancelId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            showToast(t('cancel_success'), 'success');
            setLeaveRequests(prev => prev.filter(r => r.id !== confirmCancelId));
            setConfirmCancelId(null);
        } else {
            throw new Error('Failed to cancel');
        }
    } catch (err) {
        showToast(t('cancel_failed'), 'error');
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('my_leave_requests')}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {myRequests.length} {t('requests_count')}
          </p>
        </div>
        <button
          onClick={handleRequestLeave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
        >
          <Plus size={20} />
          {t('request_leave')}
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Personal Leave Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-xs font-medium text-slate-500 mb-1">
            {t('personal_leave')}
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {remainingPersonal}
          </div>
          <div className="text-xs text-slate-400 mb-2">
            {usedPersonal}/{leaveQuotas.personal} {t('days_used')}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(usedPersonal, leaveQuotas.personal)} transition-all`}
              style={{ width: `${Math.min((usedPersonal / leaveQuotas.personal) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Vacation Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-xs font-medium text-slate-500 mb-1">
            {t('vacation_leave')}
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {remainingVacation}
          </div>
          <div className="text-xs text-slate-400 mb-2">
            {usedVacation}/{leaveQuotas.vacation} {t('days_used')}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(usedVacation, leaveQuotas.vacation)} transition-all`}
              style={{ width: `${Math.min((usedVacation / leaveQuotas.vacation) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Sick Leave Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-xs font-medium text-slate-500 mb-1">
            {t('sick_leave')}
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {remainingSick}
          </div>
          <div className="text-xs text-slate-400 mb-2">
            {usedSick}/{leaveQuotas.sick} {t('days_used')}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(usedSick, leaveQuotas.sick)} transition-all`}
              style={{ width: `${Math.min((usedSick / leaveQuotas.sick) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-3">
        {myRequests.length > 0 ? (
          myRequests.map((request) => {
            const days = request.days; 
            
            // Cancellation Rules
            const isPending = (request.status || '').toLowerCase() === 'pending';
            const isApproved = (request.status || '').toLowerCase() === 'approved';
            
            // Normalize dates to start of day for accurate comparison
            const startDate = new Date(request.startDate);
            startDate.setHours(0,0,0,0);
            const today = new Date();
            today.setHours(0,0,0,0);
            
            const daysDiff = differenceInDays(startDate, today);
            
            // Allow cancel if pending, OR if approved and at least 2 days in advance (e.g. cancel on 1st for 3rd)
            const canCancel = isPending || (isApproved && daysDiff >= 2);
            
            return (
              <div
                key={request.id}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">
                          {t(`leave_${request.type}` as any)}
                        </h3>
                        <span className={clsx(
                          "text-xs px-2 py-0.5 rounded-full border font-bold uppercase",
                          getStatusColor(request.status)
                        )}>
                          {t(`leave_status_${request.status}` as any)}
                        </span>
                        {request.isPaid === false && (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 font-bold uppercase">
                            {t('unpaid')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{request.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarIcon size={14} className="text-slate-400" />
                    <span>
                      {format(new Date(request.startDate), "d MMM", { locale })}
                      {request.startDate !== request.endDate && ` - ${format(new Date(request.endDate), "d MMM yyyy", { locale })}`}
                      {request.startDate === request.endDate && format(new Date(request.startDate), " yyyy", { locale })}
                    </span>
                  </div>
                  <div className="text-primary font-bold">
                    {days} {t('days')}
                  </div>
                </div>

                {/* Review Note (if rejected or approved) */}
                {request.reviewNote && (
                  <div className={clsx(
                    "mt-3 p-3 rounded-lg border text-sm",
                    request.status === 'approved' ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                  )}>
                    <div className="font-bold text-slate-700 mb-1">{t('review_note')}:</div>
                    <div className={request.status === 'approved' ? "text-green-700" : "text-red-700"}>
                      {request.reviewNote}
                    </div>
                    {request.reviewedAt && (
                      <div className="text-xs text-slate-500 mt-1">
                        {format(new Date(request.reviewedAt), "d MMM yyyy HH:mm", { locale })}
                      </div>
                    )}
                  </div>
                )}

                {/* Created At & Actions */}
                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                   <div className="text-xs text-slate-400">
                     {t('requested_on')}: {format(new Date(request.createdAt), "d MMM yyyy HH:mm", { locale })}
                   </div>
                   
                   {canCancel && (
                       <button 
                        onClick={() => setConfirmCancelId(request.id)}
                        className="text-xs border border-red-200 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors"
                       >
                           {t('cancel_request')}
                       </button>
                   )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <FileText size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">
              {t('no_leave_requests')}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmCancelId}
        onClose={() => setConfirmCancelId(null)}
        title={t('cancel_request')}
        footer={
           <>
              <button 
                onClick={() => setConfirmCancelId(null)}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                {t('confirm')}
              </button>
           </>
        }
      >
        <div className="py-4 text-center">
             <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                 <XCircle className="text-red-600" size={24} />
             </div>
             <p className="text-slate-600 font-medium text-lg">
                 {t('confirm_cancel_leave')}
             </p>
             <p className="text-slate-400 text-sm mt-1">
                 {t('action_cannot_be_undone')}
             </p>
        </div>
      </Modal>

      {/* Request Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleSubmitRequest} 
              className="btn btn-primary px-6"
            >
              {t('save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Leave Type */}
          <div>
            <label className="label">{t('leave_type')} <span className="text-red-500">*</span></label>
            <select
              className="input w-full"
              value={!newRequest.isPaid ? 'unpaid' : newRequest.leaveType}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'unpaid') {
                    setNewRequest({ ...newRequest, leaveType: 'other', isPaid: false });
                } else {
                    setNewRequest({ ...newRequest, leaveType: val as LeaveType, isPaid: true });
                }
              }}
            >
              <option value="sick">{t('leave_sick')}</option>
              <option value="personal">{t('leave_personal')}</option>
              <option value="vacation">{t('leave_vacation')}</option>
              <option value="other">{t('leave_other')}</option>
              <option value="unpaid">{t('leave_unpaid')}</option>
            </select>
          </div>

          {/* Half Day Option - Only for Sick and Personal */}
          {(newRequest.leaveType === 'sick' || newRequest.leaveType === 'personal') && (
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="duration_type"
                        className="w-4 h-4 text-primary"
                        checked={!newRequest.isHalfDay}
                        onChange={() => setNewRequest({ ...newRequest, isHalfDay: false })}
                    />
                    <span className="text-sm font-medium text-slate-700">{t('full_day')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="duration_type"
                        className="w-4 h-4 text-primary"
                        checked={newRequest.isHalfDay}
                        onChange={() => setNewRequest({ 
                            ...newRequest, 
                            isHalfDay: true, 
                            endDate: newRequest.startDate // Auto-sync end date
                        })}
                    />
                    <span className="text-sm font-medium text-slate-700">{t('half_day')}</span>
                </label>
            </div>
          )}

          {/* Half Day Period Selection */}
          {newRequest.isHalfDay && (
             <div className="flex gap-4">
                 <label className={clsx(
                     "flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors",
                     newRequest.halfDayPeriod === 'morning' ? "bg-primary/10 border-primary text-primary font-bold" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                 )}>
                     <input 
                        type="radio" 
                        name="period" 
                        className="hidden"
                        checked={newRequest.halfDayPeriod === 'morning'}
                        onChange={() => setNewRequest({ ...newRequest, halfDayPeriod: 'morning' })}
                     />
                     {t('morning')}
                 </label>
                 <label className={clsx(
                     "flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors",
                     newRequest.halfDayPeriod === 'afternoon' ? "bg-primary/10 border-primary text-primary font-bold" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                 )}>
                     <input 
                        type="radio" 
                        name="period" 
                        className="hidden"
                        checked={newRequest.halfDayPeriod === 'afternoon'}
                        onChange={() => setNewRequest({ ...newRequest, halfDayPeriod: 'afternoon' })}
                     />
                     {t('afternoon')}
                 </label>
             </div>
          )}

          {/* Date Selection */}
          <div className="space-y-3">
             <div>
                <label className="label">{t('date')} <span className="text-red-500">*</span></label>
                <input
                    type="date"
                    className="input w-full"
                    value={newRequest.startDate}
                    onChange={(e) => {
                        // For single day request, start = end
                        setNewRequest({ 
                            ...newRequest, 
                            startDate: e.target.value,
                            endDate: e.target.value // Force single day
                        });
                    }}
                />
             </div>
             {/* End Date hidden/removed as per requirement for single day selection */}
          </div>

          {/* Days Count (Simplified) */}
          {newRequest.startDate && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">
                {newRequest.isHalfDay ? 0.5 : 1}
              </div>
              <div className="text-sm text-primary/80">{t('days')}</div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="label">{t('reason')} <span className="text-red-500">*</span></label>
            <textarea
              className="input w-full h-24 resize-none"
              placeholder={t('reason_placeholder')}
              value={newRequest.reason}
              onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
            />
          </div>


        </div>
      </Modal>
    </div>
  );
}
