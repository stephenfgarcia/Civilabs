/**
 * Generate API Key Endpoint
 * POST /api/admin/settings/generate-api-key - Generate a new API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/auth/api-auth'
import { randomBytes } from 'crypto'

/**
 * POST /api/admin/settings/generate-api-key
 * Generate a new API key
 */
export const POST = withAdmin(async (request, user) => {
  try {
    // Generate a secure random API key
    // Format: civilabs_live_[32 random hex characters]
    const randomPart = randomBytes(32).toString('hex')
    const apiKey = `civilabs_live_${randomPart}`

    return NextResponse.json({
      success: true,
      data: {
        apiKey,
      },
      message: 'API key generated successfully',
    })
  } catch (error) {
    console.error('Error generating API key:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate API key',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
