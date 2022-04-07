import bcrypt from "bcrypt";
import { Request, response, Response } from "express";
import {
  Marks,
  Result,
  Role,
  ServerResponse,
  Student,
  Teacher,
  User,
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
import { UserModel } from "../Database/Schemas/user.model";
import { students } from "../routes/routes";
import { OtpModel } from "../Database/Schemas/otps.models";
import { MarksModel } from "../Database/Schemas/marks.model";

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

  // changing user password with hashedpassword
  user.password = hashedPassword;

  const existingUser = await UserModel.find({ email: user.email });

  if (existingUser.length)
    return { status: 400, message: "User Already Exists" };

  // insery new User
  UserModel.insertMany([{ ...user, role }]);

  return { status: 200, message: "User Registred" };
};

export const getAccess = async (user: UserSignIn): Promise<ServerResponse> => {
  const response = await checkPassword(user);

  if ((response as ServerResponse).status !== 200) {
    return response as ServerResponse;
  }

  if (!(response as ServerResponse).data.emailVerified) {
    return { status: 400, message: "Your Email is not verified!" };
  }

  let accessToken: string = jwt.sign(
    JSON.stringify((response as ServerResponse).data),
    process.env.ACCESS_TOKEN_SECRET as string
  );

  return { status: 200, accessToken: accessToken };
};

export const getUser = async (
  email: string
): Promise<userDataResponse | undefined> => {
  const userData: User = (await UserModel.findOne(
    { email },
    { _id: 1, name: 1, email: 1, role: 1 }
  )) as unknown as User;

  if (!userData) return;

  if (userData.role === "Teacher") {
    return {
      name: userData.name,
      email: userData.email,
    };
  }

  if (userData.role === "Student") {
    const response = await MarksModel.findOne(
      { _id: userData._id },
      { _id: 0, _v: 0 }
    );
    return {
      name: userData.name,
      email: userData.email,
      marks: response.marks,
    };
  }
};

export const giveMarksToStudent = async (
  id: string,
  marks: Marks
): Promise<boolean> => {
  try {
    await MarksModel.updateOne(
      {
        _id: id,
      },
      { marks: { ...marks } },
      { upsert: true }
    );

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
};

export const getUsers = async (role: Role, email?: string) => {
  if (email) {
    const user = await getUser(email);
    if (user) return [user];
    else return [];
  }

  return await UserModel.find({ role }, { email: 1, name: 1 });
};

export const sendMail = async (user: UserSignIn) => {
  const response = await checkPassword(user);

  if ((response as ServerResponse).status !== 200) {
    return response;
  }

  if ((response as Student | Teacher).emailVerified) {
    return { status: 200, message: "Your Email is already verified!" };
  }

  const otp = OTP.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  await OtpModel.updateOne(
    { email: user.email },
    { email: user.email, otp: otp },
    { upsert: true }
  );

  console.log(user.email, otp);

  if (await sendEmailToAddress(user.email, otp)) {
    return { status: 200, message: "Success." };
  } else {
    return { status: 400, message: "Something went wrong." };
  }
};

export const verifyotp = async (email: string, otp: string) => {
  const response = await matchOtpWithFile(email, otp);
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

export const addStudentToClass = async (email: string, subject: string) => {
  if (await getUser(email)) {
    writeStudentToClass(email, subject);
    return { status: 200, message: "Student successfully added." };
  } else {
    return { status: 200, message: "Student does not exists." };
  }
};

export const removeStudentFromClass = async (
  email: string,
  subject: string
) => {
  if (await getUser(email)) {
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

export const userExists = async (email: string): Promise<Boolean> => {
  const user = await UserModel.findOne({ email });
  return !!user;
};
