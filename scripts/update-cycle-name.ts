import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating cycle name...')

  const result = await prisma.cycle.updateMany({
    where: {
      name: '2026 Annual - Brewing',
    },
    data: {
      name: '2026 Annual',
    },
  })

  console.log(`✅ Updated ${result.count} cycle(s)`)
  console.log('Cycle name changed from "2026 Annual - Brewing" to "2026 Annual"')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
