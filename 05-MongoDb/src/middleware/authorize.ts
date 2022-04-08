import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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
