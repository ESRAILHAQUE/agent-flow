import { PrismaClient, UserRole, OrgPlan } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const hashedPassword = await hash('admin123456', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@agentflow.io' },
    update: {},
    create: {
      email: 'admin@agentflow.io',
      name: 'Super Admin',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // Create Demo Organization Owner
  const ownerPassword = await hash('owner123456', 12);

  const orgOwner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      email: 'owner@demo.com',
      name: 'Demo Owner',
      password: ownerPassword,
      role: UserRole.ORG_OWNER,
      emailVerified: true,
    },
  });
  console.log('✅ Org Owner created:', orgOwner.email);

  // Create Demo Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo-company',
      plan: OrgPlan.PRO,
      ownerId: orgOwner.id,
    },
  });
  console.log('✅ Organization created:', org.name);

  // Create Default Team
  const team = await prisma.team.create({
    data: {
      name: 'General',
      orgId: org.id,
      members: {
        create: {
          userId: orgOwner.id,
          role: 'ADMIN',
          inviteAccepted: true,
        },
      },
    },
  });
  console.log('✅ Team created:', team.name);

  // Create Demo Team Member
  const memberPassword = await hash('member123456', 12);

  const member = await prisma.user.upsert({
    where: { email: 'member@demo.com' },
    update: {},
    create: {
      email: 'member@demo.com',
      name: 'Demo Member',
      password: memberPassword,
      role: UserRole.TEAM_MEMBER,
      emailVerified: true,
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: member.id,
      role: 'MEMBER',
      inviteAccepted: true,
    },
  });
  console.log('✅ Team Member created:', member.email);

  // Create Free Subscription for the org
  await prisma.subscription.upsert({
    where: { orgId: org.id },
    update: {},
    create: {
      orgId: org.id,
      plan: OrgPlan.PRO,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Subscription created');

  console.log('\n🎉 Seed complete!');
  console.log('---');
  console.log('Super Admin:  admin@agentflow.io / admin123456');
  console.log('Org Owner:    owner@demo.com / owner123456');
  console.log('Team Member:  member@demo.com / member123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
