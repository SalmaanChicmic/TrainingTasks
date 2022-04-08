import Joi from "joi";

const subjects = [
  "english",
  "hindi",
  "computers",
  "maths",
  "science",
  "physical",
];

const passwordRegex =
  /^(?=.{6,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

export const teacherSignupSchema = Joi.object().keys({
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(5).max(15).regex(passwordRegex).required(),
  email: Joi.string().min(3).required().email(),
  subject: Joi.string()
    .valid(...subjects)
    .required(),
});

export const studentSignupSchema = Joi.object().keys({
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(5).max(15).regex(passwordRegex).required(),
  email: Joi.string().min(3).required().email(),
});

export const marks = Joi.object().keys({
  english: Joi.number().min(0).max(100).integer(),
  hindi: Joi.number().min(0).max(100).integer(),
  computers: Joi.number().min(0).max(100).integer(),
  maths: Joi.number().min(0).max(100).integer(),
  science: Joi.number().min(0).max(100).integer(),
  physical: Joi.number().min(0).max(100).integer(),
});

export const giveMarksSchema = Joi.object().keys({
  id: Joi.string(),
  marks: marks.required(),
});

export const loginSchema = Joi.object().keys({
  email: Joi.string().min(3).required().email(),
  password: Joi.string().min(5).max(15).regex(passwordRegex).required(),
});

export const otpSchema = Joi.object().keys({
  email: Joi.string().min(3).required().email(),
  otp: Joi.string().length(6),
});

export const addToClassSchema = Joi.object().keys({
  studentEmail: Joi.string().min(3).required().email(),
  teacherEmail: Joi.string().min(3).required().email(),
  subject: Joi.string()
    .valid(...subjects)
    .required(),
});

export const removeStudentFromClassSchema = Joi.object().keys({
  email: Joi.string().min(3).required().email(),
  subject: Joi.string()
    .valid(...subjects)
    .required(),
});

export const subjectSchema = Joi.object().keys({
  subject: Joi.string()
    .valid(...subjects)
    .required(),
});
