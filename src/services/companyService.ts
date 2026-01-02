
import { prisma } from '@/lib/prisma';

export const companyService = {
    // Get all companies with their locations and related data
    getAllCompanies: async () => {
        return await prisma.company.findMany({
            include: {
                locations: {
                    include: {
                        contacts: true,
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get single company by ID
    getCompanyById: async (id: string) => {
        return await prisma.company.findUnique({
            where: { id },
            include: {
                locations: {
                    include: {
                        contacts: true,
                    }
                },
            },
        });
    },

    // Create new company with locations and contacts
    createCompany: async (data: any) => {
        return await prisma.company.create({
            data: {
                name: data.name,
                taxId: data.taxId,
                logo: data.logo,
                grade: data.grade,
                status: data.status,
                locations: {
                    create: (data.locations || []).map((loc: any) => ({
                        name: loc.name,
                        code: loc.code,
                        status: loc.status,
                        address: loc.address,
                        postalCode: loc.postalCode,
                        district: loc.district,
                        province: loc.province,
                        region: loc.region,
                        googleMapLink: loc.googleMapLink,
                        lat: loc.lat || 0,
                        lng: loc.lng || 0,
                        officialName: loc.officialName,
                        customerType: loc.customerType,
                        ownerName: loc.ownerName,
                        ownerPhone: loc.ownerPhone,
                        documents: loc.documents || [],
                        shippingAddress: loc.shippingAddress,
                        receiverName: loc.receiverName,
                        receiverPhone: loc.receiverPhone,
                        creditTerm: loc.creditTerm,
                        vatType: loc.vatType,
                        promotionNotes: loc.promotionNotes,
                        notes: loc.notes,
                        statusNote: loc.statusNote,
                        createdBy: loc.createdBy,
                        assignedEmployeeIds: loc.assignedTo || [],
                        contacts: {
                            create: (loc.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                role: contact.role,
                                phone: contact.phone,
                                lineId: contact.lineId,
                            }))
                        }
                    }))
                }
            },
            include: {
                locations: {
                    include: {
                        contacts: true,
                    }
                }
            }
        });
    },

    // Update company (safer approach - upsert locations)
    updateCompany: async (id: string, data: any) => {
        // Get existing locations
        const existingCompany = await prisma.company.findUnique({
            where: { id },
            include: { locations: true }
        });

        if (!existingCompany) {
            throw new Error('Company not found');
        }

        const existingLocationIds = existingCompany.locations.map(l => l.id);
        const incomingLocationIds = (data.locations || [])
            .map((l: any) => l.id)
            .filter((id: string) => id && !id.startsWith('loc_')); // Filter out temp IDs

        // Find locations to delete (exist in DB but not in incoming data)
        const locationsToDelete = existingLocationIds.filter(
            id => !incomingLocationIds.includes(id)
        );

        // Delete contacts for locations we're removing or updating
        for (const loc of data.locations || []) {
            if (loc.id && !loc.id.startsWith('loc_')) {
                await prisma.contactPerson.deleteMany({
                    where: { locationId: loc.id }
                });
            }
        }

        // Delete orphaned locations (only those without visits)
        for (const locId of locationsToDelete) {
            try {
                await prisma.contactPerson.deleteMany({
                    where: { locationId: locId }
                });
                await prisma.location.delete({
                    where: { id: locId }
                });
            } catch (error: any) {
                // If deletion fails due to FK constraint, just skip
                console.warn(`Cannot delete location ${locId} - has related data`);
            }
        }

        // Update company and upsert locations
        return await prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                taxId: data.taxId,
                logo: data.logo,
                grade: data.grade,
                status: data.status,
                locations: {
                    upsert: (data.locations || []).map((loc: any) => {
                        const isNew = !loc.id || loc.id.startsWith('loc_');
                        return {
                            where: { id: isNew ? 'new_' + Date.now() + Math.random() : loc.id },
                            create: {
                                name: loc.name,
                                code: loc.code,
                                status: loc.status,
                                address: loc.address,
                                postalCode: loc.postalCode,
                                district: loc.district,
                                province: loc.province,
                                region: loc.region,
                                googleMapLink: loc.googleMapLink,
                                lat: loc.lat || 0,
                                lng: loc.lng || 0,
                                officialName: loc.officialName,
                                customerType: loc.customerType,
                                ownerName: loc.ownerName,
                                ownerPhone: loc.ownerPhone,
                                documents: loc.documents || [],
                                shippingAddress: loc.shippingAddress,
                                receiverName: loc.receiverName,
                                receiverPhone: loc.receiverPhone,
                                creditTerm: loc.creditTerm,
                                vatType: loc.vatType,
                                promotionNotes: loc.promotionNotes,
                                notes: loc.notes,
                                statusNote: loc.statusNote,
                                createdBy: loc.createdBy,
                                assignedEmployeeIds: loc.assignedTo || [],
                                contacts: {
                                    create: (loc.contacts || []).map((contact: any) => ({
                                        name: contact.name,
                                        role: contact.role,
                                        phone: contact.phone,
                                        lineId: contact.lineId,
                                    }))
                                }
                            },
                            update: {
                                name: loc.name,
                                code: loc.code,
                                status: loc.status,
                                address: loc.address,
                                postalCode: loc.postalCode,
                                district: loc.district,
                                province: loc.province,
                                region: loc.region,
                                googleMapLink: loc.googleMapLink,
                                lat: loc.lat || 0,
                                lng: loc.lng || 0,
                                officialName: loc.officialName,
                                customerType: loc.customerType,
                                ownerName: loc.ownerName,
                                ownerPhone: loc.ownerPhone,
                                documents: loc.documents || [],
                                shippingAddress: loc.shippingAddress,
                                receiverName: loc.receiverName,
                                receiverPhone: loc.receiverPhone,
                                creditTerm: loc.creditTerm,
                                vatType: loc.vatType,
                                promotionNotes: loc.promotionNotes,
                                notes: loc.notes,
                                statusNote: loc.statusNote,
                                createdBy: loc.createdBy,
                                assignedEmployeeIds: loc.assignedTo || [],
                                contacts: {
                                    deleteMany: {},
                                    create: (loc.contacts || []).map((contact: any) => ({
                                        name: contact.name,
                                        role: contact.role,
                                        phone: contact.phone,
                                        lineId: contact.lineId,
                                    }))
                                }
                            }
                        };
                    })
                }
            },
            include: {
                locations: {
                    include: {
                        contacts: true,
                    }
                }
            }
        });
    },

    // Delete company (cascade will handle locations and contacts)
    deleteCompany: async (id: string) => {
        // Check if company has visits
        const visitsCount = await prisma.visit.count({
            where: {
                location: {
                    companyId: id
                }
            }
        });

        if (visitsCount > 0) {
            throw new Error('Cannot delete company with existing visits. Please archive it instead.');
        }

        return await prisma.company.delete({
            where: { id },
        });
    }
};
