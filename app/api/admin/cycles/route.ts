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

    const cycles = await prisma.cycle.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { status: 'asc' },
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Cycle name is required' },
        { status: 400 }
      )
    }

    // Check if there's already an open cycle
    const existingOpenCycle = await prisma.cycle.findFirst({
      where: { status: 'open' },
    })

    if (existingOpenCycle) {
      return NextResponse.json(
        { error: 'There is already an open cycle. Lock it before creating a new one.' },
        { status: 400 }
      )
    }

    // Create new cycle
    const cycle = await prisma.cycle.create({
      data: {
        name,
        status: 'open',
        createdBy: session.user.id,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Cycle',
        entityId: cycle.id,
        action: 'created',
        changedBy: session.user.id,
        newValue: JSON.stringify({
          name: cycle.name,
          status: cycle.status,
          createdBy: session.user.email,
        }),
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Cycle created successfully',
        cycle,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating cycle:', error)
    return NextResponse.json(
      { error: 'Failed to create cycle' },
      { status: 500 }
    )
  }
}
