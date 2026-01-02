
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

    // Create new company
    createCompany: async (data: Prisma.CompanyCreateInput) => {
        return await prisma.company.create({
            data,
        });
    },

    // Update company
    updateCompany: async (id: string, data: Prisma.CompanyUpdateInput) => {
        return await prisma.company.update({
            where: { id },
            data,
        });
    },

    // Delete company
    deleteCompany: async (id: string) => {
        return await prisma.company.delete({
            where: { id },
        });
    }
};
