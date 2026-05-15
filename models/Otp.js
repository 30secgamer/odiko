import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  phone: String,
  otp: String,
  expiresAt: Date,
});

export default mongoose.models.Otp ||
  mongoose.model("Otp", OtpSchema);