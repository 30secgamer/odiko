import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      email,
      password,
    } = body;

    const user =
      await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return NextResponse.json(
        {
          message: "Wrong password",
        },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return NextResponse.json({
      token,
      user,
    });

  } catch (err) {
    console.log(err);

    return NextResponse.json(
      {
        message: "Server error",
      },
      { status: 500 }
    );
  }
}