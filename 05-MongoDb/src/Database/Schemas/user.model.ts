import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  email: String,
  name: String,
  password: String,
  emailVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["Teacher", "Student"] },
});

export const UserModel = mongoose.model("user", UserSchema, "Users");
