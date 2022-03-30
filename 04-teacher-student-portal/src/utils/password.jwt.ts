import {
  Result,
  Role,
  ServerResponse,
  Student,
  Teacher,
  UserSignIn,
} from "../interface/interface";
import { openAndReadFile, writeUserDataToFile } from "./utils.fs";
import bcrypt from "bcrypt";
import { writeFileSync } from "fs";

export const findUser = (email: string): ServerResponse | Teacher | Student => {
  const existingStudents: Array<Student> = openAndReadFile("Student");
  const existingTeachers: Array<Teacher> = openAndReadFile("Teacher");

  const existingStudentData = existingStudents.find(
    (item) => item.email === email
  );

  const existingTeacherData = existingTeachers.find(
    (item) => item.email === email
  );

  if (!(existingStudentData || existingTeacherData))
    return { status: 400, message: "User Does Not Exist" };

  if (existingStudentData) return { ...existingStudentData, role: "Student" };
  else return { ...existingTeacherData!, role: "Teacher" };
};

export async function checkPassword(
  user: UserSignIn
): Promise<ServerResponse | Teacher | Result> {
  const result = findUser(user.email);

  if ((result as ServerResponse).status) return result;

  // just to start it with a random value

  const passwordMatched = await bcrypt.compare(
    user.password,
    (result as Teacher | Student).password
  );

  if (passwordMatched) {
    return {
      status: 200,
      message: "ok",
      data: result,
    };
  } else {
    return { status: 400, message: "Invalid Credentials" };
  }
}

export function setEmailVerified(email: string) {
  const existingStudents: Array<Student> = openAndReadFile("Student");
  const existingTeachers: Array<Teacher> = openAndReadFile("Teacher");

  const studentIndex = existingStudents.findIndex(
    (item) => item.email === email
  );

  const teacherIndex = existingTeachers.findIndex(
    (item) => item.email === email
  );

  if (studentIndex !== -1) {
    existingStudents[studentIndex].emailVerified = true;

    writeUserDataToFile("Student", existingStudents);

    return { status: 200, message: "Email Verified." };
  }

  if (teacherIndex !== -1) {
    existingTeachers[teacherIndex].emailVerified = true;

    writeUserDataToFile("Teacher", existingTeachers);

    return { status: 200, message: "Email Verified." };
  }

  return { status: 400, message: "User not found." };
}

export const updatePassword = async (email: string, newPassword: string) => {
  const existingStudents: Array<Student> = openAndReadFile("Student");
  const existingTeachers: Array<Teacher> = openAndReadFile("Teacher");

  const studentIndex = existingStudents.findIndex(
    (item) => item.email === email
  );

  const teacherIndex = existingTeachers.findIndex(
    (item) => item.email === email
  );

  if (studentIndex !== -1) {
    existingStudents[studentIndex].password = await bcrypt.hash(
      newPassword,
      10
    );

    writeUserDataToFile("Student", existingStudents);

    return { status: 200, message: "Password Updated" };
  }

  if (teacherIndex !== -1) {
    existingTeachers[teacherIndex].password = await bcrypt.hash(
      newPassword,
      10
    );

    writeUserDataToFile("Teacher", existingTeachers);

    return { status: 200, message: "Password Updated" };
  }

  return { status: 400, message: "User not found." };
};
