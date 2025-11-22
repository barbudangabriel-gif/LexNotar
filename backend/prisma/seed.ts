import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default office
  const office = await prisma.office.upsert({
    where: { code: 'BUC-001' },
    update: {},
    create: {
      name: 'Birou Notarial București Centru',
      code: 'BUC-001',
      address: 'Str. Aviatorilor nr. 10',
      city: 'București',
      county: 'București',
      phone: '+40 21 123 4567',
      email: 'contact@lexnotar.ro',
      active: true,
    },
  });

  console.log('✅ Office created:', office.name);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lexnotar.ro' },
    update: {},
    create: {
      email: 'admin@lexnotar.ro',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      phone: '+40 700 000 000',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      officeId: office.id,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create notar user
  const notarPassword = await bcrypt.hash('notar123', 10);
  const notar = await prisma.user.upsert({
    where: { email: 'notar@lexnotar.ro' },
    update: {},
    create: {
      email: 'notar@lexnotar.ro',
      password: notarPassword,
      firstName: 'Ion',
      lastName: 'Popescu',
      phone: '+40 700 000 001',
      role: UserRole.NOTAR,
      status: UserStatus.ACTIVE,
      licenseNumber: 'NOT-BUC-2020-001',
      officeId: office.id,
    },
  });

  console.log('✅ Notar user created:', notar.email);

  // Create asistent user
  const asistentPassword = await bcrypt.hash('asistent123', 10);
  const asistent = await prisma.user.upsert({
    where: { email: 'asistent@lexnotar.ro' },
    update: {},
    create: {
      email: 'asistent@lexnotar.ro',
      password: asistentPassword,
      firstName: 'Maria',
      lastName: 'Ionescu',
      phone: '+40 700 000 002',
      role: UserRole.ASISTENT,
      status: UserStatus.ACTIVE,
      officeId: office.id,
    },
  });

  console.log('✅ Asistent user created:', asistent.email);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📝 Default credentials:');
  console.log('   Admin:    admin@lexnotar.ro / admin123');
  console.log('   Notar:    notar@lexnotar.ro / notar123');
  console.log('   Asistent: asistent@lexnotar.ro / asistent123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
