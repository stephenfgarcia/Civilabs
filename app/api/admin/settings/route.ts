/**
 * Admin Settings API Routes
 * GET /api/admin/settings - Get platform settings
 * PUT /api/admin/settings - Update platform settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAdmin } from '@/lib/auth/api-auth'

const SETTINGS_ID = 'settings' // Singleton ID

/**
 * GET /api/admin/settings
 * Get platform settings
 */
export const GET = withAdmin(async (request, user) => {
  try {
    // Get or create settings (singleton pattern)
    let settings = await prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
    })

    // If settings don't exist yet, create with defaults
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: SETTINGS_ID,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/admin/settings
 * Update platform settings
 */
export const PUT = withAdmin(async (request, user) => {
  try {
    const body = await request.json()

    // Build update data object with only provided fields
    const updateData: any = {}

    // General Settings
    if (body.siteName !== undefined) updateData.siteName = body.siteName
    if (body.siteUrl !== undefined) updateData.siteUrl = body.siteUrl
    if (body.adminEmail !== undefined) updateData.adminEmail = body.adminEmail
    if (body.timezone !== undefined) updateData.timezone = body.timezone

    // Email Settings
    if (body.smtpHost !== undefined) updateData.smtpHost = body.smtpHost
    if (body.smtpPort !== undefined) updateData.smtpPort = body.smtpPort
    if (body.smtpUser !== undefined) updateData.smtpUser = body.smtpUser
    if (body.fromEmail !== undefined) updateData.fromEmail = body.fromEmail

    // Security Settings
    if (body.sessionTimeout !== undefined) updateData.sessionTimeout = body.sessionTimeout
    if (body.passwordMinLength !== undefined)
      updateData.passwordMinLength = body.passwordMinLength

    // Notification Settings
    if (body.emailNotifications !== undefined)
      updateData.emailNotifications = body.emailNotifications
    if (body.smsNotifications !== undefined)
      updateData.smsNotifications = body.smsNotifications

    // Upsert settings (create if doesn't exist, update if it does)
    const settings = await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: updateData,
      create: {
        id: SETTINGS_ID,
        ...updateData,
      },
    })

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
