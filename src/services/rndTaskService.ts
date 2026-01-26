import { prisma } from '@/lib/prisma';
import { TaskStatus, TaskPriority, RndTaskType, Role } from '@prisma/client';

export const rndTaskService = {
    // Get all R&D tasks (for managers and R&D staff)
    getAllTasks: async () => {
        return await prisma.rndTask.findMany({
            include: {
                project: {
                    include: {
                        customer: true,
                    }
                },
                sample: {
                    include: {
                        product: true,
                    }
                },
                assignee: true,
                creator: true,
                comments: {
                    include: {
                        author: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get tasks by assignee (for sales viewing only their own tasks)
    getTasksByAssignee: async (assigneeId: string) => {
        return await prisma.rndTask.findMany({
            where: { assigneeId },
            include: {
                project: {
                    include: {
                        customer: true,
                    }
                },
                sample: {
                    include: {
                        product: true,
                    }
                },
                assignee: true,
                creator: true,
                comments: {
                    include: {
                        author: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
    },

    // Get tasks filtered by role
    getTasksByRole: async (userId: string, role: Role) => {
        // Sales only sees their own tasks
        if (role === 'sales') {
            return await rndTaskService.getTasksByAssignee(userId);
        }
        // R&D and managers see all tasks
        return await rndTaskService.getAllTasks();
    },

    // Get tasks by project
    getTasksByProject: async (projectId: string) => {
        return await prisma.rndTask.findMany({
            where: { projectId },
            include: {
                project: true,
                sample: {
                    include: {
                        product: true,
                    }
                },
                assignee: true,
                creator: true,
                comments: {
                    include: {
                        author: true,
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get task by ID
    getTaskById: async (id: string) => {
        return await prisma.rndTask.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        customer: true,
                    }
                },
                sample: {
                    include: {
                        product: true,
                        feedback: true,
                    }
                },
                assignee: true,
                creator: true,
                comments: {
                    include: {
                        author: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    }
                },
            },
        });
    },

    // Create task
    createTask: async (data: {
        projectId: string;
        sampleId?: string;
        title: string;
        description?: string;
        taskType: RndTaskType;
        assigneeId: string;
        createdBy: string;
        dueDate: string;
        priority?: TaskPriority;
        images?: string[];
    }) => {
        return await prisma.rndTask.create({
            data: {
                projectId: data.projectId,
                sampleId: data.sampleId,
                title: data.title,
                description: data.description,
                taskType: data.taskType,
                assigneeId: data.assigneeId,
                createdBy: data.createdBy,
                dueDate: new Date(data.dueDate),
                priority: data.priority || 'medium',
                status: 'pending',
                images: data.images || [],
            },
            include: {
                project: true,
                assignee: true,
                creator: true,
            }
        });
    },

    // Update task
    updateTask: async (id: string, data: {
        title?: string;
        description?: string;
        taskType?: RndTaskType;
        assigneeId?: string;
        dueDate?: string;
        priority?: TaskPriority;
        status?: TaskStatus;
        completionNote?: string;
        images?: string[];
    }) => {
        return await prisma.rndTask.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                taskType: data.taskType,
                assigneeId: data.assigneeId,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                priority: data.priority,
                status: data.status,
                completionNote: data.completionNote,
                images: data.images,
            },
            include: {
                project: true,
                sample: {
                    include: {
                        product: true,
                    }
                },
                assignee: true,
                creator: true,
            }
        });
    },

    // Delete task
    deleteTask: async (id: string) => {
        return await prisma.rndTask.delete({
            where: { id },
        });
    },

    // Add comment to task
    addComment: async (taskId: string, data: {
        authorId: string;
        content: string;
        images?: string[];
    }) => {
        return await prisma.taskComment.create({
            data: {
                rndTaskId: taskId,
                authorId: data.authorId,
                content: data.content,
                images: data.images || [],
            },
            include: {
                author: true,
            }
        });
    },

    // Get comments for task
    getComments: async (taskId: string) => {
        return await prisma.taskComment.findMany({
            where: { rndTaskId: taskId },
            include: {
                author: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    },

    // Delete comment
    deleteComment: async (commentId: string) => {
        return await prisma.taskComment.delete({
            where: { id: commentId },
        });
    },

    // Get task statistics
    getTaskStats: async (userId?: string, role?: Role) => {
        const where = role === 'sales' && userId
            ? { assigneeId: userId }
            : {};

        const [total, pending, inProgress, completed, overdue] = await Promise.all([
            prisma.rndTask.count({ where }),
            prisma.rndTask.count({ where: { ...where, status: 'pending' } }),
            prisma.rndTask.count({ where: { ...where, status: 'in_progress' } }),
            prisma.rndTask.count({ where: { ...where, status: 'completed' } }),
            prisma.rndTask.count({
                where: {
                    ...where,
                    status: { not: 'completed' },
                    dueDate: { lt: new Date() }
                }
            }),
        ]);

        return { total, pending, inProgress, completed, overdue };
    },

    // Get upcoming tasks (for dashboard)
    getUpcomingTasks: async (userId: string, role: Role, limit: number = 5) => {
        const where = role === 'sales'
            ? { assigneeId: userId, status: { not: 'completed' as TaskStatus } }
            : { status: { not: 'completed' as TaskStatus } };

        return await prisma.rndTask.findMany({
            where,
            include: {
                project: {
                    include: {
                        customer: true,
                    }
                },
                assignee: true,
            },
            orderBy: {
                dueDate: 'asc',
            },
            take: limit,
        });
    }
};
