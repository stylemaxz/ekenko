
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting cleanup of non-admin data...');

    try {
        // 1. Delete transactional data first (due to foreign keys)
        console.log('Deleting Activity Logs...');
        await prisma.activityLog.deleteMany({});

        console.log('Deleting Visits...');
        await prisma.visit.deleteMany({});

        console.log('Deleting Tasks...');
        await prisma.task.deleteMany({});

        console.log('Deleting Leave Requests...');
        await prisma.leaveRequest.deleteMany({});

        // 2. Delete Relational Data
        console.log('Deleting Contact Persons...');
        await prisma.contactPerson.deleteMany({});

        console.log('Deleting Locations...');
        // We need to delete locations that belong to companies we are about to delete
        // OR just delete all locations if we are wiping everything except admin users
        await prisma.location.deleteMany({});

        console.log('Deleting Companies...');
        await prisma.company.deleteMany({});

        // 3. Delete Employees (EXCEPT Admins/Managers)
        console.log('Deleting Sales Employees...');
        // Assuming 'manager' role is for admins. Adjust if your admin has a specific username like 'admin'.
        // If you want to keep SPECIFICALLY the user 'admin', use username check.

        const count = await prisma.employee.deleteMany({
            where: {
                AND: [
                    { role: { not: 'manager' } }, // Delete everyone who is NOT a manager
                    // Extra safety: Don't delete if username is 'admin' (just in case 'admin' has different role)
                    { username: { not: 'admin' } }
                ]
            }
        });

        console.log(`Deleted ${count.count} employees.`);
        console.log('✅ Cleanup completed successfully! Only Admin/Manager users remain.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
