import { NextResponse } from "next/server";
import Ride from "@/models/Ride";
import { connectDB } from "@/lib/db";

export async function POST(req) {

  try {

    await connectDB();

    const {
      passengerPhone,
    } = await req.json();

    const ride =
      await Ride.findOne({

        passengerPhone,

        status: {
          $in: [
            "searching",
            "accepted",
            "ongoing",
          ],
        },

      }).sort({
        createdAt: -1,
      });

    // ✅ NO ACTIVE RIDE
    if (!ride) {

      return NextResponse.json(
        null
      );
    }

    return NextResponse.json(
      ride
    );

  } catch (error) {

    console.log(error);

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