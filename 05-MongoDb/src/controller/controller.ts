import bcrypt from "bcrypt";
import {
  Marks,
  Role,
  ServerResponse,
  Student,
  Teacher,
  User,
  userDataResponse,
  UserSignIn,
  UserSignUp,
} from "../interface/interface";
import jwt from "jsonwebtoken";
import process from "../../config";
import { matchOtp } from "../utils/utils.mongo";
import { checkPassword, updatePassword } from "../utils/password.jwt";
import OTP from "otp-generator";
import { sendEmailToAddress, sendTokenToMail } from "../utils/email.nodemailer";
import { UserModel } from "../Database/Schemas/user.model";
import { OtpModel } from "../Database/Schemas/otps.models";
import { MarksModel } from "../Database/Schemas/marks.model";
import { ClassModel } from "../Database/Schemas/classes.model";

export const addUser = async (
  role: Role,
  user: UserSignUp
): Promise<ServerResponse> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  // changing user password with hashedpassword
  user.password = hashedPassword;

  const existingUser = await UserModel.find({ email: user.email });

  if (existingUser.length)
    return { status: 409, message: "User Already Exists" };

  // insery new User
  UserModel.insertMany([{ ...user, role }]);

  return { status: 200, message: "User Registred" };
};

export const getAccess = async (user: UserSignIn): Promise<ServerResponse> => {
  const response = await checkPassword(user);

  if ((response as ServerResponse).status !== 200) {
    return response as ServerResponse;
  }

  if (!(response as ServerResponse).data.emailVerified) {
    return { status: 403, message: "Your Email is not verified!" };
  }

  let accessToken: string = jwt.sign(
    JSON.stringify((response as ServerResponse).data),
    process.env.ACCESS_TOKEN_SECRET as string
  );

  return { status: 200, accessToken: accessToken };
};

export const getUser = async (
  email: string
): Promise<userDataResponse | undefined> => {
  const userData: Array<userDataResponse> = (await UserModel.aggregate([
    { $match: { email } },
    {
      $lookup: {
        from: "Marks",
        localField: "_id",
        foreignField: "studentId",
        as: "data",
      },
    },
    { $unwind: { path: "$data", preserveNullAndEmptyArrays: true } },
    { $project: { name: 1, role: 1, marks: "$data.marks" } },
  ])) as unknown as Array<userDataResponse>;

  return userData[0];
};

export const giveMarksToStudent = async (
  id: string,
  marks: Marks
): Promise<boolean> => {
  try {
    await MarksModel.updateOne(
      {
        studentId: id,
      },
      { marks: { ...marks } },
      { upsert: true }
    );

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
};

export const getUsers = async (role: Role, email?: string) => {
  if (email) {
    const user = await getUser(email);
    if (user) return [user];
    else return [];
  }

  return await UserModel.find({ role }, { email: 1, name: 1 });
};

export const sendMail = async (user: UserSignIn) => {
  const response = await checkPassword(user);

  if ((response as ServerResponse).status !== 200) {
    return response;
  }

  if ((response as ServerResponse).data.emailVerified) {
    return { status: 200, message: "Your Email is already verified!" };
  }

  const otp = OTP.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  await OtpModel.updateOne(
    { email: user.email },
    { email: user.email, otp: otp },
    { upsert: true }
  );

  console.log(user.email, otp);

  if (await sendEmailToAddress(user.email, otp)) {
    return { status: 200, message: "Success." };
  } else {
    return { status: 500, message: "Internal Server Error." };
  }
};

export const verifyotp = async (email: string, otp: string) => {
  const response = await matchOtp(email, otp);
  return response;
};

export const sendResetMail = async (email: string) => {
  const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "600s",
  });

  if (await sendTokenToMail(email, token)) {
    return {
      status: 200,
      message: "Email was sent to your registered email address.",
    };
  } else {
    return {
      status: 500,
      message: "Something went wrong.",
    };
  }
};

export const verifyToken = async (token: string, newPassword: string) => {
  try {
    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    // @ts-ignore
    return await updatePassword(data.email, newPassword);
  } catch (err) {
    return err;
  }
};

export const addStudentToClass = async (
  teacherEmail: string,
  studentEmail: string,
  subject: string
) => {
  if (await getUser(studentEmail)) {
    await ClassModel.updateOne(
      { teacher: teacherEmail, subject },
      { $addToSet: { students: studentEmail } },
      { upsert: true }
    );
    return { status: 200, message: "Student successfully added." };
  } else {
    return { status: 404, message: "Student not found." };
  }
};

export const removeStudentFromClass = async (
  email: string,
  subject: string
) => {
  console.log(email, subject);

  try {
    await ClassModel.updateOne({ subject }, { $pull: { students: email } });

    return { status: 200, message: "Student successfully removed." };
  } catch (err) {
    // console.log(err);

    return { status: 404, message: "Student not found." };
  }
};

export const getStudentInClass = async (subject: string) => {
  const classInfo = await ClassModel.find(
    { subject },
    { _id: 0, subject: 1, teacher: 1, students: 1 }
  );

  if (!classInfo) {
    return { status: 200, message: "Class is empty." };
  } else {
    return { [subject]: classInfo };
  }
};

export const userExists = async (email: string): Promise<Boolean> => {
  const user = await UserModel.findOne({ email });
  return !!user;
};
