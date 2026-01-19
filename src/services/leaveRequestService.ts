
import { prisma } from '@/lib/prisma';

export const leaveRequestService = {
    // Get all leave requests
    getAllLeaveRequests: async () => {
        return await prisma.leaveRequest.findMany({
            include: {
                employee: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get leave requests by employee
    getLeaveRequestsByEmployee: async (employeeId: string) => {
        return await prisma.leaveRequest.findMany({
            where: { employeeId },
            include: {
                employee: true,
            },
            orderBy: {
                startDate: 'desc',
            },
        });
    },

    // Get leave request by ID
    getLeaveRequestById: async (id: string) => {
        return await prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                employee: true,
            },
        });
    },

    // Create leave request
    createLeaveRequest: async (data: any) => {
        return await prisma.leaveRequest.create({
            data: {
                employeeId: data.employeeId,
                type: data.type,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                days: data.days,
                reason: data.reason,
                status: data.status || 'pending',
                reviewedBy: data.reviewedBy,
                reviewNote: data.reviewNote,
                isPaid: data.isPaid,
            },
            include: {
                employee: true,
            }
        });
    },

    // Update leave request
    updateLeaveRequest: async (id: string, data: any) => {
        return await prisma.leaveRequest.update({
            where: { id },
            data: {
                type: data.type,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                reason: data.reason,
                status: data.status,
                reviewedBy: data.reviewedBy,
                reviewNote: data.reviewNote,
            },
            include: {
                employee: true,
            }
        });
    },

    // Delete leave request
    deleteLeaveRequest: async (id: string) => {
        return await prisma.leaveRequest.delete({
            where: { id },
        });
    }
};
