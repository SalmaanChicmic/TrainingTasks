import { Role, Student, Teacher, UserSignIn } from "../interface/interface";
import { openAndReadFile, writeUserDataToFile } from "./utils.fs";
import bcrypt from "bcrypt";
import { writeFileSync } from "fs";

export async function checkPassword(user: UserSignIn) {
  const existingStudents: Array<Student> = openAndReadFile("Student");
  const existingTeachers: Array<Teacher> = openAndReadFile("Teacher");

  const existingStudentData = existingStudents.find(
    (item) => item.email === user.email
  );

  const existingTeacherData = existingTeachers.find(
    (item) => item.email === user.email
  );

  if (!(existingStudentData || existingTeacherData))
    return { status: 400, message: "User Does Not Exist" };

  let role: Role;

  if (existingStudentData) role = "Student";
  else role = "Teacher";

  let passwordMatched: boolean = false;

  if (existingStudentData) {
    passwordMatched = await bcrypt.compare(
      user.password,
      existingStudentData.password
    );
  }

  if (existingTeacherData) {
    passwordMatched = await bcrypt.compare(
      user.password,
      existingTeacherData.password
    );
  }

  if (passwordMatched) {
    return {
      status: 200,
      message: "ok",
      data:
        role === "Student"
          ? { ...existingStudentData, role }
          : { ...existingTeacherData, role },
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
