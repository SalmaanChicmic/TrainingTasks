import { openSync, readFileSync, writeFileSync } from "fs";
import { string } from "joi";
import { EmailOtp, Role, Student, Teacher } from "../interface/interface";
import { findUser, setEmailVerified } from "./password.jwt";

const studentDataPath = __dirname + "/../../data/student.json";
const teacherDataPath = __dirname + "/../../data/teachers.json";
const subjectDataPath = __dirname + "/../../data/subjects.json";
const otpDataPath = __dirname + "/../../data/otps.json";

export const openAndReadFile = (role: Role) => {
  if (role === "Student") {
    const studentFile = openSync(studentDataPath, "r+");
    const studentBuffer = readFileSync(studentFile, "utf-8");
    return JSON.parse(studentBuffer);
  }

  if (role === "Teacher") {
    const teacherFile = openSync(teacherDataPath, "r+");
    const teacherBuffer = readFileSync(teacherFile, "utf-8");
    return JSON.parse(teacherBuffer);
  }
};

export const writeUserDataToFile = (
  role: Role,
  existingData: Array<Student> | Array<Teacher>
): void => {
  if (role === "Student") {
    writeFileSync(studentDataPath, JSON.stringify(existingData));
  }

  if (role === "Teacher") {
    writeFileSync(teacherDataPath, JSON.stringify(existingData));
  }
};

export const writeOtpToFile = (emailnotp: EmailOtp) => {
  const otpFile = openSync(otpDataPath, "r+");
  const otpBuffer = readFileSync(otpFile, "utf-8");
  const otps = JSON.parse(otpBuffer);

  otps[emailnotp.email] = emailnotp.otp;

  writeFileSync(otpDataPath, JSON.stringify(otps));
};

export const matchOtpWithFile = (email: string, otp: string) => {
  const otpFile = openSync(otpDataPath, "r+");
  const otpBuffer = readFileSync(otpFile, "utf-8");
  const otps = JSON.parse(otpBuffer);

  if (otps[email] !== otp) return { status: 400, message: "Incorrect Otp." };

  return setEmailVerified(email);
};

export const writeNewPassword = (email: string, newPassword: string) => {};
