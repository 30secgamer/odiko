import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import Driver from "@/models/Driver";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {

  try {

    const { phone, otp } = await req.json();

    await connectDB();

    const record = await Otp.findOne({
      phone,
      otp,
    });

    if (
      !record ||
      record.expiresAt < new Date()
    ) {

      return NextResponse.json(
        {
          message: "Invalid OTP",
        },
        {
          status: 400,
        }
      );
    }

    let driver =
      await Driver.findOne({
        phone,
      });

    // ✅ CREATE DRIVER IF NEW
    if (!driver) {

      driver = await Driver.create({
        phone,
      });
    }

    // ✅ TOKEN
// ✅ TOKEN
const token = jwt.sign(
  { id: driver._id },
  process.env.JWT_SECRET,
  {
    expiresIn: "30d",
  }
);

    // ✅ CHECK ONBOARDING
    const onboardingCompleted =
      !!driver.name &&
      !!driver.profilePhoto &&
      !!driver.vehicleNumber;

    return NextResponse.json({
      token,
      onboardingCompleted,
    });

  } catch (err) {

    console.log(err);

    return NextResponse.json(
      {
        message: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}