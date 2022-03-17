import { rejects } from "assert";
import {
  readFileSync,
  open,
  openSync,
  appendFileSync,
  writeFileSync,
} from "fs";
import { resolve } from "path";
import { User } from "./interfaces/User.Interface";

interface notFound {
  message: string;
}

const filePath: string = __dirname + "/data.json";

export function readUserData(id?: number): JSON {
  const buffer: Buffer = readFileSync(filePath);
  const data = buffer;

  if (id === undefined) return JSON.parse(data.toString());

  const parsedData = JSON.parse(data.toString());

  if (!parsedData[id]) {
    const err: notFound = { message: "user not found" };

    return JSON.parse(JSON.stringify(err));
  }

  const userData = parsedData[id];

  return userData;
}

export function addUserToFile(newUser: User): boolean {
  const file = openSync(filePath, "r+");

  const data = JSON.parse(readFileSync(file).toString());

  if (data[newUser.id]) return false;

  const newData = { ...data, [newUser.id]: newUser };

  writeFileSync(__dirname + "/data.json", JSON.stringify(newData));

  return true;
}

export function deleteUser(id: number) {
  const file = openSync(filePath, "r+");

  const data = JSON.parse(readFileSync(file).toString());

  delete data[id];

  writeFileSync(__dirname + "/data.json", JSON.stringify(data));
}

export function updateUser(newUser: User): boolean {
  const file = openSync(filePath, "r+");

  const data = JSON.parse(readFileSync(file).toString());

  if (!data[newUser.id]) return false;

  data[newUser.id] = newUser;

  writeFileSync(__dirname + "/data.json", JSON.stringify(data));

  return true;
}
