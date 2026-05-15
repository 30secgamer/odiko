import { connectDB } from "@/lib/db";
import Driver from "@/models/Driver";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
        
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ IMPORTANT: use lean (faster + stable)
    const driver = await Driver.findById(decoded.id)
      .select(
        "name profilePhoto status vehicleNumber isOnline totalEarnings rating totalRides license aadhaar rc insurance rejectionReason"
      )
      .lean();

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    // ✅ FORCE BOOLEAN (VERY IMPORTANT FOR YOUR UI)
    return NextResponse.json(
      {
         _id: driver._id,
        name: driver.name || "",
        profilePhoto: driver.profilePhoto || "",
        status: driver.status || "pending",
        vehicleNumber: driver.vehicleNumber || "",

        isOnline: driver.isOnline === true, // 🔥 key fix

        totalEarnings: driver.totalEarnings || 0,
        rating: driver.rating || 5.0,
        totalRides: driver.totalRides || 0,

        license: driver.license || "",
        aadhaar: driver.aadhaar || "",
        rc: driver.rc || "",
        insurance: driver.insurance || "",

        rejectionReason: driver.rejectionReason || "",
      },
      { status: 200 }
    );

  } catch (err) {
    console.log("Dashboard Error:", err);

    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }
}