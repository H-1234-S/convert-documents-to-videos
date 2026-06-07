import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token missing' }, { status: 400 })
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY

    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY not configured')
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    // 验证 Turnstile token
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    })

    const verifyData = await verifyResponse.json()

    if (verifyData.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Verification failed',
        codes: verifyData['error-codes']
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Captcha verification error:', error)
    return NextResponse.json({ success: false, error: 'Verification error' }, { status: 500 })
  }
}
