
import { prisma } from '@/lib/prisma';

export const visitService = {
    // Get all visits with related data
    getAllVisits: async () => {
        return await prisma.visit.findMany({
            include: {
                employee: true,
                location: {
                    include: {
                        company: true,
                    }
                }
            },
            orderBy: {
                checkInTime: 'desc',
            },
        });
    },

    // Get visits by employee
    getVisitsByEmployee: async (employeeId: string) => {
        return await prisma.visit.findMany({
            where: { employeeId },
            include: {
                employee: true,
                location: {
                    include: {
                        company: true,
                    }
                }
            },
            orderBy: {
                checkInTime: 'desc',
            },
        });
    },

    // Get visit by ID
    getVisitById: async (id: string) => {
        return await prisma.visit.findUnique({
            where: { id },
            include: {
                employee: true,
                location: {
                    include: {
                        company: true,
                    }
                }
            },
        });
    },

    // Create new visit (check-in)
    createVisit: async (data: any) => {
        return await prisma.visit.create({
            data: {
                employeeId: data.employeeId,
                locationId: data.locationId,
                checkInTime: new Date(),
                objectives: data.objectives || [],
                notes: data.notes,
                images: data.images || [],
                metOwner: data.metOwner || false,
            },
            include: {
                employee: true,
                location: {
                    include: {
                        company: true,
                    }
                }
            }
        });
    },

    // Update visit (check-out)
    updateVisit: async (id: string, data: any) => {
        return await prisma.visit.update({
            where: { id },
            data: {
                checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
                objectives: data.objectives,
                notes: data.notes,
                images: data.images,
                metOwner: data.metOwner,
            },
            include: {
                employee: true,
                location: {
                    include: {
                        company: true,
                    }
                }
            }
        });
    },

    // Delete visit
    deleteVisit: async (id: string) => {
        return await prisma.visit.delete({
            where: { id },
        });
    }
};
