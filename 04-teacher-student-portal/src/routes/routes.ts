import { Request, response, Response } from "express";
import {
  addStudentToClass,
  addUser,
  getAccess,
  getStudent,
  getStudentInClass,
  getTeacher,
  getUsers,
  giveMarksToStudent,
  removeStudentFromClass,
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
  const { email, marks } = req.body;

  const result = giveMarksSchema.validate({ email, marks });

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  if (giveMarksToStudent(email, marks)) {
    res.status(200).json({ message: "Done" });
  } else {
    res.status(400).json({ message: "User not found" });
  }
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

export const addToClass = (req: Request, res: Response) => {
  const { email, subject } = req.body;

  const result = addToClassSchema.validate({ email, subject });
  if (result.error) {
    res.status(400).json(result.error);
    return;
  }
  const response: ServerResponse = addStudentToClass(
    result.value.email,
    result.value.subject
  );

  res.status(response.status).json(response);
};

export const removeFromClass = (req: Request, res: Response) => {
  const { email, subject } = req.params;

  const result = addToClassSchema.validate({ email, subject });

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }
  const response: ServerResponse = removeStudentFromClass(
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
