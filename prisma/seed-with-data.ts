import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed with test data...')

  // Hash password for all test users
  const hashedPassword = await bcrypt.hash('test123', 10)

  // Create business segments
  const brewing = await prisma.businessSegment.upsert({
    where: { slug: 'brewing' },
    update: {},
    create: {
      name: 'Brewing',
      slug: 'brewing',
      description: 'Beer and beverage production',
      color: '#CDE9FF',
      active: true,
    },
  })

  const bakery = await prisma.businessSegment.upsert({
    where: { slug: 'bakery' },
    update: {},
    create: {
      name: 'Bakery',
      slug: 'bakery',
      description: 'Bread and baked goods',
      color: '#A8D5FF',
      active: true,
    },
  })

  const dairy = await prisma.businessSegment.upsert({
    where: { slug: 'dairy' },
    update: {},
    create: {
      name: 'Fresh Dairy',
      slug: 'dairy',
      description: 'Fresh dairy products',
      color: '#8BC1F7',
      active: true,
    },
  })

  const cheese = await prisma.businessSegment.upsert({
    where: { slug: 'cheese' },
    update: {},
    create: {
      name: 'Cheese',
      slug: 'cheese',
      description: 'Cheese production',
      color: '#6FA9E8',
      active: true,
    },
  })

  console.log('✅ Business segments created')

  // Create super admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodbio.com' },
    update: {},
    create: {
      email: 'admin@foodbio.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'super_admin',
    },
  })

  // Create test users for each segment (2 per segment)
  const brewingUser1 = await prisma.user.upsert({
    where: { email: 'brewing.manager1@foodbio.com' },
    update: {},
    create: {
      email: 'brewing.manager1@foodbio.com',
      password: hashedPassword,
      name: 'Sarah Chen',
      role: 'account_manager',
    },
  })

  const brewingUser2 = await prisma.user.upsert({
    where: { email: 'brewing.manager2@foodbio.com' },
    update: {},
    create: {
      email: 'brewing.manager2@foodbio.com',
      password: hashedPassword,
      name: 'Michael Torres',
      role: 'account_manager',
    },
  })

  const bakeryUser1 = await prisma.user.upsert({
    where: { email: 'bakery.manager1@foodbio.com' },
    update: {},
    create: {
      email: 'bakery.manager1@foodbio.com',
      password: hashedPassword,
      name: 'Emma Johnson',
      role: 'account_manager',
    },
  })

  const bakeryUser2 = await prisma.user.upsert({
    where: { email: 'bakery.manager2@foodbio.com' },
    update: {},
    create: {
      email: 'bakery.manager2@foodbio.com',
      password: hashedPassword,
      name: 'James Wilson',
      role: 'account_manager',
    },
  })

  const dairyUser1 = await prisma.user.upsert({
    where: { email: 'dairy.manager1@foodbio.com' },
    update: {},
    create: {
      email: 'dairy.manager1@foodbio.com',
      password: hashedPassword,
      name: 'Olivia Martinez',
      role: 'account_manager',
    },
  })

  const dairyUser2 = await prisma.user.upsert({
    where: { email: 'dairy.manager2@foodbio.com' },
    update: {},
    create: {
      email: 'dairy.manager2@foodbio.com',
      password: hashedPassword,
      name: 'Lucas Anderson',
      role: 'account_manager',
    },
  })

  const cheeseUser1 = await prisma.user.upsert({
    where: { email: 'cheese.manager1@foodbio.com' },
    update: {},
    create: {
      email: 'cheese.manager1@foodbio.com',
      password: hashedPassword,
      name: 'Sophia Brown',
      role: 'account_manager',
    },
  })

  const cheeseUser2 = await prisma.user.upsert({
    where: { email: 'cheese.manager2@foodbio.com' },
    update: {},
    create: {
      email: 'cheese.manager2@foodbio.com',
      password: hashedPassword,
      name: 'Noah Garcia',
      role: 'account_manager',
    },
  })

  console.log('✅ Test users created')

  // Delete existing user segments
  await prisma.userSegment.deleteMany({})

  // Assign users to segments
  await prisma.userSegment.createMany({
    data: [
      { userId: brewingUser1.id, segmentId: brewing.id, role: 'account_manager' },
      { userId: brewingUser2.id, segmentId: brewing.id, role: 'account_manager' },
      { userId: bakeryUser1.id, segmentId: bakery.id, role: 'account_manager' },
      { userId: bakeryUser2.id, segmentId: bakery.id, role: 'account_manager' },
      { userId: dairyUser1.id, segmentId: dairy.id, role: 'account_manager' },
      { userId: dairyUser2.id, segmentId: dairy.id, role: 'account_manager' },
      { userId: cheeseUser1.id, segmentId: cheese.id, role: 'account_manager' },
      { userId: cheeseUser2.id, segmentId: cheese.id, role: 'account_manager' },
    ],
  })

  console.log('✅ User segments assigned')

  // Get existing companies or create new ones
  const existingCompanies = await prisma.company.findMany()

  if (existingCompanies.length === 0) {
    await Promise.all([
      prisma.company.create({ data: { name: 'Anheuser-Busch InBev', normalizedName: 'anheuser-busch-inbev' } }),
      prisma.company.create({ data: { name: 'Heineken', normalizedName: 'heineken' } }),
      prisma.company.create({ data: { name: 'Carlsberg Group', normalizedName: 'carlsberg-group' } }),
      prisma.company.create({ data: { name: 'Grupo Bimbo', normalizedName: 'grupo-bimbo' } }),
      prisma.company.create({ data: { name: 'Flowers Foods', normalizedName: 'flowers-foods' } }),
      prisma.company.create({ data: { name: 'Nestlé', normalizedName: 'nestle' } }),
      prisma.company.create({ data: { name: 'Danone', normalizedName: 'danone' } }),
      prisma.company.create({ data: { name: 'Lactalis', normalizedName: 'lactalis' } }),
    ])
  }

  const companies = await prisma.company.findMany()
  console.log('✅ Companies ready')

  // Get existing countries
  const countries = await prisma.country.findMany()

  console.log('✅ Countries ready')

  // Get existing product segments
  const brewingSegments = await prisma.segment.findMany({ where: { businessSegmentId: brewing.id } })
  const bakerySegments = await prisma.segment.findMany({ where: { businessSegmentId: bakery.id } })
  const dairySegments = await prisma.segment.findMany({ where: { businessSegmentId: dairy.id } })
  const cheeseSegments = await prisma.segment.findMany({ where: { businessSegmentId: cheese.id } })

  console.log('✅ Product segments ready')

  // Get existing enzyme categories
  const brewingEnzymes = await prisma.enzymeCategory.findMany({ where: { businessSegmentId: brewing.id } })
  const bakeryEnzymes = await prisma.enzymeCategory.findMany({ where: { businessSegmentId: bakery.id } })
  const dairyEnzymes = await prisma.enzymeCategory.findMany({ where: { businessSegmentId: dairy.id } })
  const cheeseEnzymes = await prisma.enzymeCategory.findMany({ where: { businessSegmentId: cheese.id } })

  console.log('✅ Enzyme categories ready')

  // Get existing cycles
  const cycles = await prisma.cycle.findMany()

  console.log('✅ Cycles ready')

  console.log('🎉 Seed completed!')
  console.log('\n📝 Test Accounts:')
  console.log('Admin: admin@foodbio.com / test123')
  console.log('\nBrewing:')
  console.log('  - brewing.manager1@foodbio.com / test123 (Sarah Chen)')
  console.log('  - brewing.manager2@foodbio.com / test123 (Michael Torres)')
  console.log('\nBakery:')
  console.log('  - bakery.manager1@foodbio.com / test123 (Emma Johnson)')
  console.log('  - bakery.manager2@foodbio.com / test123 (James Wilson)')
  console.log('\nDairy:')
  console.log('  - dairy.manager1@foodbio.com / test123 (Olivia Martinez)')
  console.log('  - dairy.manager2@foodbio.com / test123 (Lucas Anderson)')
  console.log('\nCheese:')
  console.log('  - cheese.manager1@foodbio.com / test123 (Sophia Brown)')
  console.log('  - cheese.manager2@foodbio.com / test123 (Noah Garcia)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
