import { openSync, readFileSync, writeFileSync } from "fs";
import {
  EmailOtp,
  Marks,
  Role,
  Student,
  Teacher,
} from "../interface/interface";
import { findUser, setEmailVerified } from "./password.jwt";

const studentDataPath = __dirname + "/../../data/student.json";
const teacherDataPath = __dirname + "/../../data/teachers.json";
const subjectDataPath = __dirname + "/../../data/subjects.json";
const otpDataPath = __dirname + "/../../data/otps.json";
const classesDataPath = __dirname + "/../../data/classes.json";

export const subjects: Array<string> = Object.keys(
  JSON.parse(readFileSync(classesDataPath, "utf-8"))
);

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

export const writeStudentToClass = (email: string, subject: string) => {
  const classesFD = openSync(classesDataPath, "r+");
  const classBuffer = readFileSync(classesFD, "utf-8");
  const classes = JSON.parse(classBuffer);

  if (classes[subject][email] === undefined) {
    classes[subject][email] = null;
    writeFileSync(classesDataPath, JSON.stringify(classes));
  }
};

export const deleteStudentFromClass = (email: string, subject: string) => {
  const classesFD = openSync(classesDataPath, "r+");
  const classBuffer = readFileSync(classesFD, "utf-8");
  const classes = JSON.parse(classBuffer);

  if (delete classes[subject][email])
    writeFileSync(classesDataPath, JSON.stringify(classes));
};

export const readStudentsFromClass = (subject: string) => {
  const classesFD = openSync(classesDataPath, "r+");
  const classBuffer = readFileSync(classesFD, "utf-8");
  const classes = JSON.parse(classBuffer);

  return classes[subject];
};

export const writeMarksToClasses = (email: string, marks: Marks) => {
  const classesFD = openSync(classesDataPath, "r+");
  const classBuffer = readFileSync(classesFD, "utf-8");
  const classes = JSON.parse(classBuffer);

  const subjects = Object.keys(marks);

  console.log(
    "SUB",
    subjects,
    "CKASS",
    classes,
    "EMAIL",
    email,
    "MAKRS ",
    marks
  );

  subjects.forEach((subject) => {
    if (classes[subject][email] !== undefined) {
      //@ts-ignore
      classes[subject][email] = marks[subject];
    }
  });

  writeFileSync(classesDataPath, JSON.stringify(classes));
};

export const getAllClasses = (email: string): Array<Marks> => {
  const classesFD = openSync(classesDataPath, "r+");
  const classBuffer = readFileSync(classesFD, "utf-8");
  const classes = JSON.parse(classBuffer);

  const studentMarksData: Array<Marks> = [];

  Object.keys(classes).forEach((subject) => {
    if (classes[subject][email] !== undefined) {
      studentMarksData.push({
        // @ts-ignore
        [subject]: classes[subject][email],
      });
    }
  });

  return studentMarksData;
};
