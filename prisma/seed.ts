
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
    mockEmployees,
    mockCompanies,
    mockVisits,
    mockTasks,
    mockLeaveRequests,
    mockActivityLogs
} from '../src/utils/mockData';

const prisma = new PrismaClient();

// Helper to map mock VatType to Prisma VatType
function mapVatType(vatType?: string): 'ex_vat' | 'in_vat' | 'non_vat' | null {
    if (!vatType) return null;
    switch (vatType) {
        case 'ex-vat': return 'ex_vat';
        case 'in-vat': return 'in_vat';
        case 'non-vat': return 'non_vat';
        default: return null;
    }
}

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Clean up existing data (Delete in order to respect Foreign Keys)
    // Delete child tables first, then parents
    console.log('🧹 Cleaning database...');
    try {
        await prisma.activityLog.deleteMany();
        await prisma.leaveRequest.deleteMany();
        await prisma.task.deleteMany();
        await prisma.visit.deleteMany();
        await prisma.contactPerson.deleteMany();
        await prisma.location.deleteMany();
        await prisma.company.deleteMany();
        await prisma.employee.deleteMany();
    } catch (error) {
        console.warn('⚠️  Cleanup warning (tables might be missing):', error);
    }

    // 2. Seed Employees
    console.log('👤 Seeding employees...');

    // 2.1 Create Request Admin User
    const adminPassword = await bcrypt.hash('eEkeenKoo11!', 10);
    console.log('  - Creating Super Admin (admin)');
    await prisma.employee.create({
        data: {
            id: '4',
            name: 'Super Administrator',
            email: 'admin@ekenko.com',
            phone: '000-000-0000',
            role: 'manager',
            username: 'admin',
            password: adminPassword,
            portfolioSize: 0,
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
        }
    });

    // 2.2 Seed Mock Employees with hashed '123456' password
    const defaultPassword = await bcrypt.hash('123456', 10);
    for (const emp of mockEmployees) {
        // Avoid conflict if mock data has username 'admin'
        if (emp.username === 'admin') continue;

        await prisma.employee.create({
            data: {
                id: emp.id,
                name: emp.name,
                email: emp.email,
                phone: emp.phone,
                role: emp.role,
                avatar: emp.avatar,
                portfolioSize: emp.portfolioSize,
                username: emp.username,
                password: defaultPassword,
            },
        });
    }

    // 3. Seed Companies & Locations
    console.log('🏢 Seeding companies and locations...');
    for (const comp of mockCompanies) {
        // Create Company
        await prisma.company.create({
            data: {
                id: comp.id,
                name: comp.name,
                taxId: comp.taxId,
                logo: comp.logo,
                grade: (comp.grade as any) || 'C',
                status: (comp.status as any),
                // Using nested write for locations to ensure connection
                locations: {
                    create: comp.locations.map((loc) => ({
                        id: loc.id,
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
                        vatType: mapVatType(loc.vatType || undefined), // Fix Enum Mismatch
                        promotionNotes: loc.promotionNotes,
                        notes: loc.notes,
                        statusNote: loc.statusNote,
                        createdBy: loc.createdBy,
                        assignedEmployeeIds: loc.assignedEmployeeIds || [],
                        // Create Contacts nested within Location
                        contacts: {
                            create: (loc.contacts || []).map(contact => ({
                                id: contact.id,
                                name: contact.name,
                                role: contact.role,
                                phone: contact.phone,
                                lineId: contact.lineId
                            }))
                        }
                    })),
                },
            },
        });
    }

    // 4. Seed Tasks
    console.log('📋 Seeding tasks...');
    for (const task of mockTasks) {
        try {
            await prisma.task.create({
                data: {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    objectives: task.objectives || [],
                    assigneeId: task.assigneeId,
                    customerId: task.customerId, // Optional relation to Company
                    locationId: task.locationId, // Optional relation to Location
                    dueDate: new Date(task.dueDate),
                    priority: (task.priority as any) || 'medium',
                    status: task.status,
                    createdAt: new Date(task.createdAt || new Date()),
                    completionNote: task.completionNote,
                },
            });
        } catch (e) { console.warn(`Skipping task ${task.id} due to constraint error.`); }
    }

    // 5. Seed Visits
    console.log('🚗 Seeding visits...');
    for (const visit of mockVisits) {
        try {
            await prisma.visit.create({
                data: {
                    id: visit.id,
                    employeeId: visit.employeeId,
                    locationId: visit.locationId,
                    checkInTime: new Date(visit.checkInTime),
                    checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : null,
                    objectives: visit.objectives || [],
                    notes: visit.notes,
                    images: visit.images || [],
                    metOwner: visit.metOwner,
                },
            });
        } catch (e) { console.warn(`Skipping visit ${visit.id} due to constraint error.`); }
    }

    // 6. Seed Leave Requests
    console.log('🏖️ Seeding leave requests...');
    for (const leave of mockLeaveRequests) {
        try {
            await prisma.leaveRequest.create({
                data: {
                    id: leave.id,
                    employeeId: leave.employeeId,
                    type: (leave.type === 'annual' ? 'vacation' : leave.type) as any,
                    startDate: new Date(leave.startDate),
                    endDate: new Date(leave.endDate),
                    days: leave.days || 1,
                    reason: leave.reason || '-',
                    status: leave.status,
                    reviewNote: leave.reviewNote,
                    reviewedBy: leave.reviewedBy,
                    reviewedAt: leave.reviewedAt ? new Date(leave.reviewedAt) : null,
                    createdAt: new Date(leave.createdAt),
                },
            });
        } catch (e) { console.warn(`Skipping leave request ${leave.id} due to constraint error.`); }
    }

    // 7. Seed Activity Logs
    console.log('📝 Seeding activity logs...');
    for (const log of mockActivityLogs) {
        try {
            await prisma.activityLog.create({
                data: {
                    id: log.id,
                    type: log.type,
                    employeeId: log.employeeId,
                    employeeName: log.employeeName || 'Unknown',
                    description: log.description,
                    metadata: log.metadata || {}, // JSONB
                    timestamp: new Date(log.timestamp),
                },
            });
        } catch (e) { console.warn(`Skipping log ${log.id} due to constraint error.`); }
    }

    // 8. Seed Assets
    console.log('📦 Seeding assets...');
    await prisma.assetTransaction.deleteMany();
    await prisma.contractItem.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.asset.deleteMany();

    const assets = [
        { serialNumber: 'SN-COL-001', model: 'Cooler Grade A', status: 'AVAILABLE', condition: 'NEW', cost: 15000 },
        { serialNumber: 'SN-COL-002', model: 'Cooler Grade B', status: 'RENTED', condition: 'USED', cost: 12000 },
        { serialNumber: 'SN-FRZ-001', model: 'Freezer Big', status: 'MAINTENANCE', condition: 'BROKEN', cost: 25000 },
        { serialNumber: 'SN-FRZ-002', model: 'Freezer Small', status: 'AVAILABLE', condition: 'NEW', cost: 18000 },
        { serialNumber: 'SN-DSP-001', model: 'Display Rack', status: 'RENTED', condition: 'USED', cost: 5000 },
        { serialNumber: 'SN-DSP-002', model: 'Display Rack', status: 'LOST', condition: 'USED', cost: 5000 },
    ];

    for (const a of assets) {
        await prisma.asset.create({
            data: {
                serialNumber: a.serialNumber,
                modelName: a.model,
                status: a.status as any,
                condition: a.condition as any,
                cost: a.cost,
                purchaseDate: new Date('2025-01-01'),
            }
        });
    }

    console.log('✅ Seeding completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
