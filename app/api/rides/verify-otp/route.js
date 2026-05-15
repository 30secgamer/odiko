import { NextResponse } from "next/server";
import Ride from "@/models/Ride";
import { connectDB } from "@/lib/db";

export async function POST(req) {

  try {

    await connectDB();

    const {
      rideId,
      otp,
    } = await req.json();

    // FIND RIDE
    const ride =
      await Ride.findById(rideId);

    // RIDE NOT FOUND
    if (!ride) {

      return NextResponse.json(
        {
          success: false,
          message: "Ride not found",
        },
        {
          status: 404,
        }
      );
    }

    // OTP CHECK
    if (
      String(ride.otp) !==
      String(otp)
    ) {

      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        {
          status: 400,
        }
      );
    }

    // OTP VERIFIED
    ride.otpVerified = true;

    // CHANGE STATUS
    ride.status = "pickedup";

    await ride.save();

    // SEND UPDATED RIDE
    return NextResponse.json({
      success: true,

      ride: {
        _id: ride._id,

        otpVerified:
          ride.otpVerified,

        status:
          ride.status,

        pickupLat:
          ride.pickupLat,

        pickupLon:
          ride.pickupLon,

        dropLat:
          ride.dropLat,

        dropLon:
          ride.dropLon,
      },
    });

  } catch (err) {

    console.log(err);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}