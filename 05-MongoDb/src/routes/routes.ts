import { Request, response, Response } from "express";
import {
  addStudentToClass,
  addUser,
  getAccess,
  getStudentInClass,
  getUser,
  getUsers,
  giveMarksToStudent,
  removeStudentFromClass,
  sendMail,
  sendResetMail,
  userExists,
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

import {
  addToClassSchema,
  giveMarksSchema,
  loginSchema,
  otpSchema,
  studentSignupSchema,
  subjectSchema,
  teacherSignupSchema,
} from "../validation/schemas";

export const signupTeacher = async (req: Request, res: Response) => {
  const body: UserSignUp = req.body;
  const result = teacherSignupSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response: ServerResponse = await addUser("Teacher", result.value);
  res.status(response.status).json(response);
};

export const signupStudent = async (req: Request, res: Response) => {
  const body: UserSignUp = req.body;
  const result = studentSignupSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response: ServerResponse = await addUser("Student", result.value);
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

export const userInfo = async (req: Request, res: Response) => {
  const role: Role = req.body.user.role;

  console.log(role);

  const user: any = req.body.user;

  let userData: userDataResponse | undefined = await getUser(user.email);

  if (!userData) {
    res.status(404).json({ status: 404, message: "User not found." });
    return;
  }

  console.log(userData);

  res.status(200).json(userData);
};

export const giveMarks = async (req: Request, res: Response) => {
  const { id, marks } = req.body;

  const result = giveMarksSchema.validate({ id, marks });

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  if (await giveMarksToStudent(id, marks)) {
    res.status(200).json({ message: "Done" });
  } else {
    res.status(400).json({ message: "User not found" });
  }
};

export const students = async (req: Request, res: Response) => {
  const email: string | undefined = req.query.email as string;

  const response = await getUsers("Student", email);

  if (response.length === 0) {
    res.status(200).json({ status: 404, message: "User Not Found" });
  } else {
    res.status(200).json(response);
  }
};

export const teachers = async (req: Request, res: Response) => {
  const email: string | undefined = req.query.email as string;

  const response = await getUsers("Teacher", email);

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

export const checkOtp = async (req: Request, res: Response) => {
  const body = req.body;
  const result = otpSchema.validate(body);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response = await verifyotp(result.value.email, result.value.otp);

  res.status(response.status).json(response);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const email = req.body.email;
  const exists = await userExists(email);
  if (!exists) {
    res.status(400).json({ status: 400, message: "User not found" });
    return;
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

export const addToClass = async (req: Request, res: Response) => {
  const { email, subject } = req.body;

  const result = addToClassSchema.validate({ email, subject });
  if (result.error) {
    res.status(400).json(result.error);
    return;
  }
  const response: ServerResponse = await addStudentToClass(
    result.value.email,
    result.value.subject
  );

  res.status(response.status).json(response);
};

export const removeFromClass = async (req: Request, res: Response) => {
  const { email, subject } = req.params;

  const result = addToClassSchema.validate({ email, subject });

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }
  const response: ServerResponse = await removeStudentFromClass(
    result.value.email,
    result.value.subject
  );

  res.status(response.status).json(response);
};

export const classInfo = (req: Request, res: Response) => {
  const subject = req.params.subject;
  const result = subjectSchema.validate({ subject });

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  const response = getStudentInClass(result.value.subject);

  res.status(200).json(response);
};
