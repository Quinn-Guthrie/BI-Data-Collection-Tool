import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cycle = await prisma.cycle.findFirst({
      where: { status: 'open' },
    })

    if (!cycle) {
      return NextResponse.json(
        { error: 'No active cycle found' },
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
