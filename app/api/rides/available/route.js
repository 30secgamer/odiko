import { NextResponse } from "next/server";
import Ride from "@/models/Ride";
import { connectDB } from "@/lib/db";

export async function GET() {

  try {

    await connectDB();

    const rides = await Ride.find({
      status: "searching",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json(rides);

  } catch (error) {

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