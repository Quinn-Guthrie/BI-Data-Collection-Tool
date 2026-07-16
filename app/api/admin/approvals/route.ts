import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'pending'

    // Build where clause
    let whereClause: any = {
      finalized: true,
    }

    if (statusParam === 'pending') {
      // Show both pending AND submitted in pending tab
      whereClause.approvalStatus = { in: ['pending', 'submitted'] }
    } else if (statusParam === 'approved') {
      whereClause.approvalStatus = 'approved'
    } else if (statusParam === 'rejected') {
      whereClause.approvalStatus = 'rejected'
    }

    const entries = await prisma.entry.findMany({
      where: whereClause,
      include: {
        company: { select: { name: true } },
        country: { select: { countryName: true } },
        segment: { select: { name: true } },
        plant: { select: { name: true } },
        accountManager: { select: { name: true, email: true } },
      },
      orderBy: { finalizedAt: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching approvals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}
