import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { phone } = await req.json();

  if (!phone || phone.length !== 10) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  await connectDB();

  // 🔥 Remove old OTPs for same number
  await Otp.deleteMany({ phone });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.create({
    phone,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  console.log("OTP:", otp);

  return NextResponse.json({
  success: true,
  otp,
});
}