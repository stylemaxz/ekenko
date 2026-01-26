import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Spare Parts for Beverage Machines...');

    const parts = [
        {
            name: 'Mixing Blade (ใบมีดปั่นผสม)',
            partNumber: 'MX-BLD-01',
            description: 'Stainless steel mixing blade for powder dissolution. Compatible with Gen 2 models.',
            stock: 20,
            minStock: 5,
            price: 450.00,
            imageUrl: '',
        },
        {
            name: 'Dispenser Nozzle (หัวจ่ายน้ำหวาน)',
            partNumber: 'NOZ-002',
            description: 'Standard plastic dispenser nozzle with anti-drip valve.',
            stock: 15,
            minStock: 5,
            price: 120.00,
            imageUrl: '',
        },
        {
            name: 'Powder Canister 2L (โถใส่ผงเครื่องดื่ม)',
            partNumber: 'CAN-2L-01',
            description: 'Polycarbonate canister, 2 Liter capacity. Includes lid.',
            stock: 10,
            minStock: 3,
            price: 850.00,
            imageUrl: '',
        },
        {
            name: 'Drip Tray (ถาดรองน้ำทิ้ง)',
            partNumber: 'TRY-004',
            description: 'Plastic drip tray with stainless steel grid.',
            stock: 8,
            minStock: 2,
            price: 300.00,
            imageUrl: '',
        },
        {
            name: 'Mixing Motor 24V (มอเตอร์ปั่น)',
            partNumber: 'MTR-24V-X',
            description: 'High-speed DC motor, 24V, 3000 RPM for mixing chambers.',
            stock: 5,
            minStock: 2,
            price: 1200.00,
            imageUrl: '',
        },
        {
            name: 'Water Pump (ปั๊มน้ำแรงดัน)',
            partNumber: 'PMP-HI-01',
            description: 'Diaphragm water pump, self-priming.',
            stock: 12,
            minStock: 3,
            price: 650.00,
            imageUrl: '',
        },
        {
            name: 'Solenoid Valve (วาล์วเปิด-ปิดน้ำ)',
            partNumber: 'SOL-V-02',
            description: '2-way solenoid valve, normally closed, 24VDC.',
            stock: 25,
            minStock: 10,
            price: 250.00,
            imageUrl: '',
        },
        {
            name: 'Heating Element 500W (ขดลวดทำความร้อน)',
            partNumber: 'HEAT-500W',
            description: 'Immersion heater for hot water tank.',
            stock: 6,
            minStock: 2,
            price: 550.00,
            imageUrl: '',
        },
        {
            name: 'Control Panel PCB (แผงวงจรควบคุม)',
            partNumber: 'PCB-GEN2',
            description: 'Main control board with display interface.',
            stock: 4,
            minStock: 1,
            price: 2500.00,
            imageUrl: '',
        },
        {
            name: 'O-Ring Seal Kit (ชุดซีลยางกันรั่ว)',
            partNumber: 'SEAL-KIT-A',
            description: 'Complete set of silicone O-rings for one machine.',
            stock: 50,
            minStock: 15,
            price: 80.00,
            imageUrl: '',
        },
    ];

    for (const part of parts) {
        const existing = await prisma.sparePart.findUnique({
            where: { partNumber: part.partNumber },
        });

        if (!existing) {
            await prisma.sparePart.create({
                data: part,
            });
            console.log(`✅ Created: ${part.name}`);
        } else {
            // Update stock if already exists? Optional.
            // For now, we skip or update stock to ensure we have enough.
            await prisma.sparePart.update({
                where: { id: existing.id },
                data: {
                    stock: { set: part.stock < existing.stock ? existing.stock : part.stock } // Ensure mock stock doesn't lower actual stock if higher
                }
            })
            console.log(`🔹 Updated/Skipped: ${part.name} (Already exists)`);
        }
    }

    console.log('✨ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
