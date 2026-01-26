import { prisma } from '@/lib/prisma';
import { SampleStatus, CustomerReaction } from '@prisma/client';

export const sampleService = {
    // Get all samples
    getAllSamples: async () => {
        return await prisma.sample.findMany({
            include: {
                product: {
                    include: {
                        project: {
                            include: {
                                customer: true,
                            }
                        }
                    }
                },
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
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    // Get samples by product ID
    getSamplesByProduct: async (productId: string) => {
        return await prisma.sample.findMany({
            where: { productId },
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
                },
            },
            orderBy: {
                version: 'desc',
            },
        });
    },

    // Get sample by ID
    getSampleById: async (id: string) => {
        return await prisma.sample.findUnique({
            where: { id },
            include: {
                product: {
                    include: {
                        project: {
                            include: {
                                customer: true,
                            }
                        }
                    }
                },
                sender: true,
                feedback: {
                    include: {
                        collector: true,
                        visit: true,
                    }
                },
                followUpTask: {
                    include: {
                        assignee: true,
                        comments: {
                            include: {
                                author: true,
                            }
                        }
                    }
                },
            },
        });
    },

    // Get pending feedback samples for a customer
    getPendingSamplesForCustomer: async (customerId: string) => {
        return await prisma.sample.findMany({
            where: {
                product: {
                    project: {
                        customerId,
                    }
                },
                status: {
                    in: ['sent', 'pending_feedback'],
                },
                feedback: null,
            },
            include: {
                product: {
                    include: {
                        project: true,
                    }
                },
                sender: true,
            },
            orderBy: {
                sentDate: 'desc',
            },
        });
    },

    // Create sample and auto-create follow-up task
    createSample: async (data: {
        productId: string;
        sampleNumber: string;
        version?: number;
        dueDate: string;
        sentBy: string;
        assigneeId: string; // Sales rep who will collect feedback
        notes?: string;
        images?: string[];
    }) => {
        // Get product and project info for task creation
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
            include: {
                project: true,
            }
        });

        if (!product) throw new Error('Product not found');

        // Create sample and follow-up task in a transaction
        return await prisma.$transaction(async (tx) => {
            // Create the sample
            const sample = await tx.sample.create({
                data: {
                    product: { connect: { id: data.productId } },
                    sampleNumber: data.sampleNumber,
                    version: data.version || 1,
                    dueDate: new Date(data.dueDate),
                    sender: { connect: { id: data.sentBy } },
                    notes: data.notes,
                    images: data.images || [],
                    status: 'sent',
                },
            });

            // Auto-create follow-up task for sales to collect feedback
            await tx.rndTask.create({
                data: {
                    projectId: product.projectId,
                    sampleId: sample.id,
                    title: `Collect feedback: ${product.name} - ${data.sampleNumber}`,
                    description: `Visit customer and collect feedback for sample ${data.sampleNumber} of ${product.name}.\n\nDue by: ${new Date(data.dueDate).toLocaleDateString()}`,
                    taskType: 'sample_followup',
                    assigneeId: data.assigneeId,
                    createdBy: data.sentBy,
                    dueDate: new Date(data.dueDate),
                    priority: 'medium',
                    status: 'pending',
                },
            });

            // Update product status to sampling if in development
            if (product.status === 'development') {
                await tx.product.update({
                    where: { id: data.productId },
                    data: { status: 'sampling' },
                });
            }

            return await tx.sample.findUnique({
                where: { id: sample.id },
                include: {
                    product: {
                        include: {
                            project: true,
                        }
                    },
                    sender: true,
                    followUpTask: {
                        include: {
                            assignee: true,
                        }
                    },
                },
            });
        });
    },

    // Update sample
    updateSample: async (id: string, data: {
        status?: SampleStatus;
        notes?: string;
        images?: string[];
    }) => {
        return await prisma.sample.update({
            where: { id },
            data: {
                status: data.status,
                notes: data.notes,
                images: data.images,
            },
            include: {
                product: true,
                sender: true,
                feedback: true,
                followUpTask: true,
            }
        });
    },

    // Submit feedback for sample
    submitFeedback: async (sampleId: string, data: {
        feedbackBy: string;
        visitId?: string;
        rating?: number;
        customerReaction?: CustomerReaction;
        comments?: string;
        images?: string[];
    }) => {
        return await prisma.$transaction(async (tx) => {
            // Create feedback
            const feedback = await tx.sampleFeedback.create({
                data: {
                    sampleId,
                    feedbackBy: data.feedbackBy,
                    visitId: data.visitId,
                    rating: data.rating,
                    customerReaction: data.customerReaction,
                    comments: data.comments,
                    images: data.images || [],
                },
            });

            // Update sample status
            const newStatus: SampleStatus =
                data.customerReaction === 'very_positive' || data.customerReaction === 'positive'
                    ? 'approved'
                    : data.customerReaction === 'very_negative'
                        ? 'rejected'
                        : 'feedback_received';

            await tx.sample.update({
                where: { id: sampleId },
                data: { status: newStatus },
            });

            // Mark follow-up task as completed
            await tx.rndTask.updateMany({
                where: {
                    sampleId,
                    taskType: 'sample_followup',
                    status: { not: 'completed' }
                },
                data: {
                    status: 'completed',
                    completionNote: `Feedback collected: ${data.customerReaction || 'No reaction specified'}`,
                },
            });

            return feedback;
        });
    },

    // Get feedback for sample
    getFeedback: async (sampleId: string) => {
        return await prisma.sampleFeedback.findUnique({
            where: { sampleId },
            include: {
                sample: {
                    include: {
                        product: {
                            include: {
                                project: true,
                            }
                        }
                    }
                },
                collector: true,
                visit: true,
            },
        });
    },

    // Delete sample
    deleteSample: async (id: string) => {
        return await prisma.sample.delete({
            where: { id },
        });
    },

    // Get sample statistics
    getSampleStats: async () => {
        const [total, sent, pendingFeedback, approved, rejected] = await Promise.all([
            prisma.sample.count(),
            prisma.sample.count({ where: { status: 'sent' } }),
            prisma.sample.count({ where: { status: 'pending_feedback' } }),
            prisma.sample.count({ where: { status: 'approved' } }),
            prisma.sample.count({ where: { status: 'rejected' } }),
        ]);

        return { total, sent, pendingFeedback, approved, rejected };
    }
};
