import { Request, Response } from "express";
import { addUser, getAccess } from "../controller/controller";
import { ServerResponse, UserSignUp } from "../interface/interface";

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
