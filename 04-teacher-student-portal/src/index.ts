import express from "express";
import { authorizeUser, onlyTeacher } from "./controller/controller";
import {
  giveMarks,
  login,
  signupStudent,
  signupTeacher,
  students,
  teachers,
  userInfo,
} from "./routes/routes";

const port = 3000;

const app = express();
app.use(express.json());

app.post("/teacher-signup", signupTeacher);
app.post("/student-signup", signupStudent);
app.post("/login", login);
// app.post("/verify", verifyEmail);
app.get("/myinfo", authorizeUser, userInfo);
app.post("/givemarks", authorizeUser, onlyTeacher, giveMarks);
app.get("/students", authorizeUser, onlyTeacher, students);
app.get("/teachers", authorizeUser, onlyTeacher, teachers);

app.listen(port, () => {
  console.log("up and running");
});
