import { openSync, readFileSync, writeFileSync } from "fs";
import { Role, Student, Teacher } from "../interface/interface";

const studentDataPath = __dirname + "/../../data/student.json";
const teacherDataPath = __dirname + "/../../data/teachers.json";
const subjectDataPath = __dirname + "/../../data/subjects.json";

export const openAndReadFile = (role: Role) => {
  if (role === "Student") {
    const studentFile = openSync(studentDataPath, "r+");
    const studentBuffer = readFileSync(studentFile, "utf-8");
    return JSON.parse(studentBuffer);
  }

  if (role === "Teacher") {
    const teacherFile = openSync(teacherDataPath, "r+");
    const teacherBuffer = readFileSync(teacherFile, "utf-8");
    return JSON.parse(teacherBuffer);
  }
};

export const writeUserDataToFile = (
  role: Role,
  existingData: Array<Student> | Array<Teacher>
): void => {
  if (role === "Student") {
    writeFileSync(studentDataPath, JSON.stringify(existingData));
  }

  if (role === "Teacher") {
    writeFileSync(teacherDataPath, JSON.stringify(existingData));
  }
};
