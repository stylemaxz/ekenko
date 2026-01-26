
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for Tech Office HQ...');

    // Find the company "Tech Office HQ" (or similar if exact name not known, but user screenshot says "Tech Office HQ")
    let company = await prisma.company.findFirst({
        where: { name: { contains: 'Tech Office HQ', mode: 'insensitive' } }
    });

    if (!company) {
        console.log('Tech Office HQ not found, creating it...');
        company = await prisma.company.create({
            data: {
                name: 'Tech Office HQ',
                grade: 'A',
                status: 'active'
            }
        });
    }

    console.log(`Found/Created Company: ${company.name} (${company.id})`);

    // Check if it has locations
    const locations = await prisma.location.findMany({
        where: { companyId: company.id }
    });

    console.log(`Existing locations: ${locations.length}`);

    if (locations.length === 0) {
        console.log('Adding mock locations...');
        await prisma.location.createMany({
            data: [
                {
                    name: 'Main Office (Mock)',
                    address: '888 Sukhumvit Rd',
                    companyId: company.id,
                    lat: 13.7,
                    lng: 100.5,
                    status: 'active'
                },
                {
                    name: 'Warehouse A (Mock)',
                    address: '999 Bangna-Trad',
                    companyId: company.id,
                    lat: 13.6,
                    lng: 100.7,
                    status: 'active'
                }
            ]
        });
        console.log('Mock locations added.');
    } else {
        console.log('Locations already exist.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
