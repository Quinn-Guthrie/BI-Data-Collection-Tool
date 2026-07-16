import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params

    let data
    switch (type) {
      case 'countries':
        data = await prisma.country.findMany({
          where: { active: true },
          orderBy: { countryName: 'asc' },
        })
        break
      case 'companies':
        data = await prisma.company.findMany({
          where: { active: true },
          orderBy: { name: 'asc' },
        })
        break
      case 'segments':
        data = await prisma.segment.findMany({
          where: { active: true },
          orderBy: { name: 'asc' },
        })
        break
      case 'plants':
        data = await prisma.plant.findMany({
          where: { active: true },
          include: { country: true },
          orderBy: { name: 'asc' },
        })
        break
      case 'enzyme-categories':
        data = await prisma.enzymeCategory.findMany({
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
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
