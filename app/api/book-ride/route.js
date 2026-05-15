import { NextResponse } from "next/server";
import Ride from "@/models/Ride";
import { connectDB } from "@/lib/db";

export async function POST(req) {

  try {

    await connectDB();

    const body =
      await req.json();

    const {
      passengerName,
      passengerPhone,

      pickup,
      drop,

      pickupLat,
      pickupLon,

      dropLat,
      dropLon,

      distance,
      fare,
    } = body;

    // 🚫 VALIDATION
    if (
      !passengerName ||
      !passengerPhone ||
      !pickup ||
      !drop
    ) {

      return NextResponse.json(
        {
          message:
            "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    // 🚫 CHECK EXISTING ACTIVE RIDE
    const existingRide =
      await Ride.findOne({
        passengerPhone,

        status: {
          $in: [
            "searching",
            "accepted",
            "arriving",
            "pickedup",
          ],
        },
      });

    if (existingRide) {

      return NextResponse.json(
        {
          message:
            "You already have an active ride",
        },
        {
          status: 400,
        }
      );
    }

    // 🔐 GENERATE OTP
    const otp =
      Math.floor(
        1000 +
          Math.random() * 9000
      ).toString();

    // 🚕 CREATE RIDE
    const ride =
      await Ride.create({

        passengerName,
        passengerPhone,

        pickup,
        drop,

        pickupLat,
        pickupLon,

        dropLat,
        dropLon,

        distance,
        fare,

        otp,

        otpVerified: false,

        status: "searching",
      });

    return NextResponse.json({
      success: true,
      ride,
    });

  } catch (error) {

    console.log(
      "BOOK RIDE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Server error",
      },
      {
        status: 500,
      }
    );
  }
}