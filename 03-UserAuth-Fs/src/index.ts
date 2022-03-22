import bcrypt from "bcrypt";

import express, { Request, response, Response } from "express";

import { ServerResponse, User } from "../Interface/Interface";
import { getUsers, login, saveUser } from "../utils/utils";

const port = 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello");
});

app.get("/users", (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    res.status(200).send("Access Token Not Present");
    return;
  }

  const token: string = req.headers.authorization.split(" ")[1];

  const response: string = getUsers(token);
  res.status(200).send(response);
});

app.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = { name, email, password: hashedPassword };

  const response: ServerResponse = saveUser(user);

  res.status(response.status).send(response.message);
});

app.post("/login", async (req: Request, res: Response) => {
  console.log(req.body);

  const response: ServerResponse = await login(req.body);

  res.status(response.status).send(response.message);
});

app.listen(port, () => {
  console.log("up and running");
});
