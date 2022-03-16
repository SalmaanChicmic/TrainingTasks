import { rejects } from "assert";
import {
  readFileSync,
  open,
  openSync,
  appendFileSync,
  writeFileSync,
} from "fs";
import { resolve } from "path";

const filePath: string = __dirname + "/data.json";

export function readUserData(id?: number): string {
  const buffer: Buffer = readFileSync(filePath);
  const data = buffer;

  if (id === undefined) return data.toString();

  const parsedData = JSON.parse(data.toString());

  if (!parsedData[id]) {
    return `Invalid User Id! User ${id} does not exist`;
  }

  const userData = parsedData[id];

  return JSON.stringify(userData);
}

export function addUserToFile(body: string): boolean {
  const newUser = JSON.parse(body);

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

export function updateUser(body: string): boolean {
  const newUser = JSON.parse(body);

  const file = openSync(filePath, "r+");

  const data = JSON.parse(readFileSync(file).toString());

  if (!data[newUser.id]) return false;

  data[newUser.id] = newUser;

  writeFileSync(__dirname + "/data.json", JSON.stringify(data));

  return true;
}
