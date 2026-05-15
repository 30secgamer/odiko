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
      name,
      email,
      phone,
      password,
    } = body;

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return NextResponse.json(
        {
          message: "All fields required",
        },
        { status: 400 }
      );
    }

    const existingUser =
      await User.findOne({
        $or: [{ email }, { phone }],
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "User already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

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