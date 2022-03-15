import { createServer, get, request, Server } from "http";
import { readFileSync } from "fs";

const port: number = 3000;
const host: string = "localhost";

function readUserData(id?: number) {
  // please enter the absoluter path for the file

  const buffer: Buffer = readFileSync(
    "/home/test/Documents/Salmaan/TrainingTasks/01-file_read_write_api/data.json"
  );
  const data = buffer;

  const parsedData = JSON.parse(data.toString());

  if (id! < 1 || id! > parsedData.length) {
    return `Invalid User Id! User ${id} does not exist`;
  }

  const userData = parsedData[id! - 1];

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
