
import { prisma } from '@/lib/prisma';

export const activityLogService = {
    // Get all activity logs
    getAllActivityLogs: async () => {
        return await prisma.activityLog.findMany({
            include: {
                employee: true,
            },
            orderBy: {
                timestamp: 'desc',
            },
            take: 100, // Limit to recent 100
        });
    },

    // Get activity logs by employee
    getActivityLogsByEmployee: async (employeeId: string) => {
        return await prisma.activityLog.findMany({
            where: { employeeId },
            include: {
                employee: true,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });
    },

    // Create activity log
    createActivityLog: async (data: any) => {
        let employeeName = data.employeeName;

        // If name is not provided, fetch it
        if (!employeeName && data.employeeId) {
            const employee = await prisma.employee.findUnique({
                where: { id: data.employeeId },
                select: { name: true }
            });
            if (employee) {
                employeeName = employee.name;
            } else {
                employeeName = 'Unknown';
            }
        }

        return await prisma.activityLog.create({
            data: {
                employeeId: data.employeeId,
                employeeName: employeeName || 'Unknown',
                type: data.type,
                description: data.description,
                metadata: data.metadata || {},
                timestamp: new Date(),
            },
            include: {
                employee: true,
            }
        });
    },
};
