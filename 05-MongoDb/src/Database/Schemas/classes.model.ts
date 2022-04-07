import mongoose, { Schema } from "mongoose";

const ClassSchema = new Schema({
  teacher: Schema.Types.ObjectId,
});

export const ClassModel = mongoose.model("user", ClassSchema, "Users");
