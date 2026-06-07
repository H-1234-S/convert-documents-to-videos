import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json({ exists: false })
  }
}
