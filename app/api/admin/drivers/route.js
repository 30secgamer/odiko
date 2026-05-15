import { connectDB } from "@/lib/db";
import Driver from "@/models/Driver";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const drivers = await Driver.find().sort({ createdAt: -1 });

  return NextResponse.json(drivers);
}