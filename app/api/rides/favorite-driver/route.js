import { NextResponse }
from "next/server";

import { connectDB }
from "@/lib/db";

import FavoriteDriver
from "@/models/FavoriteDriver";

export async function POST(req) {

  try {

    await connectDB();

    const {
      passengerPhone,
      driverId,
      favorite,
    } = await req.json();

    // 🚫 REMOVE OLD
    await FavoriteDriver.deleteMany({
      passengerPhone,
    });

    // ✅ SAVE NEW
    if (favorite) {

      await FavoriteDriver.create({
        passengerPhone,
        driverId,
      });

    }

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.log(err);

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