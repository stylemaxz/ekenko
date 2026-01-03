
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
        return await prisma.activityLog.create({
            data: {
                employeeId: data.employeeId,
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
