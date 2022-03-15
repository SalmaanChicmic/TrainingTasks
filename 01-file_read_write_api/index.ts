import { createServer, get, request, Server } from "http";
import { readFileSync } from "fs";

const port: number = 3000;
const host: string = "localhost";

function readUserData(id?: number) {
  const buffer: Buffer = readFileSync(
    "/home/test/Documents/Salmaan/training-tasks/01-file_read_write_api/data.json"
  );
  const data = buffer;

  if (!id) {
    return data;
  }

  const userData = JSON.parse(data.toString())[id - 1];

  if (!userData) return `Invalid User Id! User ${id} does not exist`;

  return userData;
}

// console.log(readUserData(30));

const server = createServer(async (req, res) => {
  if (req.url === "/users" && req.method === "GET") {
    res.write(JSON.stringify(readUserData()));
  }

  if (req.url!.match(/\/user\/([0-9]+)/) && req.method === "GET") {
    const id: number = +req.url!.split("/")[2];
    res.write(JSON.stringify(readUserData(id)));
  }
  res.end();
});
server.listen(port, host, () => {
  console.log(`server running a port: ${port}`);
});
