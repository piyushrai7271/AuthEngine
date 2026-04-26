import nodemailer from "nodemailer";
import { Resend } from "resend";

const sendEmail = async (email, otp) => {
  try {
    // 👉 use Resend in production
    if (process.env.NODE_ENV === "production") {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: `${process.env.APP_NAME || "AuthSystem"} <onboarding@resend.dev>`,
        to: email,
        subject: "Your OTP Code",
        html: `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });

      return;
    }

    // 👉 fallback: local SMTP (for development)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.APP_NAME || "AuthSystem"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email OTP");
  }
};

export default sendEmail;














// import nodemailer from "nodemailer";

// const sendEmail = async (email, otp) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"${process.env.APP_NAME || "AuthSystem"}" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Email send error:", error);
//     throw new Error("Failed to send email OTP");
//   }
// };

// export default sendEmail;