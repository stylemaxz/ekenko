
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning database...');

    try {
        // Delete all data in order (respecting foreign keys)
        await prisma.activityLog.deleteMany();
        await prisma.leaveRequest.deleteMany();
        await prisma.task.deleteMany();
        await prisma.visit.deleteMany();
        await prisma.contactPerson.deleteMany();
        await prisma.location.deleteMany();
        await prisma.company.deleteMany();

        // Delete all employees EXCEPT admin
        await prisma.employee.deleteMany({
            where: {
                username: {
                    not: 'admin'
                }
            }
        });

        console.log('✅ All mock data deleted successfully!');
        console.log('');
        console.log('📝 Remaining data:');
        console.log('  - Admin user (username: admin)');
        console.log('');
        console.log('🎉 Database is now clean and ready for real data!');

    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        throw error;
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
