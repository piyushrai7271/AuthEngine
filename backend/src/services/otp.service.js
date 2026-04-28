import OTP from "../models/otp.model.js";
import {sendEmail} from "./email.service.js";
import sendSms from "./sms.service.js";
import bcrypt from "bcrypt";

// generate 6 digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//  send OTP (main function)
const sendOtp = async ({ identifier, purpose }) => {
  const otp = generateOtp();

  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  //  store RAW otp → model will hash it
  await OTP.create({
    identifier,
    otp,
    purpose,
    otpExpiresAt: otpExpiry,
  });

  if (identifier.includes("@")) {
    await sendEmail(identifier, otp);
  } else {
    await sendSms(identifier, otp);
  }

  return {
    success: true,
    message: "OTP sent successfully",
  };
};

//  verify OTP
const verifyOtp = async ({ identifier, otp, purpose }) => {
  const existingOtp = await OTP.findOne({
    identifier,
    purpose,
    isUsed: false,
  }).select("+otp");

  if (!existingOtp) {
    throw new Error("Invalid or expired OTP");
  }

  if (existingOtp.otpExpiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  //  use model method
  const isMatch = await existingOtp.isOtpCorrect(otp);

  if (!isMatch) {
    existingOtp.attempts += 1;
    await existingOtp.save();
    throw new Error("Invalid OTP");
  }

  existingOtp.isUsed = true;
  await existingOtp.save();

  return true;
};

export {
  sendOtp,
  verifyOtp
}