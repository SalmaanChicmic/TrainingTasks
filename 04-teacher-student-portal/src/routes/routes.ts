import { Request, response, Response } from "express";
import {
  addUser,
  getAccess,
  getStudent,
  getTeacher,
  getUsers,
  giveMarksToStudent,
  sendMail,
  sendResetMail,
  verifyotp,
  verifyToken,
} from "../controller/controller";
import {
  Role,
  ServerResponse,
  Student,
  Teacher,
  userDataResponse,
  UserSignUp,
} from "../interface/interface";
import { findUser } from "../utils/password.jwt";
import {
  giveMarksSchema,
  loginSchema,
  otpSchema,
  studentSignupSchema,
  teacherSignupSchema,
} from "../validation/schemas";

export const signupTeacher = async (req: Request, res: Response) => {
  const body: UserSignUp = req.body;
  const result = teacherSignupSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response: ServerResponse = await addUser("Teacher", body);
  res.status(response.status).json(response);
};

export const signupStudent = async (req: Request, res: Response) => {
  const body: UserSignUp = req.body;
  const result = studentSignupSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response: ServerResponse = await addUser("Student", body);
  res.status(response.status).json(response);
};

export const login = async (req: Request, res: Response) => {
  const body = req.body;
  const result = loginSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response: ServerResponse = await getAccess(req.body);
  res.status(response.status).json(response);
};

export const userInfo = (req: Request, res: Response) => {
  const role: Role = req.body.user.role;

  const user: any = req.body.user;

  let userData: userDataResponse | undefined;

  if (role === "Student") userData = getStudent(user.email);

  if (role === "Teacher") userData = getTeacher(user.email);

  if (!userData) {
    res.status(404).json({ status: 404, message: "User not found." });
    return;
  }

  res.status(200).json(userData);
};

export const giveMarks = (req: Request, res: Response) => {
  const body = req.body;

  const result = giveMarksSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  giveMarksToStudent(body.email, body.marks);

  res.status(200).json({ message: "Done" });
};

export const students = (req: Request, res: Response) => {
  const email: string | undefined = req.query.email as string;

  const response = getUsers("Student", email);

  if (response.length === 0) {
    res.status(200).json({ status: 404, message: "User Not Found" });
  } else {
    res.status(200).json(response);
  }
};

export const teachers = (req: Request, res: Response) => {
  const email: string | undefined = req.query.email as string;

  const response = getUsers("Teacher", email);

  if (response.length === 0) {
    res.status(200).json({ status: 404, message: "User Not Found" });
  } else {
    res.status(200).json(response);
  }
};

export const getOtp = async (req: Request, res: Response) => {
  const body = req.body;
  const result = loginSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response = await sendMail(result.value);

  res.status((response as ServerResponse).status).json(response);
};

export const checkOtp = (req: Request, res: Response) => {
  const body = req.body;
  const result = otpSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response = verifyotp(result.value.email, result.value.otp);

  res.status(response.status).json(response);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const body = req.body;
  const email = body.email;
  const result = findUser(email);

  if ((result as ServerResponse).status) {
    res.status((result as ServerResponse).status).send(result);
  }

  const response = await sendResetMail(email);

  res.send(response);
};

export const resetPassword = async (req: Request, res: Response) => {
  const token = req.params.token;
  const body = req.body;

  const response = await verifyToken(token, body.newPassword);

  res.send(response);
};
