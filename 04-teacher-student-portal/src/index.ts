import express from "express";
import { authorizeUser, onlyTeacher } from "./controller/controller";
import {
  checkOtp,
  forgotPassword,
  giveMarks,
  login,
  signupStudent,
  signupTeacher,
  students,
  teachers,
  userInfo,
  getOtp,
  resetPassword,
} from "./routes/routes";

const port = 3000;

const app = express();
app.use(express.json());

app.post("/teacher-signup", signupTeacher);
app.post("/student-signup", signupStudent);
app.post("/login", login);
app.post("/verify", checkOtp);
app.post("/otp", getOtp);
app.post("/forgot", forgotPassword);
app.post("/reset/:token", resetPassword);
app.get("/myinfo", authorizeUser, userInfo);
app.post("/givemarks", authorizeUser, onlyTeacher, giveMarks);
app.get("/students", authorizeUser, onlyTeacher, students);
app.get("/teachers", authorizeUser, onlyTeacher, teachers);

app.listen(port, () => {
  console.log("up and running");
});
