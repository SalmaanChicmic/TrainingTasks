import {
  readFileSync,
  open,
  openSync,
  appendFileSync,
  writeFileSync,
} from "fs";

export function readUserData(id?: number): string {
  // please enter the absolute path for the data file

  const pathName: string = __dirname + "/data.json";

  const buffer: Buffer = readFileSync(pathName);
  const data = buffer;

  if (id === undefined) return data.toString();

  const parsedData = JSON.parse(data.toString());

  if (!parsedData[id]) {
    return `Invalid User Id! User ${id} does not exist`;
  }

  const userData = parsedData[id];

  return JSON.stringify(userData);
}

export async function addUserToFile(body: string) {
  const newUser = JSON.parse(body);

  const pathName: string = __dirname + "/data.json";

  const file = openSync(pathName, "r+");

  const data = JSON.parse(readFileSync(file).toString());

  if (data[newUser.id]) throw new Error("User with this id exists already");

  const newData = { ...data, [newUser.id]: newUser };

  console.log(newData);

  writeFileSync(__dirname + "/data.json", JSON.stringify(newData));
}

export function deleteUser(id: number) {
  const pathName: string = __dirname + "/data.json";

  const file = openSync(pathName, "r+");

  const data = JSON.parse(readFileSync(file).toString());

  delete data[id];

  writeFileSync(__dirname + "/data.json", JSON.stringify(data));
}
