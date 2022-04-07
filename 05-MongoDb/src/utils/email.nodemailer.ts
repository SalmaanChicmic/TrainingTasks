import nodemailer from "nodemailer";
import process from "../../config";
import { renderEmail, renderForgotPassEmail } from "../template/email.template";

export async function sendEmailToAddress(
  email: string,
  otp: string
): Promise<boolean> {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  //   let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    //@ts-ignore
    host: process.env.SMTP,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SENDINBLUE_LOGIN, // generated ethereal user
      pass: process.env.SENDINBLUE_KEY, // generated ethereal password
    },
  });

  try {
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Salmaan" <student@portal.com>', // sender address
      to: email,
      subject: "Email Verification", // Subject line
      text: "Hello world", // plain text body
      html: renderEmail(otp), // html body
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
}

export const sendTokenToMail = async (email: string, token: string) => {
  let transporter = nodemailer.createTransport({
    //@ts-ignore
    host: process.env.SMTP,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SENDINBLUE_LOGIN, // generated ethereal user
      pass: process.env.SENDINBLUE_KEY, // generated ethereal password
    },
  });

  try {
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Salmaan" <student@portal.com>', // sender address
      to: email,
      subject: "Forgot password link", // Subject line
      text: "Hello world", // plain text body
      html: renderForgotPassEmail(token), // html body
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (err) {
    return false;
  }
};
