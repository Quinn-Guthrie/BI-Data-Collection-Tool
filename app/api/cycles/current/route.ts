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

    // Super admin sees all open cycles
    if (session.user.role === 'super_admin') {
      const cycles = await prisma.cycle.findMany({
        where: { status: 'open' },
        include: {
          businessSegment: true,
        },
      })

      return NextResponse.json(cycles)
    }

    // Regular users see cycles for their assigned segments
    const userSegments = await prisma.userSegment.findMany({
      where: { userId: session.user.id },
      select: { segmentId: true },
    })

    const segmentIds = userSegments.map(us => us.segmentId)

    const cycles = await prisma.cycle.findMany({
      where: {
        status: 'open',
        businessSegmentId: { in: segmentIds },
      },
      include: {
        businessSegment: true,
      },
    })

    return NextResponse.json(cycles)
  } catch (error) {
    console.error('Error fetching cycles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cycles' },
      { status: 500 }
    )
  }
}
