
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('✅ Connection successful!');

        const companyCount = await prisma.company.count();
        console.log(`Current Company count: ${companyCount}`);

        const employeeCount = await prisma.employee.count();
        console.log(`Current Employee count: ${employeeCount}`);

    } catch (e) {
        console.error('❌ Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
