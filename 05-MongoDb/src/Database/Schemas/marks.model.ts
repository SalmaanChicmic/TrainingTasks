import mongoose, { Schema } from "mongoose";

const MarksSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Users" },
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
