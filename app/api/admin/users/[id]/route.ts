import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
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

    if (!session || session.user.role !== 'admin') {
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
