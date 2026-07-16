import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, rejectionEmailTemplate, approvalEmailTemplate } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { entryIds, action, reason } = body

    if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json({ error: 'No entries selected' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Process each entry
    for (const entryId of entryIds) {
      try {
        const entry = await prisma.entry.update({
          where: { id: entryId },
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
            entryId,
            approvedBy: session.user.id,
            status: action === 'approve' ? 'approved' : 'rejected',
            comments: reason || null,
          },
        })

        // Create audit log
        await prisma.auditLog.create({
          data: {
            entityType: 'Entry',
            entityId: entryId,
            action: action === 'approve' ? 'approved' : 'rejected',
            changedBy: session.user.id,
            newValue: JSON.stringify({
              approvalStatus: action === 'approve' ? 'approved' : 'rejected',
              reason: reason || null,
            }),
          },
        })

        // Send email notification
        const entryName = `${entry.company.name} - ${entry.country.countryName} - ${entry.segment.name}`
        const editUrl = `${baseUrl}/dashboard/entries/${entryId}/edit`

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

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(`Entry ${entryId}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Bulk ${action}: ${results.success} successful, ${results.failed} failed`,
    })
  } catch (error: any) {
    console.error('Bulk approval error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk action', details: error.message },
      { status: 500 }
    )
  }
}
