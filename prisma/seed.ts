import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.rSVP.deleteMany();
  await prisma.invitationCode.deleteMany();
  await prisma.group.deleteMany();

  // Create groups
  const createdGroups = [];
  const groups = [
    {
      name: 'Family',
      description: 'Family members',
    },
    {
      name: 'Friends',
      description: 'Close friends',
    },
    {
      name: 'Colleagues',
      description: 'Work colleagues',
    },
  ];

  for (const groupData of groups) {
    const group = await prisma.group.create({
      data: groupData,
    });
    createdGroups.push(group);
    console.log(`✅ Created group: ${groupData.name}`);
  }

  // Create invitation codes
  const codes = [
    {
      code: 'GANN-SOM-001',
      status: 'active',
      note: 'Sample invitation code 1',
      groupId: createdGroups[0].id, // Family
    },
    {
      code: 'GANN-SOM-002',
      status: 'active',
      note: 'Sample invitation code 2',
      groupId: createdGroups[1].id, // Friends
    },
    {
      code: 'GANN-SOM-TEST',
      status: 'disabled',
      note: 'Test code (disabled)',
      groupId: createdGroups[2].id, // Colleagues
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
