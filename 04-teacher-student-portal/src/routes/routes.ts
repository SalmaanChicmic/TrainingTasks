import { Request, Response } from "express";
import {
  addUser,
  getAccess,
  getStudent,
  getStudents,
  getTeacher,
  getTeachers,
  giveMarksToStudent,
} from "../controller/controller";
import {
  Role,
  ServerResponse,
  Student,
  Teacher,
  UserSignUp,
} from "../interface/interface";

export const signupTeacher = async (req: Request, res: Response) => {
  const body: UserSignUp = req.body;
  const response: ServerResponse = await addUser("Teacher", body);
  res.status(response.status).json(response);
};

export const signupStudent = async (req: Request, res: Response) => {
  const body: UserSignUp = req.body;
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

  let userData: Student | Teacher;

  if (role === "Student") userData = getStudent(user.email);

  if (role === "Teacher") userData = getTeacher(user.email);

  res.status(200).json(userData!);
};

export const giveMarks = (req: Request, res: Response) => {
  giveMarksToStudent(req.body.email, req.body.marks);

  res.status(200).json({ message: "Done" });
};

export const students = (req: Request, res: Response) => {
  const email: string | undefined = req.query.email as string;

  const response = getStudents(email);

  if (response.length === 0) {
    res.status(200).json({ status: 404, message: "User Not Found" });
  } else {
    res.status(200).json(response);
  }
};

export const teachers = (req: Request, res: Response) => {
  const email: string | undefined = req.query.email as string;

  const response = getTeachers(email);

  if (response.length === 0) {
    res.status(200).json({ status: 404, message: "User Not Found" });
  } else {
    res.status(200).json(response);
  }
};
