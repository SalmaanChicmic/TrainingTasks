import { NextFunction, Request, Response } from "express";
import { Role } from "../interface/interface";

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
