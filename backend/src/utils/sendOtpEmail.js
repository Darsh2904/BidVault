import nodemailer from "nodemailer";

let transporter;

function hasPlaceholderCreds(user, pass) {
  const normalizedUser = String(user || "").toLowerCase();
  const normalizedPass = String(pass || "").toLowerCase();

  return (
    !normalizedUser ||
    !normalizedPass ||
    normalizedUser.includes("your_email") ||
    normalizedUser.includes("example.com") ||
    normalizedPass.includes("your_email_password") ||
    normalizedPass.includes("app_password")
  );
}

async function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || hasPlaceholderCreds(SMTP_USER, SMTP_PASS)) {
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendOtpEmail(email, otp) {
  const from = process.env.MAIL_FROM || "BidVault <no-reply@bidvault.local>";
  const mailOptions = {
    from,
    to: email,
    subject: "BidVault OTP Verification",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:540px">
        <h2>Verify your BidVault account</h2>
        <p>Your one-time password is:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:4px;margin:12px 0">${otp}</div>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  const mailer = await getTransporter();

  try {
    const info = await mailer.sendMail(mailOptions);

    if (mailer.options.jsonTransport) {
      console.log("OTP email (dev fallback):", info.message);
    }
    return;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    console.warn("SMTP failed, switching to dev OTP fallback:", error.message);
    transporter = nodemailer.createTransport({ jsonTransport: true });
    const fallbackInfo = await transporter.sendMail(mailOptions);
    console.log("OTP email (dev fallback):", fallbackInfo.message);
  }
}
