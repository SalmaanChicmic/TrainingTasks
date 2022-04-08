import mongoose, { Schema } from "mongoose";

const MarksSchema = new Schema({
  studentId: Schema.Types.ObjectId,
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
