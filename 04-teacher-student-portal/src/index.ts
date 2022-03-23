import express from "express";
import { login, signupStudent, signupTeacher } from "./routes/routes";

const port = 3000;

const app = express();
app.use(express.json());

app.post("/teacher-signup", signupTeacher);
app.post("/student-signup", signupStudent);
app.post("/login", login);

app.post("/login");

// app.post("/login", login);

// app.get("/users", checkUserAuthorized, allUsers);

// app.post("/updateEmail", checkUserAuthorized, updateEmail);

app.listen(port, () => {
  console.log("up and running");
});
