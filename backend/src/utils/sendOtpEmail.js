import nodemailer from "nodemailer";

let transporter;

const SMTP_CONNECTION_TIMEOUT_MS = Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000);
const SMTP_SOCKET_TIMEOUT_MS = Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000);
const SMTP_GREETING_TIMEOUT_MS = Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000);
const SMTP_SEND_TIMEOUT_MS = Number(process.env.SMTP_SEND_TIMEOUT_MS || 15000);

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
  const hasValidSmtp = Boolean(SMTP_HOST && SMTP_PORT && !hasPlaceholderCreds(SMTP_USER, SMTP_PASS));

  if (!hasValidSmtp) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.");
    }

    console.warn("SMTP not configured, using dev OTP fallback (jsonTransport).");
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendOtpEmail(email, otp) {
  const subject = "BidVault OTP Verification";
  const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:540px">
        <h2>Verify your BidVault account</h2>
        <p>Your one-time password is:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:4px;margin:12px 0">${otp}</div>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

  await sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetOtpEmail(email, otp) {
  const subject = "BidVault Password Reset OTP";
  const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:540px">
        <h2>Reset your BidVault password</h2>
        <p>Your password reset OTP is:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:4px;margin:12px 0">${otp}</div>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;

  await sendEmail({ to: email, subject, html });
}

export async function sendAdminApprovalEmail(email, name = "there") {
  const subject = "BidVault accepted your admin request";
  const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:560px">
        <h2 style="margin-bottom:12px;">Congratulations ${name},</h2>
        <p>Your admin request has been approved by BidVault.</p>
        <p>You can now log in from the login page and access the admin dashboard.</p>
        <p style="margin-top:16px;"><b>Next Step:</b> Open BidVault and sign in with your registered email and password.</p>
        <p style="margin-top:20px;">Regards,<br/>BidVault Team</p>
      </div>
    `;

  await sendEmail({ to: email, subject, html });
}

export async function sendWelcomeEmail(email, name = "there") {
  const subject = "Welcome to BidVault";
  const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:560px">
        <h2 style="margin-bottom:12px;">Welcome ${name},</h2>
        <p>Your BidVault account is now active and ready to use.</p>
        <p>You can now sign in, explore auctions, and start bidding or listing items.</p>
        <p style="margin-top:16px;"><b>Tip:</b> Complete your profile and enable notifications for a better auction experience.</p>
        <p style="margin-top:20px;">Regards,<br/>BidVault Team</p>
      </div>
    `;

  await sendEmail({ to: email, subject, html });
}

async function sendEmail({ to, subject, html }) {
  const mailFrom = String(process.env.MAIL_FROM || "").trim();
  const mailFromLower = mailFrom.toLowerCase();
  const mailFromLooksInvalid =
    !mailFrom ||
    mailFromLower.includes("no-reply@bidvault.local") ||
    mailFromLower.includes("@smtp-brevo.com");

  const mailer = await getTransporter();

  if (!mailer.options.jsonTransport && mailFromLooksInvalid) {
    throw new Error(
      "MAIL_FROM must be a verified sender email (for Brevo, do not use the @smtp-brevo.com login as From address)."
    );
  }

  const from = mailFrom || "BidVault <no-reply@bidvault.local>";

  const mailOptions = {
    from,
    to,
    subject,
    html,
  };

  try {
    const sendPromise = mailer.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("OTP email request timed out. Please verify SMTP settings and network connectivity."));
      }, SMTP_SEND_TIMEOUT_MS);
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);

    if (mailer.options.jsonTransport) {
      console.log("Email (dev fallback):", info.message);
    }
    return;
  } catch (error) {
    transporter = null;
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}
