import { createServer } from "http";

import { addUserToFile, deleteUser, readUserData } from "./utils";

const port: number = 3000;
const host: string = "localhost";

const server = createServer(async (req, res) => {
  if (req.url === "/users" && req.method === "GET") {
    res.writeHead(200, { "content-type": "application/json" });
    res.write(readUserData());
    res.end();
  }

  if (req.url!.match(/\/user\/([0-9]+)/) && req.method === "GET") {
    const id: number = +req.url!.split("/")[2];

    res.writeHead(200, { "content-type": "application/json" });
    res.write(readUserData(id));

    res.end();
  }

  if (req.url === "/user" && req.method === "POST") {
    const id: number = +req.url!.split("/")[2];

    try {
      let body = "";
      // listen to data sent by client
      req.on("data", (chunk) => {
        // append the string version to the body
        body += chunk.toString();
      });
      // listen till the end
      req.on("end", () => {
        // send back the data
        // console.log(body);

        addUserToFile(body);
      });
    } catch (error: any) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(error.message);
    }

    res.write("add path");
    res.end();
  }

  if (req.url!.match(/\/user\/([0-9]+)/) && req.method === "DELETE") {
    const id: number = +req.url!.split("/")[2];

    res.writeHead(200, { "content-type": "application/json" });
    deleteUser(id);

    res.end(`User ${id} is now deleted `);
  }
});

server.listen(port, host, () => {
  console.log(`server running a port: ${port}`);
});
