import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password for users
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create 4 Business Segments
  const brewingSegment = await prisma.businessSegment.upsert({
    where: { slug: 'brewing' },
    update: {},
    create: {
      name: 'Brewing',
      slug: 'brewing',
      description: 'Beer and brewing sales data',
      color: '#3b82f6',
    },
  })

  const bakerySegment = await prisma.businessSegment.upsert({
    where: { slug: 'bakery' },
    update: {},
    create: {
      name: 'Bakery',
      slug: 'bakery',
      description: 'Bakery and bread sales data',
      color: '#f59e0b',
    },
  })

  const dairySegment = await prisma.businessSegment.upsert({
    where: { slug: 'dairy' },
    update: {},
    create: {
      name: 'Fresh Dairy',
      slug: 'dairy',
      description: 'Fresh dairy products sales data',
      color: '#10b981',
    },
  })

  const cheeseSegment = await prisma.businessSegment.upsert({
    where: { slug: 'cheese' },
    update: {},
    create: {
      name: 'Cheese',
      slug: 'cheese',
      description: 'Cheese products sales data',
      color: '#f97316',
    },
  })

  console.log('✅ Business segments created (Brewing, Bakery, Fresh Dairy, Cheese)')

  // Create Super Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@foodbio.com' },
    update: {},
    create: {
      email: 'admin@foodbio.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'super_admin',
    },
  })

  console.log('✅ Super admin user created')

  // Grant admin access to all 4 segments as segment_admin
  await prisma.userSegment.upsert({
    where: {
      userId_segmentId: {
        userId: adminUser.id,
        segmentId: brewingSegment.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      segmentId: brewingSegment.id,
      role: 'segment_admin',
    },
  })

  await prisma.userSegment.upsert({
    where: {
      userId_segmentId: {
        userId: adminUser.id,
        segmentId: bakerySegment.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      segmentId: bakerySegment.id,
      role: 'segment_admin',
    },
  })

  await prisma.userSegment.upsert({
    where: {
      userId_segmentId: {
        userId: adminUser.id,
        segmentId: dairySegment.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      segmentId: dairySegment.id,
      role: 'segment_admin',
    },
  })

  await prisma.userSegment.upsert({
    where: {
      userId_segmentId: {
        userId: adminUser.id,
        segmentId: cheeseSegment.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      segmentId: cheeseSegment.id,
      role: 'segment_admin',
    },
  })

  console.log('✅ Admin granted access to all segments')

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

  // Create Product Segments for Brewing
  const brewingProductSegments = [
    { name: 'Normal beer', definition: 'Standard beer', businessSegmentId: brewingSegment.id },
    { name: 'Light beer', definition: 'RDF above 75%', businessSegmentId: brewingSegment.id },
    { name: 'Adjunct beer', definition: '30 to 50% adjuncts', businessSegmentId: brewingSegment.id },
  ]

  for (const segment of brewingProductSegments) {
    await prisma.segment.upsert({
      where: {
        businessSegmentId_name: {
          businessSegmentId: segment.businessSegmentId,
          name: segment.name
        }
      },
      update: {},
      create: segment,
    })
  }

  console.log('✅ Product segments created for Brewing')

  // Create Enzyme Categories for Brewing
  const brewingEnzymeCategories = [
    {
      name: 'Efficient starch liquefaction enzymes',
      productReference: 'AMYLEX',
      sortOrder: 1,
      businessSegmentId: brewingSegment.id,
    },
    {
      name: 'Optimize raw material flexibility and FAN generation enzymes',
      productReference: 'ALPHALASE',
      sortOrder: 2,
      businessSegmentId: brewingSegment.id,
    },
    {
      name: 'Boost mash separation and beer filtration enzymes',
      productReference: 'LAMINEX',
      sortOrder: 3,
      businessSegmentId: brewingSegment.id,
    },
    {
      name: 'Improve or decrease attenuation, %RDF, enzymes',
      productReference: 'DIAZYME',
      sortOrder: 4,
      businessSegmentId: brewingSegment.id,
    },
    {
      name: 'Accelerate maturation via diacetyl control enzymes',
      productReference: 'AA 4000',
      sortOrder: 5,
      businessSegmentId: brewingSegment.id,
    },
    {
      name: 'Malting enhancement enzymes',
      productReference: 'LAMINEX',
      sortOrder: 6,
      businessSegmentId: brewingSegment.id,
    },
    {
      name: 'Enhance colloidal stability enzymes',
      productReference: 'BCLEAR',
      sortOrder: 7,
      businessSegmentId: brewingSegment.id,
    },
    {
      name: 'Other enzymes',
      productReference: '',
      sortOrder: 8,
      businessSegmentId: brewingSegment.id,
    },
  ]

  for (const enzyme of brewingEnzymeCategories) {
    await prisma.enzymeCategory.upsert({
      where: {
        businessSegmentId_name: {
          businessSegmentId: enzyme.businessSegmentId!,
          name: enzyme.name
        }
      },
      update: {},
      create: enzyme,
    })
  }

  console.log('✅ Enzyme categories created for Brewing')

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

  // Create Initial Cycle for Brewing segment
  const cycle = await prisma.cycle.create({
    data: {
      name: '2026 Annual - Brewing',
      status: 'open',
      createdBy: adminUser.id,
      segmentId: brewingSegment.id,
    },
  })

  console.log('✅ Initial cycle created for Brewing')

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
