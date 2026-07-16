import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'approver'

    // Build where clause
    const where = isAdmin
      ? {}
      : { accountManagerUserId: session.user.id }

    // Get all entries for the user
    const entries = await prisma.entry.findMany({
      where,
      include: {
        country: true,
      },
    })

    const totalEntries = entries.length

    // Calculate by status
    const statusCounts: Record<string, number> = {}
    entries.forEach(e => {
      statusCounts[e.status] = (statusCounts[e.status] || 0) + 1
    })

    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0,
    }))

    // Calculate by approval status
    const approvalCounts: Record<string, number> = {}
    entries.forEach(e => {
      approvalCounts[e.approvalStatus] = (approvalCounts[e.approvalStatus] || 0) + 1
    })

    const byApproval = Object.entries(approvalCounts).map(([approval, count]) => ({
      approval,
      count,
      percentage: totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0,
    }))

    // Calculate by country
    const countryCounts: Record<string, number> = {}
    entries.forEach(e => {
      const countryName = e.country.countryName
      countryCounts[countryName] = (countryCounts[countryName] || 0) + 1
    })

    const byCountry = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)

    // Calculate confidence distribution
    const confidenceRanges = [
      { range: '80-100%', min: 80, max: 100, count: 0 },
      { range: '50-79%', min: 50, max: 79, count: 0 },
      { range: '0-49%', min: 0, max: 49, count: 0 },
    ]

    entries.forEach(e => {
      const confidence = e.confidencePercent || 0
      for (const range of confidenceRanges) {
        if (confidence >= range.min && confidence <= range.max) {
          range.count++
          break
        }
      }
    })

    const confidenceDistribution = confidenceRanges.map(({ range, count }) => ({
      range,
      count,
    }))

    return NextResponse.json({
      byStatus,
      byApproval,
      byCountry,
      confidenceDistribution,
      totalEntries,
    })
  } catch (error: any) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data', details: error.message },
      { status: 500 }
    )
  }
}
