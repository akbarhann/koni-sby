
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Seed Super Admin (KONI) - Existing Logic
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminEmail = 'admin@koni-surabaya.go.id';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      username: 'admin_koni',
      email: adminEmail,
      password_hash: passwordHash,
      role: 'ADMIN_KONI',
      is_active: true,
    },
  });
  console.log(`Created/Updated admin user: ${admin.username}`);

  // 2. Seed Master Cabor from CSV - Existing Logic
  const csvPath = path.join(__dirname, '../data/cabor.csv');

  if (fs.existsSync(csvPath)) {
    console.log(`Reading CSV from: ${csvPath}`);
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n');

    let caborCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      if (parts.length < 2) continue;
      const namaCabor = parts[1].trim();
      if (!namaCabor) continue;

      await prisma.masterCabor.upsert({
        where: { nama_cabor: namaCabor },
        update: {},
        create: {
          nama_cabor: namaCabor,
          is_verified: true,
        },
      });
      caborCount++;
    }
    console.log(`Successfully imported ${caborCount} Cabor from CSV.`);
  } else {
    console.log('CSV file not found, skipping Cabor import.');
  }

  // 3. Seed AturanPoin (Dynamic Scoring Rules)
  console.log('Seeding AturanPoin...');

  const rules = [
    // INTERNATIONAL
    { tingkat: 'INTERNATIONAL', medali: 'GOLD', poin: 500 },
    { tingkat: 'INTERNATIONAL', medali: 'SILVER', poin: 300 },
    { tingkat: 'INTERNATIONAL', medali: 'BRONZE', poin: 150 },
    { tingkat: 'INTERNATIONAL', medali: 'PARTICIPANT', poin: 50 },

    // NATIONAL
    { tingkat: 'NATIONAL', medali: 'GOLD', poin: 200 },
    { tingkat: 'NATIONAL', medali: 'SILVER', poin: 125 },
    { tingkat: 'NATIONAL', medali: 'BRONZE', poin: 75 },
    { tingkat: 'NATIONAL', medali: 'PARTICIPANT', poin: 25 },

    // PROVINCIAL
    { tingkat: 'PROVINCIAL', medali: 'GOLD', poin: 100 },
    { tingkat: 'PROVINCIAL', medali: 'SILVER', poin: 60 },
    { tingkat: 'PROVINCIAL', medali: 'BRONZE', poin: 30 },
    { tingkat: 'PROVINCIAL', medali: 'PARTICIPANT', poin: 10 },

    // CITY
    { tingkat: 'CITY', medali: 'GOLD', poin: 50 },
    { tingkat: 'CITY', medali: 'SILVER', poin: 25 },
    { tingkat: 'CITY', medali: 'BRONZE', poin: 10 },
    { tingkat: 'CITY', medali: 'PARTICIPANT', poin: 5 },

    // DISTRICT
    { tingkat: 'DISTRICT', medali: 'GOLD', poin: 10 },
    { tingkat: 'DISTRICT', medali: 'SILVER', poin: 5 },
    { tingkat: 'DISTRICT', medali: 'BRONZE', poin: 2 },
    { tingkat: 'DISTRICT', medali: 'PARTICIPANT', poin: 1 },
  ];

  for (const rule of rules) {
    await prisma.aturanPoin.upsert({
      where: {
        tingkat_medali: {
          tingkat: rule.tingkat,
          medali: rule.medali,
        },
      },
      update: {
        poin: rule.poin,
      },
      create: {
        tingkat: rule.tingkat,
        medali: rule.medali,
        poin: rule.poin,
      },
    });
  }
  console.log(`Seeded ${rules.length} AturanPoin rules.`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
