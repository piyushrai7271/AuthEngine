import nodemailer from "nodemailer";
import { Resend } from "resend";

// OTP EMAIL
const sendEmail = async (email, otp) => {
  try {
    console.log("=================================");
    console.log("EMAIL SERVICE STARTED");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Sending OTP email to:", email);
    console.log("=================================");

    // ==============================
    // PRODUCTION → RESEND
    // ==============================
    if (process.env.NODE_ENV === "production") {
      console.log("Using RESEND service");

      console.log(
        "RESEND_API_KEY exists:",
        !!process.env.RESEND_API_KEY
      );

      const resend = new Resend(process.env.RESEND_API_KEY);

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

      console.log("=================================");
      console.log("RESEND EMAIL SUCCESS");
      console.log("Response:", response);
      console.log("=================================");

      return response;
    }

    // ==============================
    // DEVELOPMENT → NODEMAILER
    // ==============================
    console.log("Using NODEMAILER service");

    console.log(
      "EMAIL_USER exists:",
      !!process.env.EMAIL_USER
    );

    console.log(
      "EMAIL_PASS exists:",
      !!process.env.EMAIL_PASS
    );

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // verify transporter
    await transporter.verify();

    console.log("NODEMAILER transporter verified");

    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "AuthSystem"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    console.log("=================================");
    console.log("NODEMAILER EMAIL SUCCESS");
    console.log("Message ID:", info.messageId);
    console.log("=================================");

    return info;

  } catch (error) {
    console.log("=================================");
    console.error("EMAIL SEND ERROR");
    console.error("Full Error:", error);

    // resend specific error
    if (error?.message) {
      console.error("Error Message:", error.message);
    }

    if (error?.name) {
      console.error("Error Name:", error.name);
    }

    if (error?.response) {
      console.error("Error Response:", error.response);
    }

    if (error?.response?.data) {
      console.error("Error Response Data:", error.response.data);
    }

    if (error?.statusCode) {
      console.error("Status Code:", error.statusCode);
    }

    console.log("=================================");

    throw new Error("Failed to send email OTP");
  }
};

// SECURITY ALERT EMAIL
const sendSecurityAlert = async (email) => {
  try {
    console.log("=================================");
    console.log("SECURITY ALERT EMAIL STARTED");
    console.log("Sending security alert to:", email);
    console.log("=================================");

    const message = `
      Your password has been changed successfully.

      If this was NOT you, please contact support immediately.
    `;

    // ==============================
    // PRODUCTION → RESEND
    // ==============================
    if (process.env.NODE_ENV === "production") {
      console.log("Using RESEND for security alert");

      const resend = new Resend(process.env.RESEND_API_KEY);

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

      console.log("=================================");
      console.log("RESEND SECURITY EMAIL SUCCESS");
      console.log("Response:", response);
      console.log("=================================");

      return response;
    }

    // ==============================
    // DEVELOPMENT → NODEMAILER
    // ==============================
    console.log("Using NODEMAILER for security alert");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    console.log("NODEMAILER transporter verified");

    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "AuthSystem"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Security Alert: Password Changed",
      text: message,
    });

    console.log("=================================");
    console.log("NODEMAILER SECURITY EMAIL SUCCESS");
    console.log("Message ID:", info.messageId);
    console.log("=================================");

    return info;

  } catch (error) {
    console.log("=================================");
    console.error("SECURITY EMAIL ERROR");
    console.error("Full Error:", error);

    if (error?.message) {
      console.error("Error Message:", error.message);
    }

    if (error?.response) {
      console.error("Error Response:", error.response);
    }

    if (error?.response?.data) {
      console.error("Error Response Data:", error.response.data);
    }

    console.log("=================================");
  }
};

export { sendEmail, sendSecurityAlert };














// import nodemailer from "nodemailer";
// import { Resend } from "resend";

// //  OTP EMAIL
// const sendEmail = async (email, otp) => {
//   try {
//     if (process.env.NODE_ENV === "production") {
//       const resend = new Resend(process.env.RESEND_API_KEY);

//       await resend.emails.send({
//         from: `${process.env.APP_NAME || "AuthSystem"} <onboarding@resend.dev>`,
//         to: email,
//         subject: "Your OTP Code",
//         html: `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
//       });

//       return;
//     }

//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"${process.env.APP_NAME || "AuthSystem"}" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
//     });

//   } catch (error) {
//     console.error("Email send error:", error);
//     throw new Error("Failed to send email OTP");
//   }
// };

// // ✅ SECURITY ALERT EMAIL (NEW)
// const sendSecurityAlert = async (email) => {
//   try {
//     const message = `
//       Your password has been changed successfully.

//       If this was NOT you, please contact support immediately.
//     `;

//     if (process.env.NODE_ENV === "production") {
//       const resend = new Resend(process.env.RESEND_API_KEY);

//       await resend.emails.send({
//         from: `${process.env.APP_NAME || "AuthSystem"} <onboarding@resend.dev>`,
//         to: email,
//         subject: "Security Alert: Password Changed",
//         html: `<p><b>Your password has been changed.</b></p>
//                <p>If this was not you, contact support immediately.</p>`,
//       });

//       return;
//     }

//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"${process.env.APP_NAME || "AuthSystem"}" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Security Alert: Password Changed",
//       text: message,
//     });

//   } catch (error) {
//     console.error("Security email error:", error);
//   }
// };

// export { sendEmail, sendSecurityAlert };











