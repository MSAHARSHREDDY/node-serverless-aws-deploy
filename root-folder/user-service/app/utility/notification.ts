import twilio from "twilio";

const accountSid = process.env.accountSid;
const authToken = process.env.authToken;


const client = twilio(accountSid, authToken);

export const GenerateAccessCode = () => {
  const code = Math.floor(10000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return { code, expiry };
};

export const SendVerificationCode = async (
  code: number,
  toPhoneNumber: string
) => {
  const response = await client.messages.create({
    body: `Your verification code is ${code} it will expire within 30 minutes.`,
    from: "+14016818135",
    to: toPhoneNumber.trim(),
  });
  console.log(response);
  return response;
};
