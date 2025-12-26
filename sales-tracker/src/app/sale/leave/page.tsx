"use client";

import { useState } from "react";
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
import { mockLeaveRequests, mockEmployees, LeaveRequest, LeaveType } from "@/utils/mockData";
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

  // Mock Current User
  const currentUserId = "1";

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    leaveType: 'sick' as LeaveType,
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Filter for current user
  const myRequests = leaveRequests
    .filter(req => req.employeeId === currentUserId)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const handleRequestLeave = () => {
    setNewRequest({
      leaveType: 'sick',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      showToast(t('fill_required'), 'error');
      return;
    }

    const newLeaveRequest: LeaveRequest = {
      id: `lr_${Date.now()}`,
      employeeId: currentUserId,
      leaveType: newRequest.leaveType,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      reason: newRequest.reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setLeaveRequests(prev => [newLeaveRequest, ...prev]);
    setIsModalOpen(false);
    showToast(t('save_success'), 'success');
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

  const calculateDays = (start: string, end: string) => {
    return differenceInDays(new Date(end), new Date(start)) + 1;
  };

  return (
    <div className="pb-24 pt-6 px-4 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('my_leave_requests')}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {myRequests.length} {language === 'th' ? 'รายการ' : 'requests'}
          </p>
        </div>
        <button
          onClick={handleRequestLeave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus size={20} />
          {t('request_leave')}
        </button>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-3">
        {myRequests.length > 0 ? (
          myRequests.map((request) => {
            const days = calculateDays(request.startDate, request.endDate);
            
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
                          {t(`leave_${request.leaveType}` as any)}
                        </h3>
                        <span className={clsx(
                          "text-xs px-2 py-0.5 rounded-full border font-bold uppercase",
                          getStatusColor(request.status)
                        )}>
                          {t(`leave_status_${request.status}` as any)}
                        </span>
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
                      {format(new Date(request.startDate), "d MMM", { locale })} - {format(new Date(request.endDate), "d MMM yyyy", { locale })}
                    </span>
                  </div>
                  <div className="text-indigo-600 font-bold">
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

                {/* Requested At */}
                <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400">
                  {language === 'th' ? 'ขอเมื่อ' : 'Requested'}: {format(new Date(request.requestedAt), "d MMM yyyy HH:mm", { locale })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <FileText size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">
              {language === 'th' ? 'ยังไม่มีการขอลา' : 'No leave requests yet'}
            </p>
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('request_leave')}
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
              value={newRequest.leaveType}
              onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value as LeaveType })}
            >
              <option value="sick">{t('leave_sick')}</option>
              <option value="personal">{t('leave_personal')}</option>
              <option value="vacation">{t('leave_vacation')}</option>
              <option value="other">{t('leave_other')}</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('start_date')} <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="input w-full"
                value={newRequest.startDate}
                onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('end_date')} <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="input w-full"
                value={newRequest.endDate}
                min={newRequest.startDate}
                onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Days Count */}
          {newRequest.startDate && newRequest.endDate && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {calculateDays(newRequest.startDate, newRequest.endDate)}
              </div>
              <div className="text-sm text-indigo-700">{t('days')}</div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="label">{t('reason')} <span className="text-red-500">*</span></label>
            <textarea
              className="input w-full h-24 resize-none"
              placeholder={language === 'th' ? 'กรุณาระบุเหตุผล...' : 'Please specify reason...'}
              value={newRequest.reason}
              onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
