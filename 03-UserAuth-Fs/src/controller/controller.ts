import { access, openSync, readFileSync, writeFileSync } from "fs";
import bcrypt from "bcrypt";

import {
  ServerResponse,
  updateEmailBody,
  updateNameBody,
  User,
  UserSignIn,
} from "../Interface/Interface";
import process from "../../config";

import jwt from "jsonwebtoken";

const UserFilePath = __dirname + "/../../Data.json";

export const saveUser = async (body: any): Promise<ServerResponse> => {
  const { name, email, password } = body;

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const user = { name, email, password: hashedPassword };

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

export const getAccess = async (user: UserSignIn): Promise<ServerResponse> => {
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

export const getUsers = (): Array<User> => {
  const file = openSync(UserFilePath, "r+");

  const buffer = readFileSync(file, "utf-8");

  return JSON.parse(buffer);
};

export const findAndUpdateUserEmail = (
  body: updateEmailBody
): ServerResponse => {
  const file = openSync(UserFilePath, "r+");

  const buffer = readFileSync(file, "utf-8");

  const existingData: Array<User> = JSON.parse(buffer);

  const userIndex = existingData.findIndex((item) => {
    return item.email === body.userData.email;
  });

  if (userIndex === -1) return { status: 404, message: "User Not Found." };

  existingData[userIndex].email = body.newEmail;

  writeFileSync(UserFilePath, JSON.stringify(existingData));

  return { status: 200, message: "Email Updated." };
};

export const findAndUpdateUserName = (body: updateNameBody): ServerResponse => {
  const file = openSync(UserFilePath, "r+");

  const buffer = readFileSync(file, "utf-8");

  const existingData: Array<User> = JSON.parse(buffer);

  const userIndex = existingData.findIndex((item) => {
    return item.email === body.userData.email;
  });

  if (userIndex === -1) return { status: 404, message: "User Not Found." };

  existingData[userIndex].name = body.name;

  writeFileSync(UserFilePath, JSON.stringify(existingData));

  return { status: 200, message: "Name Updated." };
};

export const writeUpoadedFile = (file: any) => {
  console.log(file);

  // writeFileSync(UserFilePath, file);
};
