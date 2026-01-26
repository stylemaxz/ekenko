import { prisma } from '@/lib/prisma';
import { ProjectStatus } from '@prisma/client';

export const projectService = {
    // Get all projects with related data
    getAllProjects: async () => {
        return await prisma.project.findMany({
            include: {
                customer: true,
                location: true,
                products: {
                    include: {
                        samples: {
                            include: {
                                feedback: true,
                            }
                        }
                    }
                },
                rndTasks: {
                    include: {
                        assignee: true,
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get projects by customer ID
    getProjectsByCustomer: async (customerId: string) => {
        return await prisma.project.findMany({
            where: { customerId },
            include: {
                customer: true,
                location: true,
                products: {
                    include: {
                        samples: {
                            include: {
                                feedback: true,
                            }
                        }
                    }
                },
                rndTasks: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get project by ID
    getProjectById: async (id: string) => {
        return await prisma.project.findUnique({
            where: { id },
            include: {
                customer: true,
                location: true,
                products: {
                    include: {
                        samples: {
                            include: {
                                sender: true,
                                feedback: {
                                    include: {
                                        collector: true,
                                    }
                                },
                                followUpTask: {
                                    include: {
                                        assignee: true,
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                rndTasks: {
                    include: {
                        assignee: true,
                        creator: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            },
        });
    },

    // Create project
    createProject: async (data: {
        name: string;
        description?: string;
        customerId: string;
        locationId?: string;
        targetDate?: string;
        createdBy: string;
    }) => {
        return await prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                customerId: data.customerId,
                locationId: data.locationId,
                targetDate: data.targetDate ? new Date(data.targetDate) : null,
                createdBy: data.createdBy,
            },
            include: {
                customer: true,
                location: true,
                products: true,
                rndTasks: true,
            }
        });
    },

    // Update project
    updateProject: async (id: string, data: {
        name?: string;
        description?: string;
        status?: ProjectStatus;
        locationId?: string;
        targetDate?: string | null;
    }) => {
        return await prisma.project.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                status: data.status,
                locationId: data.locationId,
                targetDate: data.targetDate ? new Date(data.targetDate) : data.targetDate === null ? null : undefined,
            },
            include: {
                customer: true,
                location: true,
                products: true,
                rndTasks: true,
            }
        });
    },

    // Delete project
    deleteProject: async (id: string) => {
        return await prisma.project.delete({
            where: { id },
        });
    },

    // Get project stats
    getProjectStats: async () => {
        const [total, active, completed, onHold] = await Promise.all([
            prisma.project.count(),
            prisma.project.count({ where: { status: 'active' } }),
            prisma.project.count({ where: { status: 'completed' } }),
            prisma.project.count({ where: { status: 'on_hold' } }),
        ]);

        return { total, active, completed, onHold };
    }
};
