import { OtpModel } from "../Database/Schemas/otps.models";
import { setEmailVerified } from "./password.jwt";

export const matchOtp = async (email: string, otp: string) => {
  const otpDb = await OtpModel.findOne({ email });

  if (!otpDb)
    return { status: 400, message: "Please get the otp before verifying" };

  if (otpDb.otp != otp) return { status: 401, message: "Incorrect Otp." };

  return await setEmailVerified(email);
};
