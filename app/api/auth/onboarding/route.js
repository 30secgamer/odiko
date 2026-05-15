import { connectDB } from "@/lib/db";
import Driver from "@/models/Driver";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const formData = await req.formData();

  const validateFile = (file, name) => {
    if (!file) throw new Error(`${name} required`);
    if (!file.type.startsWith("image/")) throw new Error(`${name} must be image`);
    if (file.size > 2 * 1024 * 1024) throw new Error(`${name} max 2MB`);
  };

  try {
    validateFile(formData.get("profile"), "Profile photo");
    validateFile(formData.get("license"), "License");
    validateFile(formData.get("aadhaar"), "Aadhaar");
    validateFile(formData.get("rc"), "RC");
    validateFile(formData.get("insurance"), "Insurance");
    validateFile(formData.get("selfie"), "Selfie");

    const upload = async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return new Promise((res, rej) => {
        cloudinary.uploader.upload_stream(
          { folder: "odiko_drivers" },
          (err, result) => {
            if (err) rej(err);
            else res(result.secure_url);
          }
        ).end(buffer);
      });
    };

    const data = {
      name: formData.get("name"),
      vehicleNumber: formData.get("vehicleNumber"),
      profilePhoto: await upload(formData.get("profile")),
      license: await upload(formData.get("license")),
      aadhaar: await upload(formData.get("aadhaar")),
      rc: await upload(formData.get("rc")),
      insurance: await upload(formData.get("insurance")),
      selfie: await upload(formData.get("selfie")),
      status: "pending",
    };

    await Driver.findByIdAndUpdate(decoded.id, data);

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 400 }
    );
  }
}