import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, callbackURL } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
      },
    })

    // In a real app, you would send an email here
    // For now, we'll just return success
    console.log(`Verification email would be sent to ${email}`)
    console.log(`Verification link: ${callbackURL}?token=${verificationToken}`)

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
      // In development, return the token for testing
      ...(process.env.NODE_ENV === "development" && {
        token: verificationToken,
        verificationLink: `${callbackURL}?token=${verificationToken}`
      }),
    })
  } catch (error) {
    console.error("Send verification email error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}