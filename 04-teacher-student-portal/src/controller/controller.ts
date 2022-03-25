import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {
  Marks,
  Role,
  ServerResponse,
  Student,
  Teacher,
  userDataResponse,
  UserSignIn,
  UserSignUp,
} from "../interface/interface";
import jwt from "jsonwebtoken";
import process from "../../config";
import { NextFunction } from "express";
import {
  matchOtpWithFile,
  openAndReadFile,
  writeOtpToFile,
  writeUserDataToFile,
} from "../utils/utils.fs";
import { checkPassword } from "../utils/password.jwt";
import OTP from "otp-generator";
import { sendEmailToAddress } from "../utils/email.nodemailer";

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
  user.emailVerified = false;

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
  const response = await checkPassword(user);

  if (response.status !== 200) {
    return response;
  }

  if (!response.data?.emailVerified) {
    return { status: 400, message: "Your Email is not verified!" };
  }

  let accessToken: string = jwt.sign(
    JSON.stringify(response.data),
    process.env.ACCESS_TOKEN_SECRET as string
  );

  return { status: 200, accessToken: accessToken };
};

export const getStudent = (email: string): userDataResponse | undefined => {
  const students: Array<Student> = openAndReadFile("Student");

  const user: Student = students.find((item) => item.email === email)!;

  if (user) {
    const cleanedUser = {
      name: user.name,
      email: user.email,
      marks: user.marks ? user.marks : {},
    };

    return cleanedUser;
  }

  return undefined;
};

export const getTeacher = (email: string): userDataResponse | undefined => {
  const teachers: Array<Teacher> = openAndReadFile("Teacher");

  const user: Teacher = teachers.find((item) => item.email === email)!;

  if (user) {
    const cleanedUser = {
      name: user.name,
      email: user.email,
    };

    return cleanedUser;
  }

  return undefined;
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

export const getUsers = (
  role: Role,
  email?: string
): Array<userDataResponse> => {
  if (email) {
    const student = getStudent(email);
    if (student) return [student];
    else return [];
  }

  const users: Array<Student> | Array<Teacher> = openAndReadFile(role);

  const cleaned: any = users.map(
    (item: Student | Teacher): userDataResponse | undefined => {
      if (role == "Teacher") return { email: item.email, name: item.name };
      if (role == "Student")
        return {
          name: item.name,
          email: item.email,
          // @ts-ignore
          marks: item.marks ? item.marks : {},
        };
    }
  );

  return cleaned;
};

export const sendMail = async (user: UserSignIn) => {
  const response = await checkPassword(user);

  if (response.status !== 200) {
    return response;
  }

  if (response.data?.emailVerified) {
    return { status: 200, message: "Your Email is already verified!" };
  }

  const otp = OTP.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  writeOtpToFile({ email: user.email, otp: otp });

  if (await sendEmailToAddress(user.email, otp)) {
    return { status: 200, message: "Success." };
  } else {
    return { status: 400, message: "Something went wrong." };
  }
};

export const verifyotp = (email: string, otp: string) => {
  return matchOtpWithFile(email, otp);
};
