import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Creating test entries...')

  // Get all the data we need
  const [segments, companies, countries, users, cycles, enzymes, productSegments, admin] = await Promise.all([
    prisma.businessSegment.findMany(),
    prisma.company.findMany(),
    prisma.country.findMany(),
    prisma.user.findMany({ where: { role: 'account_manager' } }),
    prisma.cycle.findMany(),
    prisma.enzymeCategory.findMany(),
    prisma.segment.findMany(),
    prisma.user.findFirst({ where: { role: 'super_admin' } }),
  ])

  const brewing = segments.find(s => s.slug === 'brewing')
  const bakery = segments.find(s => s.slug === 'bakery')
  const dairy = segments.find(s => s.slug === 'dairy')
  const cheese = segments.find(s => s.slug === 'cheese')

  // Helper function to get random item
  const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  // Helper function to create enzyme values
  const createEnzymeValues = async (entryId: string, segmentEnzymes: any[]) => {
    for (const enzyme of segmentEnzymes) {
      const penetration = randomInt(0, 100)

      if (penetration > 0) {
        // Generate market share that adds up to 100
        const iff = randomInt(20, 50)
        const novonesis = randomInt(15, 40)
        const dsm = randomInt(10, 30)
        const others = 100 - iff - novonesis - dsm

        await prisma.entryEnzymeValue.create({
          data: {
            entryId,
            enzymeCategoryId: enzyme.id,
            penetrationPercent: penetration,
            iffMarketSharePercent: iff,
            novonesisMarketSharePercent: novonesis,
            dsmMarketSharePercent: dsm,
            othersMarketSharePercent: others,
            usageStatus: 'active',
          },
        })
      }
    }
  }

  const statuses = ['draft', 'finalized', 'finalized', 'finalized'] // More finalized than draft
  const approvalStatuses = [null, 'submitted', 'approved']

  // Create entries for Brewing users
  const brewingUsers = users.filter(u => u.email.includes('brewing'))
  const brewingCycle = cycles.find(c => c.segmentId === brewing?.id)
  const brewingEnzymes = enzymes.filter(e => e.businessSegmentId === brewing?.id)
  const brewingProducts = productSegments.filter(s => s.businessSegmentId === brewing?.id)

  for (const user of brewingUsers) {
    // Create 5-8 entries per user
    const entryCount = randomInt(5, 8)

    for (let i = 0; i < entryCount; i++) {
      const company = random(companies)
      const country = random(countries)
      const product = random(brewingProducts)
      const status = random(statuses) as any

      const entry = await prisma.entry.create({
        data: {
          cycleId: brewingCycle!.id,
          businessSegmentId: brewing!.id,
          accountManagerUserId: user.id,
          companyId: company.id,
          countryId: country.id,
          segmentId: product.id,
          subregion: random(['North', 'South', 'East', 'West']),
          region: random(['Americas', 'EMEA', 'APAC']),
          existingCustomer: random(['yes', 'no']),
          goToMarket: random(['direct', 'distributor']),
          productionBeerHlYear: randomInt(10000, 500000),
          productionPercent: randomInt(60, 100),
          confidencePercent: randomInt(70, 95),
          comments: `Entry for ${company.name} in ${country.name}`,
          status,
          finalized: status === 'finalized',
          approvalStatus: status === 'finalized' ? random(['pending', 'approved', 'rejected']) as any : 'pending',
          finalizedAt: status === 'finalized' ? new Date() : null,
        },
      })

      await createEnzymeValues(entry.id, brewingEnzymes)
    }
  }

  console.log(`✅ Created ${brewingUsers.length * 6} brewing entries`)

  // Create entries for Bakery users
  const bakeryUsers = users.filter(u => u.email.includes('bakery'))
  let bakeryCycle = cycles.find(c => c.segmentId === bakery?.id)

  if (!bakeryCycle) {
    bakeryCycle = await prisma.cycle.create({
      data: {
        name: '2024 Q1',
        status: 'open',
        segmentId: bakery!.id,
        createdBy: admin!.id,
      },
    })
  }

  const bakeryEnzymes = enzymes.filter(e => e.businessSegmentId === bakery?.id)
  const bakeryProducts = productSegments.filter(s => s.businessSegmentId === bakery?.id)

  if (bakeryProducts.length === 0) {
    console.log('⚠️  No bakery products found, skipping bakery entries')
  } else {
    for (const user of bakeryUsers) {
      const entryCount = randomInt(5, 8)

      for (let i = 0; i < entryCount; i++) {
        const company = random(companies)
        const country = random(countries)
        const product = random(bakeryProducts)
        const status = random(statuses) as any

      const entry = await prisma.entry.create({
        data: {
          cycleId: bakeryCycle!.id,
          businessSegmentId: bakery!.id,
          accountManagerUserId: user.id,
          companyId: company.id,
          countryId: country.id,
          segmentId: product.id,
          subregion: random(['North', 'South', 'East', 'West']),
          region: random(['Americas', 'EMEA', 'APAC']),
          existingCustomer: random(['yes', 'no']),
          goToMarket: random(['direct', 'distributor']),
          productionBeerHlYear: randomInt(5000, 300000),
          productionPercent: randomInt(60, 100),
          confidencePercent: randomInt(70, 95),
          comments: `Entry for ${company.name} in ${country.name}`,
          status,
          finalized: status === 'finalized',
          approvalStatus: status === 'finalized' ? random(['pending', 'approved', 'rejected']) as any : 'pending',
          finalizedAt: status === 'finalized' ? new Date() : null,
        },
      })

        await createEnzymeValues(entry.id, bakeryEnzymes)
      }
    }

    console.log(`✅ Created ${bakeryUsers.length * 6} bakery entries`)
  }

  // Create entries for Dairy users
  const dairyUsers = users.filter(u => u.email.includes('dairy'))
  let dairyCycle = cycles.find(c => c.segmentId === dairy?.id)

  if (!dairyCycle) {
    dairyCycle = await prisma.cycle.create({
      data: {
        name: '2024 Q1',
        status: 'open',
        segmentId: dairy!.id,
        createdBy: admin!.id,
      },
    })
  }

  const dairyEnzymes = enzymes.filter(e => e.businessSegmentId === dairy?.id)
  const dairyProducts = productSegments.filter(s => s.businessSegmentId === dairy?.id)

  if (dairyProducts.length === 0) {
    console.log('⚠️  No dairy products found, skipping dairy entries')
  } else {
    for (const user of dairyUsers) {
      const entryCount = randomInt(5, 8)

      for (let i = 0; i < entryCount; i++) {
        const company = random(companies)
        const country = random(countries)
        const product = random(dairyProducts)
        const status = random(statuses) as any

      const entry = await prisma.entry.create({
        data: {
          cycleId: dairyCycle!.id,
          businessSegmentId: dairy!.id,
          accountManagerUserId: user.id,
          companyId: company.id,
          countryId: country.id,
          segmentId: product.id,
          subregion: random(['North', 'South', 'East', 'West']),
          region: random(['Americas', 'EMEA', 'APAC']),
          existingCustomer: random(['yes', 'no']),
          goToMarket: random(['direct', 'distributor']),
          productionBeerHlYear: randomInt(20000, 600000),
          productionPercent: randomInt(60, 100),
          confidencePercent: randomInt(70, 95),
          comments: `Entry for ${company.name} in ${country.name}`,
          status,
          finalized: status === 'finalized',
          approvalStatus: status === 'finalized' ? random(['pending', 'approved', 'rejected']) as any : 'pending',
          finalizedAt: status === 'finalized' ? new Date() : null,
        },
      })

        await createEnzymeValues(entry.id, dairyEnzymes)
      }
    }

    console.log(`✅ Created ${dairyUsers.length * 6} dairy entries`)
  }

  // Create entries for Cheese users
  const cheeseUsers = users.filter(u => u.email.includes('cheese'))
  let cheeseCycle = cycles.find(c => c.segmentId === cheese?.id)

  if (!cheeseCycle) {
    cheeseCycle = await prisma.cycle.create({
      data: {
        name: '2024 Q1',
        status: 'open',
        segmentId: cheese!.id,
        createdBy: admin!.id,
      },
    })
  }

  const cheeseEnzymes = enzymes.filter(e => e.businessSegmentId === cheese?.id)
  const cheeseProducts = productSegments.filter(s => s.businessSegmentId === cheese?.id)

  if (cheeseProducts.length === 0) {
    console.log('⚠️  No cheese products found, skipping cheese entries')
  } else {
    for (const user of cheeseUsers) {
      const entryCount = randomInt(5, 8)

      for (let i = 0; i < entryCount; i++) {
        const company = random(companies)
        const country = random(countries)
        const product = random(cheeseProducts)
        const status = random(statuses) as any

      const entry = await prisma.entry.create({
        data: {
          cycleId: cheeseCycle!.id,
          businessSegmentId: cheese!.id,
          accountManagerUserId: user.id,
          companyId: company.id,
          countryId: country.id,
          segmentId: product.id,
          subregion: random(['North', 'South', 'East', 'West']),
          region: random(['Americas', 'EMEA', 'APAC']),
          existingCustomer: random(['yes', 'no']),
          goToMarket: random(['direct', 'distributor']),
          productionBeerHlYear: randomInt(8000, 250000),
          productionPercent: randomInt(60, 100),
          confidencePercent: randomInt(70, 95),
          comments: `Entry for ${company.name} in ${country.name}`,
          status,
          finalized: status === 'finalized',
          approvalStatus: status === 'finalized' ? random(['pending', 'approved', 'rejected']) as any : 'pending',
          finalizedAt: status === 'finalized' ? new Date() : null,
        },
      })

        await createEnzymeValues(entry.id, cheeseEnzymes)
      }
    }

    console.log(`✅ Created ${cheeseUsers.length * 6} cheese entries`)
  }

  // Create audit logs for some entries
  const allEntries = await prisma.entry.findMany({ take: 20 })

  for (const entry of allEntries) {
    await prisma.auditLog.create({
      data: {
        entityType: 'entry',
        entityId: entry.id,
        action: entry.status === 'finalized' ? 'finalize' : 'update',
        changedBy: entry.accountManagerUserId,
        fieldName: 'status',
        oldValue: 'draft',
        newValue: entry.status,
      },
    })
  }

  console.log('✅ Created audit logs')

  // Count totals
  const totalEntries = await prisma.entry.count()
  const totalByStatus = await prisma.entry.groupBy({
    by: ['status'],
    _count: { id: true },
  })

  console.log('\n🎉 Data population complete!')
  console.log(`\n📊 Statistics:`)
  console.log(`Total Entries: ${totalEntries}`)
  totalByStatus.forEach(s => {
    console.log(`  ${s.status}: ${s._count.id}`)
  })
  console.log('\n✨ Your dashboard is now populated with realistic data!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
