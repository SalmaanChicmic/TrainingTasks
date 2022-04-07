import mongoose, { Schema } from "mongoose";

const OtpSchema = new Schema({
  email: String,
  otp: Number,
});

export const OtpModel = mongoose.model("otp", OtpSchema, "Otps");
