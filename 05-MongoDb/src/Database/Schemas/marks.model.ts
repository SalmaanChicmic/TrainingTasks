import mongoose, { Schema } from "mongoose";

const MarksSchema = new Schema({
  marks: {
    english: Number,
    hindi: Number,
    computers: Number,
    maths: Number,
    science: Number,
    physical: Number,
  },
});

export const MarksModel = mongoose.model("marks", MarksSchema, "Marks");
