/**
 * Test Email Endpoint
 * POST /api/admin/settings/test-email - Send a test email
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/auth/api-auth'
import nodemailer from 'nodemailer'

/**
 * POST /api/admin/settings/test-email
 * Send a test email using the configured SMTP settings
 */
export const POST = withAdmin(async (request, user) => {
  try {
    const body = await request.json()
    const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, testEmail } = body

    // Validate required fields
    if (!smtpHost || !smtpPort || !fromEmail || !testEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required email configuration',
        },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
      auth: smtpUser && smtpPassword ? {
        user: smtpUser,
        pass: smtpPassword,
      } : undefined,
    })

    // Verify connection
    await transporter.verify()

    // Send test email
    const info = await transporter.sendMail({
      from: fromEmail,
      to: testEmail,
      subject: 'Test Email from Civilabs LMS',
      text: 'This is a test email to verify your SMTP configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #0891b2;">Email Configuration Test</h2>
          <p>This is a test email from Civilabs LMS.</p>
          <p>If you're receiving this email, your SMTP configuration is working correctly!</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">
            Sent from Civilabs LMS Admin Settings
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      },
      message: `Test email sent successfully to ${testEmail}`,
    })
  } catch (error) {
    console.error('Error sending test email:', error)

    let errorMessage = 'Failed to send test email'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        message: errorMessage,
      },
      { status: 500 }
    )
  }
})
