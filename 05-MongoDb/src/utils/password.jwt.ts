import {
  Result,
  Role,
  ServerResponse,
  Student,
  Teacher,
  UserSignIn,
} from "../interface/interface";
import bcrypt from "bcrypt";
import { UserModel } from "../Database/Schemas/user.model";

export async function checkPassword(
  user: UserSignIn
): Promise<ServerResponse | Teacher | Result> {
  const result = await UserModel.findOne({ email: user.email });

  if (!result)
    return { status: 400, message: "Please signup before logging in." };

  // just to start it with a random value
  const passwordMatched = await bcrypt.compare(
    user.password,
    (result as Teacher | Student).password
  );

  if (passwordMatched) {
    return {
      status: 200,
      data: result,
    };
  } else {
    return { status: 400, message: "Invalid Credentials" };
  }
}

export async function setEmailVerified(email: string) {
  try {
    await UserModel.updateOne({ email }, { emailVerified: true });
    return { status: 200, message: "Email Verified." };
  } catch (err) {
    return { status: 404, message: "User not found." };
  }
}

export const updatePassword = async (email: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await UserModel.updateOne({ email }, { password: hashedPassword });

  return { status: 200, message: "Password Updated" };
};
