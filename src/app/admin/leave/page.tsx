"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Calendar as CalendarIcon, 
  User,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare
} from "lucide-react";
import { LeaveRequest, Employee } from "@/types";
import { clsx } from "clsx";
import { format, differenceInDays } from "date-fns";
import { enUS, th } from "date-fns/locale";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";

export default function AdminLeaveManagementPage() {
  const { t, language } = useLanguage();
  const locale = language === "th" ? th : enUS;
  const { showToast } = useToast();

  // Data State
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  // Current User
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        const [leaveRes, empRes, userRes] = await Promise.all([
          fetch('/api/leave-requests'),
          fetch('/api/employees'),
          fetch('/api/auth/me'),
        ]);

        if (leaveRes.ok) setLeaveRequests(await leaveRes.json());
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData.filter((e: Employee) => e.role === 'sales'));
        }
        if (userRes.ok) {
            setCurrentUser(await userRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredRequests = leaveRequests
    .filter(req => statusFilter === "all" || req.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusCounts = {
    all: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === "pending").length,
    approved: leaveRequests.filter(r => r.status === "approved").length,
    rejected: leaveRequests.filter(r => r.status === "rejected").length,
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setReviewNote(request.reviewNote || "");
    setReviewModalOpen(true);
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', note?: string) => {
      try {
        const res = await fetch(`/api/leave-requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status,
                reviewedBy: currentUser?.id || 'admin',
                reviewNote: note,
                reviewedAt: new Date().toISOString() // Although backend triggers update, explicitly sending it if needed or rely on backend
            })
        });

        if (res.ok) {
            const updated = await res.json();
            setLeaveRequests(prev => 
                prev.map(req => req.id === id ? updated : req)
            );
            return true;
        } else {
            throw new Error('Failed to update');
        }
      } catch (error) {
          console.error('Update error', error);
          showToast('Failed to update request', 'error');
          return false;
      }
  };

  const handleApprove = async (request: LeaveRequest) => {
    const success = await updateRequestStatus(request.id, 'approved');
    if (success) {
        showToast(
        t('leave_approved'), 
        'success'
        );
    }
  };

  const handleReject = async (request: LeaveRequest) => {
    const success = await updateRequestStatus(request.id, 'rejected');
    if (success) {
        showToast(
        t('leave_rejected'), 
        'success'
        );
    }
  };

  const handleSubmitReview = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    const success = await updateRequestStatus(selectedRequest.id, action === 'approve' ? 'approved' : 'rejected', reviewNote);
    
    if (success) {
        setReviewModalOpen(false);
        showToast(t('save_success'), 'success');
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

  const calculateDays = (start: string, end: string) => {
    return differenceInDays(new Date(end), new Date(start)) + 1;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('leave_management')}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {filteredRequests.length} {t('requests_count')}
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "pending", label: t('leave_status_pending'), count: statusCounts.pending },
          { key: "approved", label: t('leave_status_approved'), count: statusCounts.approved },
          { key: "rejected", label: t('leave_status_rejected'), count: statusCounts.rejected },
          { key: "all", label: t('all_filter'), count: statusCounts.all },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
              statusFilter === filter.key
                ? "bg-primary text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-primary/30"
            )}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {statusFilter === 'pending' ? (
        // CARD VIEW (For Pending Actions)
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRequests.map((request) => {
            const employee = employees.find(e => e.id === request.employeeId);
            const days = request.days; 
            
            return (
                <div
                key={request.id}
                className="card"
                >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                        {employee?.name.substring(0, 1) || 'U'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{employee?.name}</h3>
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
                        <div className="text-sm text-indigo-600 font-medium">
                        {t(`leave_${request.type}` as any)}
                        </div>
                    </div>
                    <div className="shrink-0">
                        {getStatusIcon(request.status)}
                    </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarIcon size={14} className="text-slate-400" />
                    <span>
                        {format(new Date(request.startDate), "d MMM", { locale })} - {format(new Date(request.endDate), "d MMM yyyy", { locale })}
                    </span>
                    </div>
                    <div className="text-indigo-600 font-bold text-sm">
                    {days} {t('days')}
                    </div>
                </div>

                {/* Reason */}
                <div className="mb-3">
                    <div className="text-xs text-slate-500 font-medium mb-1">{t('reason')}:</div>
                    <div className="text-sm text-slate-700">{request.reason}</div>
                </div>

                {/* Review Note (if exists) */}
                {request.reviewNote && (
                    <div className={clsx(
                    "mb-3 p-3 rounded-lg border text-sm",
                    request.status === 'approved' ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                    )}>
                    <div className="font-bold text-slate-700 mb-1">{t('review_note')}:</div>
                    <div className={request.status === 'approved' ? "text-green-700" : "text-red-700"}>
                        {request.reviewNote}
                    </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                        onClick={() => handleViewDetails(request)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                    {t('view_details')}
                    </button>
                    
                    {request.status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                        onClick={() => handleReject(request)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                        {t('reject')}
                        </button>
                        <button
                        onClick={() => handleApprove(request)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                        {t('approve')}
                        </button>
                    </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>
      ) : (
        // TABLE VIEW (For Approved, Rejected, All)
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('employee')}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('leave_type')}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('date')}</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reason')}</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('actions' as any)}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredRequests.map((request) => {
                             const employee = employees.find(e => e.id === request.employeeId);
                             return (
                                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                                                {employee?.name.substring(0, 1) || 'U'}
                                            </div>
                                            <div className="font-medium text-slate-900">{employee?.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-indigo-600">
                                            {t(`leave_${request.type}` as any)}
                                        </div>
                                        {request.isPaid === false && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded border bg-red-50 text-red-600 border-red-100 font-bold uppercase">
                                                {t('unpaid')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {format(new Date(request.startDate), "d MMM", { locale })} - {format(new Date(request.endDate), "d MMM yyyy", { locale })}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {request.days} {t('days')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                         <span className={clsx(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                                            getStatusColor(request.status)
                                        )}>
                                            {getStatusIcon(request.status)}
                                            {t(`leave_status_${request.status}` as any)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 truncate max-w-[150px]" title={request.reason}>
                                            {request.reason}
                                        </div>
                                        {request.reviewNote && (
                                            <div className="text-xs text-slate-400 mt-1 truncate max-w-[150px]" title={request.reviewNote || ''}>
                                                <span className="font-semibold">Note:</span> {request.reviewNote}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {(() => {
                                            const isApproved = request.status === 'approved';
                                            // Check end date for "past" logic. If end date < today, it is strict past.
                                            // Or if start date < today? "เลยวันไปแล้ว" -> "Day passed".
                                            // Usually means if the leave date has passed, you can't cancel/reject it. 
                                            // Let's use end date < yesterday (fully passed) or start date < today?
                                            // Requirement: "ถ้าอนุมัติไปแล้ว และเลยวันไปแล้ว จะไม่สามารถแก้ไขได้"
                                            // If leave is Today (30th), can I edit? Maybe yes.
                                            // If leave was Yesterday (29th), No.
                                            // So endDate < today (set to 00:00:00).
                                            
                                            const endDate = new Date(request.endDate);
                                            endDate.setHours(0,0,0,0);
                                            const today = new Date();
                                            today.setHours(0,0,0,0);
                                            
                                            const isPast = endDate < today;
                                            const isDisabled = isApproved && isPast;

                                            if (isDisabled) return null; // Or show disabled button? "ไม่เห็นปุ่ม actions ด้านหลัง" -> Return null.

                                            return (
                                                <button 
                                                    onClick={() => handleViewDetails(request)}
                                                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <span className="sr-only">{t('view_details')}</span>
                                                    <MessageSquare size={18} />
                                                </button>
                                            );
                                        })()}
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {filteredRequests.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <Clock size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">
            {t('no_requests_status')}
          </p>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={t('review_leave_request')}
        footer={
          <>
            <button 
              onClick={() => setReviewModalOpen(false)} 
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleSubmitReview('reject')} 
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                {t('reject')}
              </button>
              <button 
                onClick={() => handleSubmitReview('approve')} 
                className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
              >
                {t('approve')}
              </button>
            </div>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Request Summary */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="font-bold text-slate-900 mb-2">
                {employees.find(e => e.id === selectedRequest.employeeId)?.name}
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <div><strong>{t('leave_type')}:</strong> {t(`leave_${selectedRequest.type}` as any)}</div>
                <div>
                  <strong>{t('date')}:</strong> {format(new Date(selectedRequest.startDate), "d MMM", { locale })} - {format(new Date(selectedRequest.endDate), "d MMM yyyy", { locale })} ({selectedRequest.days} {t('days')})
                </div>
                <div><strong>{t('reason')}:</strong> {selectedRequest.reason}</div>
                {selectedRequest.isPaid === false && (
                  <div className="pt-2">
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
                      {t('unpaid_leave_warning')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Review Note */}
            <div>
              <label className="label flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-600" />
                {t('review_note')} ({t('optional')})
              </label>
              <textarea
                className="input w-full h-24 resize-none"
                placeholder={t('add_note_placeholder')}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
