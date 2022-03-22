import { access, openSync, readFileSync, writeFileSync } from "fs";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import {
  ServerResponse,
  User,
  UserData,
  UserSignIn,
} from "../Interface/Interface";
import process from "../config";
import { verify } from "crypto";

const UserFilePath = __dirname + "/../Data.json";

export const saveUser = (user: User): ServerResponse => {
  const file = openSync(UserFilePath, "r+");

  const buffer = readFileSync(file, "utf-8");

  const existingData: Array<User> = JSON.parse(buffer);

  const userAlreadyExits = existingData.find(
    (item) => item.email === user.email
  );

  if (userAlreadyExits) return { status: 400, message: "User Already Exists" };

  existingData.push(user);

  writeFileSync(UserFilePath, JSON.stringify(existingData));

  return { status: 200, message: "User Registred" };
};

export const login = async (user: UserSignIn): Promise<ServerResponse> => {
  const file = openSync(UserFilePath, "r+");

  const buffer = readFileSync(file, "utf-8");

  const existingData: Array<User> = JSON.parse(buffer);

  const existingUser = existingData.find((item) => item.email === user.email);

  if (!existingUser) return { status: 400, message: "User Does Not Exist" };

  const passwordMatched: boolean = await bcrypt.compare(
    user.password,
    existingUser.password
  );

  const accessToken = jwt.sign(
    JSON.stringify({ user: existingUser.name, email: existingUser.email }),
    process.env.ACCESS_TOKEN_SECRET as string
  );

  if (passwordMatched) {
    return { status: 200, message: accessToken };
  } else {
    return { status: 400, message: "Invalid Credentials" };
  }
};

export const getUsers = (token: string): string => {
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
  } catch (err) {
    console.log(err);
    return "Not Authorized";
  }

  const file = openSync(UserFilePath, "r+");

  const buffer = readFileSync(file, "utf-8");

  return buffer;
};
