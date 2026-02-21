import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_USER = {
  email: 'checkmaite@checkmaite.local',
  name: 'checkmAIte',
  password: 'checkmAIte',
};

async function main() {
  console.log('🌱 Starting database seed...');

  const existingUser = await prisma.user.findUnique({
    where: { email: DEFAULT_USER.email },
  });

  if (existingUser) {
    console.log('✓ Default user already exists, skipping...');
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_USER.password, 12);

  const user = await prisma.user.create({
    data: {
      email: DEFAULT_USER.email,
      name: DEFAULT_USER.name,
      passwordHash,
    },
  });

  console.log(`✓ Created default user: ${user.name} (${user.email})`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Default Login Credentials:');
  console.log('  Username: checkmAIte');
  console.log('  Password: checkmAIte');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
