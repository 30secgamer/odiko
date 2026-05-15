import { connectDB } from "@/lib/db";
import Driver from "@/models/Driver";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ GET CURRENT VALUE
    const driver = await Driver.findById(decoded.id).select("isOnline");

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    // 🔥 SIMPLE + SAFE TOGGLE
    const newStatus = !(driver.isOnline === true);

    driver.isOnline = newStatus;
    await driver.save();

    // ✅ ALWAYS RETURN BOOLEAN
    return NextResponse.json({
      success: true,
      isOnline: newStatus,
    });

  } catch (err) {
    console.log("Toggle Error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}