import { openSync, readFileSync, writeFileSync } from "fs";
import bcrypt from "bcrypt";
import {
  Role,
  ServerResponse,
  Student,
  Teacher,
  UserSignIn,
  UserSignUp,
} from "../interface/interface";
import jwt from "jsonwebtoken";
import process from "../../config";

const studentDataPath = __dirname + "/../../data/student.json";
const teacherDataPath = __dirname + "/../../data/teachers.json";
const subjectDataPath = __dirname + "/../../data/subjects.json";

// export const authorizeUser = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   console.log(req.headers.authorization);

//   if (!req.headers.authorization) {
//     res.status(400).send("Access Token Not Present");
//   } else {
//     const token: string = req.headers.authorization.split(" ")[1];
//     try {
//       req.body.userData = jwt.verify(
//         token,
//         process.env.ACCESS_TOKEN_SECRET as string
//       );

//       console.log(req.body.userData);

//       next();
//     } catch (err) {
//       console.log(err);
//       res.status(403).json({ status: 403, message: "Not Authorized" });
//     }
//   }
// };

export const addUser = async (
  role: Role,
  user: UserSignUp
): Promise<ServerResponse> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  user.password = hashedPassword;

  const file = openSync(
    role === "Teacher" ? teacherDataPath : studentDataPath,
    "r+"
  );

  const buffer = readFileSync(file, "utf-8");

  const existingData: Array<Student> | Array<Teacher> = JSON.parse(buffer);

  const userAlreadyExits = existingData.find(
    (item) => item.email === user.email
  );

  if (userAlreadyExits) return { status: 400, message: "User Already Exists" };

  existingData.push(user);

  writeFileSync(
    role === "Teacher" ? teacherDataPath : studentDataPath,
    JSON.stringify(existingData)
  );

  return { status: 200, message: "User Registred" };
};

export const getAccess = async (user: UserSignIn): Promise<ServerResponse> => {
  const studentFile = openSync(studentDataPath, "r+");
  const teacherFile = openSync(teacherDataPath, "r+");

  const studentBuffer = readFileSync(studentFile, "utf-8");
  const teacherBuffer = readFileSync(teacherFile, "utf-8");

  const existingStudents: Array<Student> = JSON.parse(studentBuffer);
  const existingTeachers: Array<Teacher> = JSON.parse(teacherBuffer);

  const existingStudentData = existingStudents.find(
    (item) => item.email === user.email
  );

  const existingTeacherData = existingTeachers.find(
    (item) => item.email === user.email
  );

  if (!(existingStudentData || existingTeacherData))
    return { status: 400, message: "User Does Not Exist" };

  let passwordMatched: boolean = false;
  let accessToken: string;

  if (existingStudentData) {
    passwordMatched = await bcrypt.compare(
      user.password,
      existingStudentData.password
    );

    accessToken = jwt.sign(
      JSON.stringify({
        user: existingStudentData.name,
        email: existingStudentData.email,
        role: "Student",
      }),
      process.env.ACCESS_TOKEN_SECRET as string
    );
  }

  if (existingTeacherData) {
    passwordMatched = await bcrypt.compare(
      user.password,
      existingTeacherData.password
    );

    accessToken = jwt.sign(
      JSON.stringify({
        user: existingTeacherData.name,
        email: existingTeacherData.email,
        role: "Teacher",
      }),
      process.env.ACCESS_TOKEN_SECRET as string
    );
  }

  if (passwordMatched) {
    return { status: 200, message: accessToken! };
  } else {
    return { status: 400, message: "Invalid Credentials" };
  }
};
