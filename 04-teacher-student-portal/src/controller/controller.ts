import bcrypt from "bcrypt";
import { Request, response, Response } from "express";
import {
  Marks,
  Result,
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
  deleteStudentFromClass,
  getAllClasses,
  matchOtpWithFile,
  openAndReadFile,
  readStudentsFromClass,
  writeMarksToClasses,
  writeOtpToFile,
  writeStudentToClass,
  writeUserDataToFile,
} from "../utils/utils.fs";
import { checkPassword, updatePassword } from "../utils/password.jwt";
import OTP from "otp-generator";
import { sendEmailToAddress, sendTokenToMail } from "../utils/email.nodemailer";

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

  if ((response as ServerResponse).status !== 200) {
    return response as ServerResponse;
  }

  if (!(response as Result).data?.emailVerified) {
    return { status: 400, message: "Your Email is not verified!" };
  }

  let accessToken: string = jwt.sign(
    JSON.stringify((response as Result).data),
    process.env.ACCESS_TOKEN_SECRET as string
  );

  return { status: 200, accessToken: accessToken };
};

export const getStudent = (email: string): userDataResponse | undefined => {
  const students: Array<Student> = openAndReadFile("Student");

  const user: Student = students.find((item) => item.email === email)!;

  if (user) {
    const marks: Array<Marks> = getAllClasses(email);

    const cleanedUser = {
      name: user.name,
      email: user.email,
      marks,
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

export const giveMarksToStudent = (email: string, marks: Marks): boolean => {
  const students: Array<Student> = openAndReadFile("Student");

  const userIndex: number = students.findIndex((item) => item.email === email)!;

  if (userIndex === -1) {
    return false;
  }

  writeMarksToClasses(email, marks);

  return true;
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
      if (role == "Student") {
        const marks: Array<Marks> = getAllClasses(item.email);

        return {
          name: item.name,
          email: item.email,
          marks,
        };
      }
    }
  );

  return cleaned;
};

export const sendMail = async (user: UserSignIn) => {
  const response = await checkPassword(user);

  if ((response as ServerResponse).status !== 200) {
    return response;
  }

  if ((response as Result).data?.emailVerified) {
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
  const response = matchOtpWithFile(email, otp);
  return response;
};

export const sendResetMail = async (email: string) => {
  const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "600s",
  });

  if (await sendTokenToMail(email, token)) {
    return {
      status: 200,
      message: "Email was sent to your registered email address.",
    };
  } else {
    return {
      status: 500,
      message: "Something went wrong.",
    };
  }
};

export const verifyToken = async (token: string, newPassword: string) => {
  try {
    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    // @ts-ignore
    return await updatePassword(data.email, newPassword);
  } catch (err) {
    return err;
  }
};

export const addStudentToClass = (email: string, subject: string) => {
  if (getStudent(email)) {
    writeStudentToClass(email, subject);
    return { status: 200, message: "Student successfully added." };
  } else {
    return { status: 200, message: "Student does not exists." };
  }
};

export const removeStudentFromClass = (email: string, subject: string) => {
  if (getStudent(email)) {
    deleteStudentFromClass(email, subject);
    return { status: 200, message: "Student successfully removed." };
  } else {
    return { status: 200, message: "Student does not exists." };
  }
};

export const getStudentInClass = (subject: string) => {
  const students = readStudentsFromClass(subject);
  if (!Object.keys(students).length) {
    return { status: 200, message: "Class is empty." };
  } else {
    return { [subject]: students };
  }
};
