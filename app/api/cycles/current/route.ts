import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get Brewing segment (only active segment for data collection)
    const brewingSegment = await prisma.businessSegment.findFirst({
      where: { slug: 'brewing' }
    })

    if (!brewingSegment) {
      return NextResponse.json(
        { error: 'Brewing segment not found' },
        { status: 500 }
      )
    }

    // Get open cycle for Brewing segment only
    const cycle = await prisma.cycle.findFirst({
      where: {
        status: 'open',
        segmentId: brewingSegment.id,
      },
    })

    if (!cycle) {
      return NextResponse.json(
        { error: 'No active Brewing cycle found' },
        { status: 404 }
      )
    }

    return NextResponse.json(cycle)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cycle' },
      { status: 500 }
    )
  }
}
