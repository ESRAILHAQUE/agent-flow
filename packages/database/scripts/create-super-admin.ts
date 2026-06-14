import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const email = 'admin@agentflow.dev';
  const password = 'Admin@1234';
  const name = 'Super Admin';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Update to SUPER_ADMIN if already exists
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN', emailVerified: true },
    });
    console.log(`\n✅ Existing user updated to SUPER_ADMIN:`);
    console.log(`   Email: ${updated.email}`);
    console.log(`   Role:  ${updated.role}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });

  console.log(`\n✅ Super Admin created successfully!`);
  console.log(`   Email:    ${user.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ${user.role}`);
  console.log(`\n   🔗 Login at: http://localhost:3000/login`);
  console.log(`   🛡️  Admin panel: http://localhost:3000/admin\n`);
}

createSuperAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
