
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.leaveRequest.count();
  console.log(`Total leave requests: ${count}`);
  
  const requests = await prisma.leaveRequest.findMany({
    include: { employee: true }
  });
  console.log(JSON.stringify(requests, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
