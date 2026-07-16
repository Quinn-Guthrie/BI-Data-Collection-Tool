import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding data for all 4 segments...')

  const segments = await prisma.businessSegment.findMany()
  const brewing = segments.find(s => s.slug === 'brewing')!
  const bakery = segments.find(s => s.slug === 'bakery')!
  const dairy = segments.find(s => s.slug === 'dairy')!
  const cheese = segments.find(s => s.slug === 'cheese')!

  const admin = await prisma.user.findFirst({ where: { email: 'admin@brewing.com' } })
  if (!admin) throw new Error('Admin not found')

  // BAKERY PRODUCT SEGMENTS
  const bakerySegments = [
    { name: 'Bread', definition: 'White, whole wheat, multigrain breads' },
    { name: 'Pastries', definition: 'Croissants, danishes, sweet pastries' },
    { name: 'Cookies & Crackers', definition: 'Biscuits, cookies, crackers' },
  ]

  for (const seg of bakerySegments) {
    await prisma.segment.upsert({
      where: { businessSegmentId_name: { businessSegmentId: bakery.id, name: seg.name } },
      update: {},
      create: { ...seg, businessSegmentId: bakery.id }
    })
  }
  console.log('✅ Bakery product segments created')

  // DAIRY PRODUCT SEGMENTS
  const dairySegments = [
    { name: 'Fresh Milk', definition: 'Whole, skim, low-fat milk' },
    { name: 'Yogurt', definition: 'Greek, regular, flavored yogurt' },
    { name: 'Cream', definition: 'Heavy cream, whipping cream' },
  ]

  for (const seg of dairySegments) {
    await prisma.segment.upsert({
      where: { businessSegmentId_name: { businessSegmentId: dairy.id, name: seg.name } },
      update: {},
      create: { ...seg, businessSegmentId: dairy.id }
    })
  }
  console.log('✅ Dairy product segments created')

  // CHEESE PRODUCT SEGMENTS
  const cheeseSegments = [
    { name: 'Soft Cheese', definition: 'Brie, camembert, fresh cheese' },
    { name: 'Hard Cheese', definition: 'Cheddar, gouda, parmesan' },
    { name: 'Blue Cheese', definition: 'Blue, gorgonzola, roquefort' },
  ]

  for (const seg of cheeseSegments) {
    await prisma.segment.upsert({
      where: { businessSegmentId_name: { businessSegmentId: cheese.id, name: seg.name } },
      update: {},
      create: { ...seg, businessSegmentId: cheese.id }
    })
  }
  console.log('✅ Cheese product segments created')

  // BAKERY ENZYMES
  const bakeryEnzymes = [
    { name: 'Amylases', productReference: 'ALPHAMALT', sortOrder: 1 },
    { name: 'Xylanases', productReference: 'PENTOPAN', sortOrder: 2 },
    { name: 'Lipases', productReference: 'LIPOPAN', sortOrder: 3 },
    { name: 'Glucose Oxidases', productReference: 'GLUZYME', sortOrder: 4 },
    { name: 'Proteases', productReference: 'PROTEMAX', sortOrder: 5 },
  ]

  for (const enzyme of bakeryEnzymes) {
    await prisma.enzymeCategory.upsert({
      where: { businessSegmentId_name: { businessSegmentId: bakery.id, name: enzyme.name } },
      update: {},
      create: { ...enzyme, businessSegmentId: bakery.id }
    })
  }
  console.log('✅ Bakery enzymes created')

  // DAIRY ENZYMES
  const dairyEnzymes = [
    { name: 'Lactases', productReference: 'LACTAWAY', sortOrder: 1 },
    { name: 'Lipases (Dairy)', productReference: 'DAIRYLIP', sortOrder: 2 },
    { name: 'Proteases (Dairy)', productReference: 'PROTOLACT', sortOrder: 3 },
  ]

  for (const enzyme of dairyEnzymes) {
    await prisma.enzymeCategory.upsert({
      where: { businessSegmentId_name: { businessSegmentId: dairy.id, name: enzyme.name } },
      update: {},
      create: { ...enzyme, businessSegmentId: dairy.id }
    })
  }
  console.log('✅ Dairy enzymes created')

  // CHEESE ENZYMES
  const cheeseEnzymes = [
    { name: 'Chymosins', productReference: 'CHYMAX', sortOrder: 1 },
    { name: 'Lipases (Cheese)', productReference: 'PALATASE', sortOrder: 2 },
    { name: 'Lysozymes', productReference: 'LYSOMAX', sortOrder: 3 },
  ]

  for (const enzyme of cheeseEnzymes) {
    await prisma.enzymeCategory.upsert({
      where: { businessSegmentId_name: { businessSegmentId: cheese.id, name: enzyme.name } },
      update: {},
      create: { ...enzyme, businessSegmentId: cheese.id }
    })
  }
  console.log('✅ Cheese enzymes created')

  // CREATE CYCLES FOR ALL SEGMENTS
  await prisma.cycle.upsert({
    where: { id: 'bakery-cycle-2026' },
    update: {},
    create: {
      id: 'bakery-cycle-2026',
      name: '2026 Annual - Bakery',
      status: 'open',
      segmentId: bakery.id,
      createdBy: admin.id
    }
  })

  await prisma.cycle.upsert({
    where: { id: 'dairy-cycle-2026' },
    update: {},
    create: {
      id: 'dairy-cycle-2026',
      name: '2026 Annual - Fresh Dairy',
      status: 'open',
      segmentId: dairy.id,
      createdBy: admin.id
    }
  })

  await prisma.cycle.upsert({
    where: { id: 'cheese-cycle-2026' },
    update: {},
    create: {
      id: 'cheese-cycle-2026',
      name: '2026 Annual - Cheese',
      status: 'open',
      segmentId: cheese.id,
      createdBy: admin.id
    }
  })

  console.log('✅ Cycles created for all segments')

  console.log('✨ All segments ready with data!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
