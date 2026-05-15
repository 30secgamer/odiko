import { NextResponse } from "next/server";
import Ride from "@/models/Ride";
import { connectDB } from "@/lib/db";

export async function POST(req) {

  try {

    await connectDB();

    const { driverId } =
      await req.json();

    const ride = await Ride.findOne({
      driverId,

      status: {
  $in: [
    "accepted",
    "arriving",
    "pickedup",
    "reached_drop",
  ],
},
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      ride || null
    );

  } catch {

    return NextResponse.json(
      null
    );
  }
}