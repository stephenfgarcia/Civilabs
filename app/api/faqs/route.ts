import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

/**
 * Get all FAQ categories with their FAQs
 * Returns active FAQs organized by category, ordered by display order
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all active FAQ categories with their FAQs
    const categories = await prisma.faqCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        faqs: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch FAQs',
      },
      { status: 500 }
    )
  }
}
