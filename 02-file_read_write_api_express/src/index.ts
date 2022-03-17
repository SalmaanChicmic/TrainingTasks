import express, { Request, Response } from "express";
import { User } from "../interfaces/User.Interface";
import { addUserToFile, deleteUser, readUserData, updateUser } from "../utils";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to user database.");
});

app
  .route("/users")
  .get((req: Request<{}, {}, {}, { id: string }>, res: Response) => {
    const id: string | undefined = req.query.id;
    if (id === undefined) {
      const response: JSON = readUserData();
      res.json(response);
    } else {
      const response: JSON = readUserData(+id);
      res.json(response);
    }
  })
  .post((req: Request, res: Response) => {
    const newUser: User = req.body;

    if (addUserToFile(newUser)) {
      res.status(200).send({ message: "User added successfully." });
    } else {
      res.status(400).send({ message: "User Exists Already" });
    }
  })
  .put((req: Request, res: Response) => {
    const newUser: User = req.body;

    if (updateUser(newUser)) {
      res.status(200).send({ message: "User updated successfully." });
    } else {
      res.status(400).send({ message: "User does not exist." });
    }
  })
  .delete((req: Request<{}, {}, {}, { id: string }>, res: Response) => {
    const id: string = req.query.id;

    deleteUser(+id);
    res.status(200).send({ message: "User Deleted" });
  });

app.listen(3000, () => {
  console.log("up n runnin'");
});
