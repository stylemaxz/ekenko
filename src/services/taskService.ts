
import { prisma } from '@/lib/prisma';

export const taskService = {
    // Get all tasks
    getAllTasks: async () => {
        return await prisma.task.findMany({
            include: {
                assignee: true,
                company: true,
                location: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get tasks by assignee
    getTasksByAssignee: async (assigneeId: string) => {
        return await prisma.task.findMany({
            where: { assigneeId },
            include: {
                assignee: true,
                company: true,
                location: true,
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
    },

    // Get task by ID
    getTaskById: async (id: string) => {
        return await prisma.task.findUnique({
            where: { id },
            include: {
                assignee: true,
                company: true,
                location: true,
            },
        });
    },

    // Create task
    createTask: async (data: any) => {
        return await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                objectives: data.objectives || [],
                assigneeId: data.assigneeId,
                customerId: data.customerId,
                locationId: data.locationId,
                dueDate: new Date(data.dueDate),
                priority: data.priority || 'medium',
                status: data.status || 'pending',
                completionNote: data.completionNote,
            },
            include: {
                assignee: true,
                company: true,
                location: true,
            }
        });
    },

    // Update task
    updateTask: async (id: string, data: any) => {
        return await prisma.task.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                objectives: data.objectives,
                assigneeId: data.assigneeId,
                customerId: data.customerId,
                locationId: data.locationId,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                priority: data.priority,
                status: data.status,
                completionNote: data.completionNote,
            },
            include: {
                assignee: true,
                company: true,
                location: true,
            }
        });
    },

    // Delete task
    deleteTask: async (id: string) => {
        return await prisma.task.delete({
            where: { id },
        });
    }
};
