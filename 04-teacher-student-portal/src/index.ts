import express from "express";
import { authorizeUser, onlyTeacher } from "./controller/controller";
import cors from "cors";
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

app.use(cors());

app.use(express.json());

app.use(function (req, res, next) {
  console.log("Request Ayi hai: ", req.url);

  console.log(req.body);

  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

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
  console.log("up and running at ", port);
});
