import twilio from "twilio";

const sendSms = async (
  mobileNumber,
  otp
) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = `
      Your OTP is ${otp}.
      Valid for 10 minutes.
    `;

    await client.messages.create({
      body: message,
      from:
        process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobileNumber}`,
    });
  } catch (error) {
    console.error(
      "SMS SEND ERROR:",
      error.message
    );

    throw new Error(
      "Failed to send SMS OTP"
    );
  }
};

export default sendSms;