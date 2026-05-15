import { connectDB } from "@/lib/db";
import Driver from "@/models/Driver";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  const { id, action, reason } = await req.json();

  if (action === "approve") {
    await Driver.findByIdAndUpdate(id, {
      status: "approved",
      rejectionReason: "",
    });
  }

  if (action === "reject") {
    await Driver.findByIdAndUpdate(id, {
      status: "rejected",
      rejectionReason: reason || "Invalid documents",
    });
  }

  return NextResponse.json({ success: true });
}