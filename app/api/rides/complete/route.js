import { NextResponse } from "next/server";
import Ride from "@/models/Ride";
import Driver from "@/models/Driver";
import { connectDB } from "@/lib/db";

export async function POST(req) {

  try {

    await connectDB();

    const { rideId } =
      await req.json();

    const ride =
      await Ride.findById(rideId);

    if (!ride) {

      return NextResponse.json(
        {
          message: "Ride not found",
        },
        {
          status: 404,
        }
      );
    }

    ride.status = "completed";

    await ride.save();

    // ✅ UPDATE DRIVER
    await Driver.findByIdAndUpdate(
      ride.driverId,
      {
        $inc: {
          totalRides: 1,
          totalEarnings: ride.fare,
        },
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