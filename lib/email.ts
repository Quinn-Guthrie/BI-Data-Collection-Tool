// Email service for sending notifications
// Supports multiple providers: Resend, SendGrid, or console logging for development

type EmailOptions = {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text } = options

  // Check if email service is configured
  const emailProvider = process.env.EMAIL_PROVIDER || 'console' // 'resend', 'sendgrid', or 'console'

  if (emailProvider === 'console') {
    // Development mode - just log emails
    console.log('📧 Email (DEV MODE):')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${text || html}`)
    console.log('---')
    return { success: true, provider: 'console' }
  }

  // Resend provider
  if (emailProvider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'noreply@example.com',
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Resend API error:', error)
        return { success: false, error: error.message }
      }

      const data = await response.json()
      return { success: true, provider: 'resend', id: data.id }
    } catch (error: any) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }
  }

  // SendGrid provider
  if (emailProvider === 'sendgrid') {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      console.error('SENDGRID_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.EMAIL_FROM || 'noreply@example.com' },
          subject,
          content: [
            { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') },
            { type: 'text/html', value: html },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('SendGrid API error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, provider: 'sendgrid' }
    } catch (error: any) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }
  }

  return { success: false, error: 'Unknown email provider' }
}

// Email templates

export function rejectionEmailTemplate(data: {
  userName: string
  entryName: string
  reason: string
  editUrl: string
}) {
  const { userName, entryName, reason, editUrl } = data

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .reason-box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Entry Rejected</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>

          <p>Your entry has been reviewed and requires correction before it can be approved.</p>

          <p><strong>Entry:</strong> ${entryName}</p>

          <div class="reason-box">
            <strong>Rejection Reason:</strong><br/>
            ${reason}
          </div>

          <p>Please review the feedback above and make the necessary corrections to your entry.</p>

          <a href="${editUrl}" class="button">Edit Entry Now</a>

          <p>If you have any questions, please contact your administrator.</p>

          <p>Best regards,<br/>Brewing Sales Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email from the Brewing Sales Exercise platform.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Entry Rejected

Hi ${userName},

Your entry has been reviewed and requires correction before it can be approved.

Entry: ${entryName}

Rejection Reason:
${reason}

Please review the feedback above and make the necessary corrections to your entry.

Edit your entry: ${editUrl}

If you have any questions, please contact your administrator.

Best regards,
Brewing Sales Team
  `

  return { html, text }
}

export function approvalEmailTemplate(data: {
  userName: string
  entryName: string
}) {
  const { userName, entryName } = data

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Entry Approved</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>

          <p>Great news! Your entry has been reviewed and approved.</p>

          <div class="success-box">
            <strong>Approved Entry:</strong><br/>
            ${entryName}
          </div>

          <p>Thank you for your submission. No further action is required for this entry.</p>

          <p>Best regards,<br/>Brewing Sales Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email from the Brewing Sales Exercise platform.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Entry Approved

Hi ${userName},

Great news! Your entry has been reviewed and approved.

Approved Entry: ${entryName}

Thank you for your submission. No further action is required for this entry.

Best regards,
Brewing Sales Team
  `

  return { html, text }
}
