import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, rejectionEmailTemplate, approvalEmailTemplate } from '@/lib/email'

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
    const body = await request.json()
    const { action, reason } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: {
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        status: action === 'reject' ? 'needs_correction' : undefined,
        rejectionReason: action === 'reject' ? reason : null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
      include: {
        accountManager: true,
        company: true,
        country: true,
        segment: true,
      },
    })

    // Create approval record
    await prisma.entryApproval.create({
      data: {
        entryId: id,
        approvedBy: session.user.id,
        status: action === 'approve' ? 'approved' : 'rejected',
        comments: reason || null,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Entry',
        entityId: id,
        action: action === 'approve' ? 'approved' : 'rejected',
        changedBy: session.user.id,
        newValue: JSON.stringify({
          approvalStatus: entry.approvalStatus,
          reason: reason || null,
          reviewedBy: session.user.email,
        }),
      },
    })

    // Send email notification
    const entryName = `${entry.company.name} - ${entry.country.countryName} - ${entry.segment.name}`
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const editUrl = `${baseUrl}/dashboard/entries/${id}/edit`

    if (action === 'reject' && reason) {
      const emailContent = rejectionEmailTemplate({
        userName: entry.accountManager.name,
        entryName,
        reason,
        editUrl,
      })

      await sendEmail({
        to: entry.accountManager.email,
        subject: `Entry Rejected: ${entryName}`,
        html: emailContent.html,
        text: emailContent.text,
      })
    } else if (action === 'approve') {
      const emailContent = approvalEmailTemplate({
        userName: entry.accountManager.name,
        entryName,
      })

      await sendEmail({
        to: entry.accountManager.email,
        subject: `Entry Approved: ${entryName}`,
        html: emailContent.html,
        text: emailContent.text,
      })
    }

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    )
  }
}
