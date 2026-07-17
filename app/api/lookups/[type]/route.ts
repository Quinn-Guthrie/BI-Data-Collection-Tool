import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    const { searchParams } = new URL(request.url)
    const businessSegmentId = searchParams.get('businessSegmentId')

    let data
    switch (type) {
      case 'countries':
        // Shared across all segments
        data = await prisma.country.findMany({
          where: { active: true },
          orderBy: { countryName: 'asc' },
        })
        break
      case 'companies':
        // Shared across all segments
        data = await prisma.company.findMany({
          where: { active: true },
          orderBy: { name: 'asc' },
        })
        break
      case 'segments':
        // Product segments are segment-specific
        if (!businessSegmentId) {
          return NextResponse.json(
            { error: 'businessSegmentId is required for segments' },
            { status: 400 }
          )
        }
        data = await prisma.segment.findMany({
          where: {
            active: true,
            businessSegmentId,
          },
          orderBy: { name: 'asc' },
        })
        break
      case 'plants':
        // Shared across all segments
        data = await prisma.plant.findMany({
          where: { active: true },
          include: { country: true },
          orderBy: { name: 'asc' },
        })
        break
      case 'enzyme-categories':
        // Enzyme categories are segment-specific
        if (!businessSegmentId) {
          return NextResponse.json(
            { error: 'businessSegmentId is required for enzyme-categories' },
            { status: 400 }
          )
        }
        data = await prisma.enzymeCategory.findMany({
          where: {
            active: true,
            businessSegmentId,
          },
          orderBy: { sortOrder: 'asc' },
        })
        break
      case 'distributors':
        // Shared across all segments
        data = await prisma.distributor.findMany({
          where: { active: true },
          orderBy: { name: 'asc' },
        })
        break
      default:
        return NextResponse.json(
          { error: 'Invalid lookup type' },
          { status: 400 }
        )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lookup data' },
      { status: 500 }
    )
  }
}
