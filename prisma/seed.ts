import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password for users
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create Admin User Only
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brewing.com' },
    update: {},
    create: {
      email: 'admin@brewing.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      region: null,
    },
  })

  console.log('✅ Admin user created')

  // Create Countries with Subregions
  const countries = [
    { countryName: 'United States', subregion: 'North America East', region: 'Americas' },
    { countryName: 'Mexico', subregion: 'North America South', region: 'Americas' },
    { countryName: 'Germany', subregion: 'Western Europe', region: 'Europe' },
    { countryName: 'United Kingdom', subregion: 'Western Europe', region: 'Europe' },
    { countryName: 'China', subregion: 'Asia Pacific', region: 'Asia' },
    { countryName: 'Brazil', subregion: 'Latin America', region: 'Americas' },
  ]

  for (const country of countries) {
    await prisma.country.upsert({
      where: { countryName: country.countryName },
      update: {},
      create: country,
    })
  }

  console.log('✅ Countries created')

  // Create Plants
  const usCountry = await prisma.country.findFirst({ where: { countryName: 'United States' } })
  const germanyCountry = await prisma.country.findFirst({ where: { countryName: 'Germany' } })
  const chinaCountry = await prisma.country.findFirst({ where: { countryName: 'China' } })

  if (usCountry) {
    await prisma.plant.upsert({
      where: { code: 'STL-001' },
      update: {},
      create: {
        name: 'St. Louis Brewery',
        code: 'STL-001',
        countryId: usCountry.id,
      },
    })
    await prisma.plant.upsert({
      where: { code: 'LA-002' },
      update: {},
      create: {
        name: 'Los Angeles Facility',
        code: 'LA-002',
        countryId: usCountry.id,
      },
    })
  }

  if (germanyCountry) {
    await prisma.plant.upsert({
      where: { code: 'MUN-001' },
      update: {},
      create: {
        name: 'Munich Plant',
        code: 'MUN-001',
        countryId: germanyCountry.id,
      },
    })
  }

  if (chinaCountry) {
    await prisma.plant.upsert({
      where: { code: 'SHA-001' },
      update: {},
      create: {
        name: 'Shanghai Brewery',
        code: 'SHA-001',
        countryId: chinaCountry.id,
      },
    })
  }

  console.log('✅ Plants created')

  // Create Segments
  const segments = [
    { name: 'Normal beer', definition: 'Standard beer' },
    { name: 'Light beer', definition: 'RDF above 75%' },
    { name: 'Adjunct beer', definition: '30 to 50% adjuncts' },
  ]

  for (const segment of segments) {
    await prisma.segment.upsert({
      where: { name: segment.name },
      update: {},
      create: segment,
    })
  }

  console.log('✅ Segments created')

  // Create Enzyme Categories
  const enzymeCategories = [
    {
      name: 'Efficient starch liquefaction enzymes',
      productReference: 'AMYLEX',
      sortOrder: 1,
    },
    {
      name: 'Optimize raw material flexibility and FAN generation enzymes',
      productReference: 'ALPHALASE',
      sortOrder: 2,
    },
    {
      name: 'Boost mash separation and beer filtration enzymes',
      productReference: 'LAMINEX',
      sortOrder: 3,
    },
    {
      name: 'Improve or decrease attenuation, %RDF, enzymes',
      productReference: 'DIAZYME',
      sortOrder: 4,
    },
    {
      name: 'Accelerate maturation via diacetyl control enzymes',
      productReference: 'AA 4000',
      sortOrder: 5,
    },
    {
      name: 'Malting enhancement enzymes',
      productReference: 'LAMINEX',
      sortOrder: 6,
    },
    {
      name: 'Enhance colloidal stability enzymes',
      productReference: 'BCLEAR',
      sortOrder: 7,
    },
    {
      name: 'Other enzymes',
      productReference: '',
      sortOrder: 8,
    },
  ]

  for (const enzyme of enzymeCategories) {
    await prisma.enzymeCategory.upsert({
      where: { name: enzyme.name },
      update: {},
      create: enzyme,
    })
  }

  console.log('✅ Enzyme categories created')

  // Create Companies
  const companies = [
    { name: 'Anheuser-Busch InBev', normalizedName: 'anheuser-busch-inbev' },
    { name: 'Heineken', normalizedName: 'heineken' },
    { name: 'Carlsberg Group', normalizedName: 'carlsberg-group' },
  ]

  for (const company of companies) {
    await prisma.company.upsert({
      where: { normalizedName: company.normalizedName },
      update: {},
      create: company,
    })
  }

  console.log('✅ Companies created')

  // Create Initial Cycle
  const cycle = await prisma.cycle.create({
    data: {
      name: '2026 Annual',
      status: 'open',
      createdBy: adminUser.id,
    },
  })

  console.log('✅ Initial cycle created')

  console.log('✨ Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
