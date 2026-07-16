import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cycleId = searchParams.get('cycleId')

    if (!cycleId) {
      return NextResponse.json(
        { error: 'Cycle ID is required' },
        { status: 400 }
      )
    }

    // Get cycle info
    const cycle = await prisma.cycle.findUnique({
      where: { id: cycleId },
    })

    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 })
    }

    // Get all entries with related data
    const entries = await prisma.entry.findMany({
      where: { cycleId },
      include: {
        plant: true,
        company: true,
        country: true,
        segment: true,
        accountManager: {
          select: { name: true, email: true },
        },
        enzymeValues: {
          include: {
            enzymeCategory: true,
          },
        },
      },
      orderBy: [
        { company: { name: 'asc' } },
        { country: { countryName: 'asc' } },
      ],
    })

    // Get all enzyme categories for column headers
    const enzymeCategories = await prisma.enzymeCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })

    // Build CSV
    const headers = [
      'Entry ID',
      'Account Manager',
      'Plant Name',
      'Plant Code',
      'Company',
      'Country',
      'Region',
      'Subregion',
      'Existing Customer',
      'Go-to-Market',
      'Production (HL/year)',
      'Segment',
      'Production %',
    ]

    // Add enzyme columns
    enzymeCategories.forEach((enzyme) => {
      headers.push(
        `${enzyme.name} - Usage Status`,
        `${enzyme.name} - Penetration %`,
        `${enzyme.name} - IFF %`,
        `${enzyme.name} - Novonesis %`,
        `${enzyme.name} - DSM %`,
        `${enzyme.name} - Others %`
      )
    })

    headers.push(
      'Confidence %',
      'Comments',
      'Status',
      'Approval Status',
      'Finalized',
      'Created At',
      'Finalized At'
    )

    const rows = [headers]

    // Build data rows
    for (const entry of entries) {
      const row = [
        entry.id,
        entry.accountManager?.name || '',
        entry.plant?.name || '',
        entry.plant?.code || '',
        entry.company?.name || '',
        entry.country?.countryName || '',
        entry.region || '',
        entry.subregion || '',
        entry.existingCustomer || '',
        entry.goToMarket || '',
        entry.productionBeerHlYear !== null ? entry.productionBeerHlYear.toString() : '',
        entry.segment?.name || '',
        entry.productionPercent !== null ? entry.productionPercent.toString() : '',
      ]

      // Add enzyme data
      enzymeCategories.forEach((enzyme) => {
        const enzymeValue = entry.enzymeValues.find(
          (ev) => ev.enzymeCategoryId === enzyme.id
        )

        if (enzymeValue) {
          row.push(
            enzymeValue.usageStatus || '',
            enzymeValue.penetrationPercent !== null ? enzymeValue.penetrationPercent.toString() : '',
            enzymeValue.iffMarketSharePercent !== null ? enzymeValue.iffMarketSharePercent.toString() : '',
            enzymeValue.novonesisMarketSharePercent !== null ? enzymeValue.novonesisMarketSharePercent.toString() : '',
            enzymeValue.dsmMarketSharePercent !== null ? enzymeValue.dsmMarketSharePercent.toString() : '',
            enzymeValue.othersMarketSharePercent !== null ? enzymeValue.othersMarketSharePercent.toString() : ''
          )
        } else {
          row.push('', '', '', '', '', '')
        }
      })

      row.push(
        entry.confidencePercent !== null ? entry.confidencePercent.toString() : '',
        entry.comments || '',
        entry.status || '',
        entry.approvalStatus || '',
        entry.finalized ? 'Yes' : 'No',
        entry.createdAt.toISOString(),
        entry.finalizedAt ? entry.finalizedAt.toISOString() : ''
      )

      rows.push(row)
    }

    // Convert to CSV string
    const csvContent = rows
      .map((row) =>
        row.map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      )
      .join('\n')

    // Create filename
    const filename = `brewing_sales_${cycle.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
