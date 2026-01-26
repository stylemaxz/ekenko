import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export const productService = {
    // Get all products
    getAllProducts: async () => {
        return await prisma.product.findMany({
            include: {
                project: {
                    include: {
                        customer: true,
                    }
                },
                samples: {
                    include: {
                        feedback: true,
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get products by project ID
    getProductsByProject: async (projectId: string) => {
        return await prisma.product.findMany({
            where: { projectId },
            include: {
                project: true,
                samples: {
                    include: {
                        sender: true,
                        feedback: {
                            include: {
                                collector: true,
                            }
                        },
                        followUpTask: true,
                    },
                    orderBy: {
                        version: 'desc',
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get product by ID
    getProductById: async (id: string) => {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        customer: true,
                    }
                },
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
                        version: 'desc',
                    }
                },
            },
        });
    },

    // Create product
    createProduct: async (data: {
        projectId: string;
        name: string;
        formula?: string;
        specifications?: string;
    }) => {
        return await prisma.product.create({
            data: {
                projectId: data.projectId,
                name: data.name,
                formula: data.formula,
                specifications: data.specifications,
            },
            include: {
                project: true,
                samples: true,
            }
        });
    },

    // Update product
    updateProduct: async (id: string, data: {
        name?: string;
        formula?: string;
        specifications?: string;
        status?: ProductStatus;
        version?: number;
    }) => {
        return await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                formula: data.formula,
                specifications: data.specifications,
                status: data.status,
                version: data.version,
            },
            include: {
                project: true,
                samples: true,
            }
        });
    },

    // Delete product
    deleteProduct: async (id: string) => {
        return await prisma.product.delete({
            where: { id },
        });
    },

    // Increment product version
    incrementVersion: async (id: string) => {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');

        return await prisma.product.update({
            where: { id },
            data: {
                version: product.version + 1,
            },
        });
    }
};
