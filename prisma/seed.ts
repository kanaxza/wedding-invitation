import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.rSVP.deleteMany();
  await prisma.invitationCode.deleteMany();

  // Create invitation codes
  const codes = [
    {
      code: 'GANN-SOM-001',
      status: 'active',
      note: 'Sample invitation code 1',
    },
    {
      code: 'GANN-SOM-002',
      status: 'active',
      note: 'Sample invitation code 2',
    },
    {
      code: 'GANN-SOM-TEST',
      status: 'disabled',
      note: 'Test code (disabled)',
    },
  ];

  for (const codeData of codes) {
    await prisma.invitationCode.create({
      data: codeData,
    });
    console.log(`✅ Created invitation code: ${codeData.code}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
