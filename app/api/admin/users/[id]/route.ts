import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        userSegments: {
          include: {
            segment: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, role, segments } = body

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    if (!segments || segments.length === 0) {
      return NextResponse.json(
        { error: 'At least one business segment must be selected' },
        { status: 400 }
      )
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email: email.toLowerCase(),
        role: role === 'super_admin' ? user.role : role, // Prevent changing super_admin role
      },
    })

    // Update segments - delete old, create new
    await prisma.userSegment.deleteMany({
      where: { userId: id },
    })

    await prisma.userSegment.createMany({
      data: segments.map((segmentId: string) => ({
        userId: id,
        segmentId,
        role: 'account_manager',
        assignedBy: session.user.id,
      })),
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'User',
        entityId: user.id,
        action: 'updated',
        changedBy: session.user.id,
        newValue: JSON.stringify({
          name,
          email,
          role,
          segments: segments.length,
          updatedBy: session.user.email,
        }),
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { active } = body

    const user = await prisma.user.update({
      where: { id },
      data: { active },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'User',
        entityId: user.id,
        action: 'updated',
        changedBy: session.user.id,
        newValue: JSON.stringify({
          active,
          updatedBy: session.user.email,
        }),
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if user has entries
    const entryCount = await prisma.entry.count({
      where: { accountManagerUserId: id },
    })

    if (entryCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete user with ${entryCount} entries. Deactivate instead.` },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'User',
        entityId: id,
        action: 'deleted',
        changedBy: session.user.id,
        oldValue: JSON.stringify({ deletedBy: session.user.email }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
