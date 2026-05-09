import nodemailer from "nodemailer";
import { Resend } from "resend";

// EMAIL SERVICE

// reusable resend instance
const resend =
  process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// reusable nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//  OTP EMAIL
const sendEmail = async (email, otp) => {
  try {
    // PRODUCTION → RESEND
    if (process.env.NODE_ENV === "production") {
      if (!resend) {
        throw new Error("RESEND_API_KEY is missing");
      }

      const response = await resend.emails.send({
        from: `${process.env.APP_NAME || "AuthSystem"} <onboarding@resend.dev>`,
        to: email,
        subject: "Your OTP Code",
        html: `
          <div>
            <h2>Your OTP Code</h2>
            <p>Your OTP is <b>${otp}</b></p>
            <p>It is valid for 10 minutes.</p>
          </div>
        `,
      });

      // resend returns error object instead of throwing
      if (response?.error) {
        console.error("RESEND EMAIL ERROR:", response.error);

        throw new Error(response.error.message);
      }

      return response;
    }

    // DEVELOPMENT → NODEMAILER
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "AuthSystem"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    return info;
  } catch (error) {
    console.error("EMAIL SEND ERROR:", error.message);

    throw new Error("Failed to send email OTP");
  }
};

// SECURITY ALERT EMAIL
const sendSecurityAlert = async (email) => {
  try {
    const message = `
      Your password has been changed successfully.

      If this was NOT you, please contact support immediately.
    `;

    // PRODUCTION → RESEND
    if (process.env.NODE_ENV === "production") {
      if (!resend) {
        throw new Error("RESEND_API_KEY is missing");
      }

      const response = await resend.emails.send({
        from: `${process.env.APP_NAME || "AuthSystem"} <onboarding@resend.dev>`,
        to: email,
        subject: "Security Alert: Password Changed",
        html: `
          <div>
            <h2>Security Alert</h2>
            <p><b>Your password has been changed.</b></p>
            <p>If this was not you, contact support immediately.</p>
          </div>
        `,
      });

      // resend returns error object instead of throwing
      if (response?.error) {
        console.error("RESEND SECURITY EMAIL ERROR:", response.error);

        throw new Error(response.error.message);
      }

      return response;
    }

    // DEVELOPMENT → NODEMAILER
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "AuthSystem"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Security Alert: Password Changed",
      text: message,
    });

    return info;
  } catch (error) {
    console.error("SECURITY EMAIL ERROR:", error.message);
  }
};

export { sendEmail, sendSecurityAlert };