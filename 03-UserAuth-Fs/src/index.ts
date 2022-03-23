import express, { Request, response, Response } from "express";

import multer from "multer";

import {
  allUsers,
  checkUserAuthorized,
  home,
  login,
  signup,
  updateEmail,
  updateName,
  uploadFile,
} from "./routes/routes";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 10) + ".png";
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });

const port = 3000;
const app = express();

app.use(express.json());

app.get("/", home);

app.post("/signup", signup);

app.post("/login", login);

app.get("/users", checkUserAuthorized, allUsers);

app.post("/updateEmail", checkUserAuthorized, updateEmail);

app.post("/updateName", checkUserAuthorized, updateName);

app.post(
  "/profile",
  checkUserAuthorized,
  upload.single("freshFile"),

  uploadFile
);

app.listen(port, () => {
  console.log("up and running");
});
