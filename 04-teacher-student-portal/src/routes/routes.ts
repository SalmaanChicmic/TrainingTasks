import { Request, Response } from "express";
import {
  addUser,
  getAccess,
  getStudent,
  getTeacher,
  getUsers,
  giveMarksToStudent,
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
  giveMarksSchema,
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

// export const verifyEmail = ()
