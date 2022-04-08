import mongoose, { Schema } from "mongoose";

const ClassSchema = new Schema({
  teacher: String,
  students: [String],
  subject: String,
});

export const ClassModel = mongoose.model("class", ClassSchema, "Classes");
