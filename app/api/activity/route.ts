import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const isAdmin = session.user.role === 'admin' || session.user.role === 'approver'

    // Build where clause based on role
    const where = isAdmin
      ? {} // Admins see all activity
      : { changedBy: session.user.id } // Users see only their own activity

    // Fetch activity logs
    const activities = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { changedAt: 'desc' },
      take: limit,
    })

    // Enhance activities with entity details
    const enhancedActivities = await Promise.all(
      activities.map(async (activity) => {
        let entityDetails = null

        if (activity.entityType === 'Entry') {
          const entry = await prisma.entry.findUnique({
            where: { id: activity.entityId },
            select: {
              id: true,
              company: { select: { name: true } },
              country: { select: { countryName: true } },
              segment: { select: { name: true } },
              status: true,
              approvalStatus: true,
            },
          })
          entityDetails = entry
        }

        return {
          ...activity,
          entityDetails,
        }
      })
    )

    return NextResponse.json(enhancedActivities)
  } catch (error: any) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity', details: error.message },
      { status: 500 }
    )
  }
}
