import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding test entries...')

  // Get required data
  const cycle = await prisma.cycle.findFirst({ where: { status: 'open' } })
  const john = await prisma.user.findFirst({ where: { email: 'john@brewing.com' } })
  const abInbev = await prisma.company.findFirst({ where: { name: 'Anheuser-Busch InBev' } })
  const heineken = await prisma.company.findFirst({ where: { name: 'Heineken' } })
  const usCountry = await prisma.country.findFirst({ where: { countryName: 'United States' } })
  const germanyCountry = await prisma.country.findFirst({ where: { countryName: 'Germany' } })
  const normalSegment = await prisma.segment.findFirst({ where: { name: 'Normal beer' } })
  const lightSegment = await prisma.segment.findFirst({ where: { name: 'Light beer' } })
  const stlPlant = await prisma.plant.findFirst({ where: { code: 'STL-001' } })
  const munichPlant = await prisma.plant.findFirst({ where: { code: 'MUN-001' } })

  if (!cycle || !john || !abInbev || !heineken || !usCountry || !germanyCountry || !normalSegment || !lightSegment || !stlPlant || !munichPlant) {
    throw new Error('Required seed data not found. Run main seed first.')
  }

  // Entry 1: Anheuser-Busch InBev - St. Louis - Normal Beer
  const entry1 = await prisma.entry.create({
    data: {
      cycleId: cycle.id,
      accountManagerUserId: john.id,
      plantId: stlPlant.id,
      companyId: abInbev.id,
      countryId: usCountry.id,
      region: usCountry.region,
      subregion: usCountry.subregion,
      existingCustomer: 'yes',
      goToMarket: 'direct',
      productionBeerHlYear: 500000,
      segmentId: normalSegment.id,
      productionPercent: 70,
      confidencePercent: 85,
      comments: 'Major customer with stable production volumes. High confidence in data quality.',
      status: 'finalized',
      finalized: true,
      approvalStatus: 'pending',
      finalizedAt: new Date(),
    },
  })

  console.log('✓ Entry 1 created:', entry1.id)

  // Add enzyme values for Entry 1
  const enzymeCategories = await prisma.enzymeCategory.findMany({ orderBy: { sortOrder: 'asc' } })

  // Entry 1 Enzymes
  await prisma.entryEnzymeValue.createMany({
    data: [
      {
        entryId: entry1.id,
        enzymeCategoryId: enzymeCategories[0].id, // Starch liquefaction
        usageStatus: 'used',
        penetrationPercent: 80,
        iffMarketSharePercent: 60,
        novonesisMarketSharePercent: 30,
        dsmMarketSharePercent: 10,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry1.id,
        enzymeCategoryId: enzymeCategories[1].id, // Raw material flexibility
        usageStatus: 'used',
        penetrationPercent: 65,
        iffMarketSharePercent: 45,
        novonesisMarketSharePercent: 35,
        dsmMarketSharePercent: 15,
        othersMarketSharePercent: 5,
        confirmed: true,
      },
      {
        entryId: entry1.id,
        enzymeCategoryId: enzymeCategories[2].id, // Mash separation
        usageStatus: 'used',
        penetrationPercent: 50,
        iffMarketSharePercent: 50,
        novonesisMarketSharePercent: 30,
        dsmMarketSharePercent: 20,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry1.id,
        enzymeCategoryId: enzymeCategories[3].id, // Attenuation
        usageStatus: 'used',
        penetrationPercent: 40,
        iffMarketSharePercent: 40,
        novonesisMarketSharePercent: 40,
        dsmMarketSharePercent: 20,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry1.id,
        enzymeCategoryId: enzymeCategories[4].id, // Diacetyl control
        usageStatus: 'not_used',
        penetrationPercent: 0,
        confirmed: true,
      },
      {
        entryId: entry1.id,
        enzymeCategoryId: enzymeCategories[5].id, // Malting
        usageStatus: 'not_used',
        penetrationPercent: 0,
        confirmed: true,
      },
      {
        entryId: entry1.id,
        enzymeCategoryId: enzymeCategories[6].id, // Colloidal stability
        usageStatus: 'used',
        penetrationPercent: 30,
        iffMarketSharePercent: 70,
        novonesisMarketSharePercent: 20,
        dsmMarketSharePercent: 10,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry1.id,
        enzymeCategoryId: enzymeCategories[7].id, // Other
        usageStatus: 'unknown',
        penetrationPercent: null,
        confirmed: false,
      },
    ],
  })

  console.log('✓ Entry 1 enzymes added')

  // Entry 2: Heineken - Munich - Light Beer
  const entry2 = await prisma.entry.create({
    data: {
      cycleId: cycle.id,
      accountManagerUserId: john.id,
      plantId: munichPlant.id,
      companyId: heineken.id,
      countryId: germanyCountry.id,
      region: germanyCountry.region,
      subregion: germanyCountry.subregion,
      existingCustomer: 'yes',
      goToMarket: 'distributor',
      distributorId: null, // Could add distributor
      productionBeerHlYear: 350000,
      segmentId: lightSegment.id,
      productionPercent: 45,
      confidencePercent: 75,
      comments: 'Light beer segment growing in German market. Some uncertainty on exact production volumes.',
      status: 'finalized',
      finalized: true,
      approvalStatus: 'submitted',
      finalizedAt: new Date(),
      submittedForApprovalAt: new Date(),
    },
  })

  console.log('✓ Entry 2 created:', entry2.id)

  // Entry 2 Enzymes
  await prisma.entryEnzymeValue.createMany({
    data: [
      {
        entryId: entry2.id,
        enzymeCategoryId: enzymeCategories[0].id,
        usageStatus: 'used',
        penetrationPercent: 90,
        iffMarketSharePercent: 55,
        novonesisMarketSharePercent: 35,
        dsmMarketSharePercent: 10,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry2.id,
        enzymeCategoryId: enzymeCategories[1].id,
        usageStatus: 'used',
        penetrationPercent: 75,
        iffMarketSharePercent: 50,
        novonesisMarketSharePercent: 30,
        dsmMarketSharePercent: 20,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry2.id,
        enzymeCategoryId: enzymeCategories[2].id,
        usageStatus: 'used',
        penetrationPercent: 60,
        iffMarketSharePercent: 45,
        novonesisMarketSharePercent: 40,
        dsmMarketSharePercent: 15,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry2.id,
        enzymeCategoryId: enzymeCategories[3].id,
        usageStatus: 'used',
        penetrationPercent: 85, // High for light beer (RDF control)
        iffMarketSharePercent: 60,
        novonesisMarketSharePercent: 25,
        dsmMarketSharePercent: 15,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry2.id,
        enzymeCategoryId: enzymeCategories[4].id,
        usageStatus: 'used',
        penetrationPercent: 55,
        iffMarketSharePercent: 50,
        novonesisMarketSharePercent: 35,
        dsmMarketSharePercent: 15,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry2.id,
        enzymeCategoryId: enzymeCategories[5].id,
        usageStatus: 'not_used',
        penetrationPercent: 0,
        confirmed: true,
      },
      {
        entryId: entry2.id,
        enzymeCategoryId: enzymeCategories[6].id,
        usageStatus: 'used',
        penetrationPercent: 40,
        iffMarketSharePercent: 65,
        novonesisMarketSharePercent: 25,
        dsmMarketSharePercent: 10,
        othersMarketSharePercent: 0,
        confirmed: true,
      },
      {
        entryId: entry2.id,
        enzymeCategoryId: enzymeCategories[7].id,
        usageStatus: 'not_used',
        penetrationPercent: 0,
        confirmed: true,
      },
    ],
  })

  console.log('✓ Entry 2 enzymes added')
  console.log('✨ Test entries complete!')
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
