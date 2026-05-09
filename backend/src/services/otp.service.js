import OTP from "../models/otp.model.js";
import { sendEmail } from "./email.service.js";
import sendSms from "./sms.service.js";

// GENERATE 6 DIGIT OTP
const generateOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// SEND OTP
const sendOtp = async ({
  identifier,
  purpose,
}) => {
  const otp = generateOtp();

  const otpExpiry = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // store raw otp
  // model pre-save hook hashes it
  await OTP.create({
    identifier,
    otp,
    purpose,
    otpExpiresAt: otpExpiry,
  });

  // email otp
  if (identifier.includes("@")) {
    await sendEmail(identifier, otp);
  }

  // sms otp
  else {
    await sendSms(identifier, otp);
  }

  return {
    success: true,
    message: "OTP sent successfully",
  };
};

// VERIFY OTP
const verifyOtp = async ({
  identifier,
  otp,
  purpose,
}) => {
  const existingOtp = await OTP.findOne({
    identifier,
    purpose,
    isUsed: false,
  }).select("+otp");

  if (!existingOtp) {
    throw new Error("Invalid or expired OTP");
  }

  // expired
  if (
    existingOtp.otpExpiresAt <
    new Date()
  ) {
    throw new Error("OTP expired");
  }

  // compare otp
  const isMatch =
    await existingOtp.isOtpCorrect(otp);

  if (!isMatch) {
    existingOtp.attempts += 1;

    await existingOtp.save();

    throw new Error("Invalid OTP");
  }

  // mark used
  existingOtp.isUsed = true;

  await existingOtp.save();

  return true;
};

export {
  sendOtp,
  verifyOtp,
};