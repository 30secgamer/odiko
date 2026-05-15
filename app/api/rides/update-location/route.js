import { NextResponse } from "next/server";
import Ride from "@/models/Ride";
import { connectDB } from "@/lib/db";

function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

export async function POST(req) {

  try {

    await connectDB();

    const {
      rideId,
      lat,
      lon,
    } = await req.json();

    const ride =
      await Ride.findById(rideId);

    if (!ride) {

      return NextResponse.json(
        {
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    let status = ride.status;

    // 🚖 BEFORE OTP
    if (!ride.otpVerified) {

      const pickupDistance =
        calculateDistance(
          lat,
          lon,
          ride.pickupLat,
          ride.pickupLon
        );

      if (pickupDistance < 0.1) {
        status = "arriving";
      }
    }

    // 🚖 AFTER OTP
    if (ride.otpVerified) {

      const dropDistance =
        calculateDistance(
          lat,
          lon,
          ride.dropLat,
          ride.dropLon
        );

      if (dropDistance < 0.1) {
        status = "reached_drop";
      } else {
        status = "pickedup";
      }
    }

    await Ride.findByIdAndUpdate(
      rideId,
      {
        driverLat: lat,
        driverLon: lon,
        status,
      }
    );

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.log(err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}