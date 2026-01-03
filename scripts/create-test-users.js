// Script to create test users
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Manager
    const manager = await prisma.employee.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: hashedPassword,
        name: 'Admin Manager',
        email: 'admin@ekenko.com',
        phone: '0812345678',
        role: 'manager',
        portfolioSize: 0,
      },
    });

    // Create Sales
    const sales = await prisma.employee.upsert({
      where: { username: 'sale1' },
      update: {},
      create: {
        username: 'sale1',
        password: hashedPassword,
        name: 'Sales Person 1',
        email: 'sale1@ekenko.com',
        phone: '0823456789',
        role: 'sales',
        portfolioSize: 0,
      },
    });

    console.log('✅ Test users created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: password123');
    console.log('  Role: manager');
    console.log('  Redirect: /admin/dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Sales:');
    console.log('  Username: sale1');
    console.log('  Password: password123');
    console.log('  Role: sales');
    console.log('  Redirect: /sale/dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
