import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse Excel/CSV
    const workbook = new ExcelJS.Workbook()

    if (file.name.endsWith('.csv')) {
      await workbook.csv.read(buffer)
    } else {
      await workbook.xlsx.load(buffer)
    }

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return NextResponse.json({ error: 'No worksheet found' }, { status: 400 })
    }

    // Get current open cycle
    const currentCycle = await prisma.cycle.findFirst({
      where: { status: 'open' },
    })

    if (!currentCycle) {
      return NextResponse.json({ error: 'No open cycle found' }, { status: 400 })
    }

    // Get all lookup data
    const [companies, countries, segments, distributors, enzymeCategories, plants] = await Promise.all([
      prisma.company.findMany(),
      prisma.country.findMany(),
      prisma.segment.findMany(),
      prisma.distributor.findMany(),
      prisma.enzymeCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.plant.findMany(),
    ])

    const results = {
      success: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Parse header row
    const headers: string[] = []
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString() || ''
    })

    // Helper function to find lookup value
    const findByName = (list: any[], name: string, field = 'name') => {
      if (!name) return null
      return list.find(item =>
        item[field]?.toLowerCase().trim() === name.toLowerCase().trim()
      )
    }

    // Process each row (skip header)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber)

      // Skip empty rows
      if (!row.hasValues) continue

      try {
        // Extract data from row
        const rowData: any = {}
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber]
          rowData[header] = cell.value
        })

        // Map to database fields
        const company = findByName(companies, rowData['Company'] || rowData['company'])
        const country = findByName(countries, rowData['Country'] || rowData['country'], 'countryName')
        const segment = findByName(segments, rowData['Segment'] || rowData['segment'])
        const plant = findByName(plants, rowData['Plant'] || rowData['plant'])

        if (!company || !country || !segment) {
          results.errors.push(`Row ${rowNumber}: Missing required lookup values (Company, Country, or Segment)`)
          results.skipped++
          continue
        }

        // Check for duplicate
        const existing = await prisma.entry.findFirst({
          where: {
            cycleId: currentCycle.id,
            companyId: company.id,
            countryId: country.id,
            segmentId: segment.id,
            plantId: plant?.id || null,
          },
        })

        if (existing) {
          results.errors.push(`Row ${rowNumber}: Entry already exists for ${company.name} - ${country.countryName} - ${segment.name}`)
          results.skipped++
          continue
        }

        // Find distributor if specified
        const distributorName = rowData['Distributor'] || rowData['distributor']
        const distributor = distributorName ? findByName(distributors, distributorName) : null

        // Create entry
        const entry = await prisma.entry.create({
          data: {
            cycleId: currentCycle.id,
            accountManagerUserId: session.user.id,
            companyId: company.id,
            countryId: country.id,
            region: country.region,
            subregion: country.subregion,
            plantId: plant?.id || null,
            segmentId: segment.id,
            existingCustomer: (rowData['Existing Customer'] || rowData['existingCustomer'] || 'no').toLowerCase(),
            goToMarket: (rowData['Go To Market'] || rowData['goToMarket'] || 'direct').toLowerCase(),
            distributorId: distributor?.id || null,
            productionBeerHlYear: parseFloat(rowData['Production (HL/year)'] || rowData['productionBeerHlYear'] || '0'),
            productionPercent: parseFloat(rowData['Production %'] || rowData['productionPercent'] || '0'),
            confidencePercent: parseFloat(rowData['Confidence %'] || rowData['confidencePercent'] || '0'),
            comments: rowData['Comments'] || rowData['comments'] || null,
            status: 'draft',
          },
        })

        // Create enzyme values
        for (const enzyme of enzymeCategories) {
          const penetration = parseFloat(rowData[`${enzyme.name} Penetration`] || '0')

          if (penetration > 0) {
            await prisma.entryEnzymeValue.create({
              data: {
                entryId: entry.id,
                enzymeCategoryId: enzyme.id,
                usageStatus: 'used',
                penetrationPercent: penetration,
                iffMarketSharePercent: parseFloat(rowData[`${enzyme.name} IFF %`] || '0'),
                novonesisMarketSharePercent: parseFloat(rowData[`${enzyme.name} Novonesis %`] || '0'),
                dsmMarketSharePercent: parseFloat(rowData[`${enzyme.name} DSM %`] || '0'),
                othersMarketSharePercent: parseFloat(rowData[`${enzyme.name} Others %`] || '0'),
                confirmed: true,
              },
            })
          }
        }

        results.success++
      } catch (error: any) {
        results.errors.push(`Row ${rowNumber}: ${error.message}`)
        results.skipped++
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Import complete: ${results.success} created, ${results.skipped} skipped`,
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import file', details: error.message },
      { status: 500 }
    )
  }
}
