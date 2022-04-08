import express from "express";
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
  addToClass,
  classInfo,
  removeFromClass,
} from "./routes/routes";

import { ConnectDatabase } from "./Database/mongo";
import { authorizeUser } from "./middleware/authorize";
import { onlyTeacher } from "./middleware/onlyTeacher";

const port = 3000;

const app = express();

app.use(express.json());

// for allowing requests from other origins

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// routes
app.post("/teacher-signup", signupTeacher);
app.post("/student-signup", signupStudent);
app.post("/login", login);
app.post("/otp", getOtp);
app.post("/verify", checkOtp);
app.post("/forgot", forgotPassword);
app.post("/reset/:token", resetPassword);
app.get("/myinfo", authorizeUser, userInfo);
app.post("/givemarks", authorizeUser, onlyTeacher, giveMarks);
app.get("/students", authorizeUser, onlyTeacher, students);
app.get("/teachers", authorizeUser, onlyTeacher, teachers);
app.post("/addToClass", authorizeUser, onlyTeacher, addToClass);
app.get("/class/:subject", authorizeUser, onlyTeacher, classInfo);
app.delete(
  "/student/:subject/:email",
  authorizeUser,
  onlyTeacher,
  removeFromClass
);

(async () => {
  await ConnectDatabase();

  app.listen(port, () => {
    console.log("up and running at ", port);
  });
})();
