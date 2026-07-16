import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Lock the cycle
    const cycle = await prisma.cycle.update({
      where: { id },
      data: {
        status: 'locked',
        lockedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Cycle',
        entityId: cycle.id,
        action: 'locked',
        changedBy: session.user.id,
        newValue: JSON.stringify({
          status: 'locked',
          lockedAt: cycle.lockedAt,
          lockedBy: session.user.email,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Cycle locked successfully',
      cycle,
    })
  } catch (error) {
    console.error('Error locking cycle:', error)
    return NextResponse.json(
      { error: 'Failed to lock cycle' },
      { status: 500 }
    )
  }
}
