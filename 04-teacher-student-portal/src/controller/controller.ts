import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {
  Marks,
  Role,
  ServerResponse,
  Student,
  Teacher,
  UserSignIn,
  UserSignUp,
} from "../interface/interface";
import jwt, { Jwt } from "jsonwebtoken";
import process from "../../config";
import { NextFunction } from "express";
import { openAndReadFile, writeUserDataToFile } from "../utils/utils.fs";

export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    res.status(400).send("Access Token Not Present");
  } else {
    const token: string = req.headers.authorization.split(" ")[1];
    try {
      const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);

      req.body.user = {
        ...req.body.user,
        ...(data as jwt.JwtPayload),
      };

      next();
    } catch (err) {
      console.log(err);
      res.status(403).json({ status: 403, message: "Not Authorized" });
    }
  }
};

export const onlyTeacher = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const role: Role = req.body.user.role;
  if (role === "Teacher") {
    next();
  } else {
    res
      .status(403)
      .json({ status: 403, message: "This route is only for teachers" });
  }
};

export const addUser = async (
  role: Role,
  user: UserSignUp
): Promise<ServerResponse> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  user.password = hashedPassword;

  const existingData: Array<Student> | Array<Teacher> = openAndReadFile(role);

  const userAlreadyExits = existingData.find(
    (item) => item.email === user.email
  );

  if (userAlreadyExits) return { status: 400, message: "User Already Exists" };

  existingData.push(user);

  writeUserDataToFile(role, existingData);

  return { status: 200, message: "User Registred" };
};

export const getAccess = async (user: UserSignIn): Promise<ServerResponse> => {
  const existingStudents: Array<Student> = openAndReadFile("Student");
  const existingTeachers: Array<Teacher> = openAndReadFile("Teacher");

  const existingStudentData = existingStudents.find(
    (item) => item.email === user.email
  );

  const existingTeacherData = existingTeachers.find(
    (item) => item.email === user.email
  );

  if (!(existingStudentData || existingTeacherData))
    return { status: 400, message: "User Does Not Exist" };

  let passwordMatched: boolean = false;
  let accessToken: string;

  if (existingStudentData) {
    passwordMatched = await bcrypt.compare(
      user.password,
      existingStudentData.password
    );

    accessToken = jwt.sign(
      JSON.stringify({
        user: existingStudentData.name,
        email: existingStudentData.email,
        role: "Student",
      }),
      process.env.ACCESS_TOKEN_SECRET as string
    );
  }

  if (existingTeacherData) {
    passwordMatched = await bcrypt.compare(
      user.password,
      existingTeacherData.password
    );

    accessToken = jwt.sign(
      JSON.stringify({
        user: existingTeacherData.name,
        email: existingTeacherData.email,
        role: "Teacher",
      }),
      process.env.ACCESS_TOKEN_SECRET as string
    );
  }

  if (passwordMatched) {
    return { status: 200, message: accessToken! };
  } else {
    return { status: 400, message: "Invalid Credentials" };
  }
};

export const getStudent = (email: string): Student => {
  const students: Array<Student> = openAndReadFile("Student");

  const userFound: Student = students.find((item) => item.email === email)!;

  return userFound;
};

export const getTeacher = (email: string): Teacher => {
  const teachers: Array<Teacher> = openAndReadFile("Teacher");

  const userFound: Student = teachers.find((item) => item.email === email)!;

  return userFound;
};

export const giveMarksToStudent = (email: string, marks: Marks) => {
  const students: Array<Student> = openAndReadFile("Student");

  const userIndex: number = students.findIndex((item) => item.email === email)!;

  if (userIndex === -1) {
    return;
  }

  students[userIndex] = {
    ...students[userIndex],
    marks: { ...students[userIndex].marks, ...marks },
  };

  writeUserDataToFile("Student", students);
};

export const getStudents = (email?: string): Array<Student> => {
  if (email) {
    const student = getStudent(email);
    if (student) return [student];
    else return [];
  } else {
    return openAndReadFile("Student");
  }
};

export const getTeachers = (email?: string): Array<Teacher> => {
  if (email) {
    const student = getTeacher(email);
    if (student) return [student];
    else return [];
  } else {
    return openAndReadFile("Teacher");
  }
};
