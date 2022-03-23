import bcrypt from "bcrypt";
import {
  ServerResponse,
  User,
  updateEmailBody,
  updateNameBody,
} from "../Interface/Interface";
import express, { NextFunction, Request, response, Response } from "express";
import {
  getUsers,
  getAccess,
  saveUser,
  findAndUpdateUserEmail,
  findAndUpdateUserName,
  writeUpoadedFile,
} from "../controller/controller";

import jwt from "jsonwebtoken";
import { fstat } from "fs";

export const checkUserAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.headers.authorization);

  if (!req.headers.authorization) {
    res.status(400).send("Access Token Not Present");
  } else {
    const token: string = req.headers.authorization.split(" ")[1];
    try {
      req.body.userData = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      );

      console.log(req.body.userData);

      next();
    } catch (err) {
      console.log(err);
      res.status(403).json({ status: 403, message: "Not Authorized" });
    }
  }
};

export const home = (req: Request, res: Response) => {
  res.status(200).send("Hello");
};

export const allUsers = (req: Request, res: Response) => {
  const response: Array<User> = getUsers();
  res.status(200).json(response);
};

export const signup = async (req: Request, res: Response) => {
  const response: ServerResponse = await saveUser(req.body);

  res.status(response.status).send(response.message);
};

export const login = async (req: Request, res: Response) => {
  const response: ServerResponse = await getAccess(req.body);

  res.status(response.status).json(response);
};

export const updateEmail = (req: Request, res: Response) => {
  const body: updateEmailBody = req.body;

  const response: ServerResponse = findAndUpdateUserEmail(body);

  res.status(response.status).json(response);
};

export const updateName = (req: Request, res: Response) => {
  const body: updateNameBody = req.body;

  const response: ServerResponse = findAndUpdateUserName(body);

  res.status(response.status).json(response);
};

export const uploadFile = (req: Request, res: Response) => {
  writeUpoadedFile(req.file);
  res.status(200).json({ status: 200, message: "File uploaded" });
};
