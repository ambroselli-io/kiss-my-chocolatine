import fs from "fs";
import path from "path";
import {
  TIPIMAIL_API_USER,
  TIPIMAIL_API_KEY,
  APP_NAME,
  APP_URL,
} from "~/config.server";
import tailwindConfig from "../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig.js";
import { mapActionToShares } from "~/utils/mapActionToShares.js";
const fullConfig = resolveConfig(tailwindConfig);

export const sendEmail = async ({
  emails = ["arnaud@ambroselli.io"],
  text,
  html,
  subject,
  from,
  force = false,
}: {
  emails?: string[];
  text?: string;
  html?: string;
  subject: string;
  from?: string;
  force?: boolean;
}) => {
  if (!TIPIMAIL_API_USER || !TIPIMAIL_API_KEY) {
    console.warn(
      "TIPIMAIL_API_USER or TIPIMAIL_API_KEY not set, email will not be sent",
    );
    return;
  }
  // if (process.env.NODE_ENV !== "production" && !force) return;
  const headers: HeadersInit = {
    "X-Tipimail-ApiUser": TIPIMAIL_API_USER,
    "X-Tipimail-ApiKey": TIPIMAIL_API_KEY,
    "Content-Type": "application/json",
  };
  const response = await fetch("https://api.tipimail.com/v1/messages/send", {
    method: "POST",
    headers,
    body: JSON.stringify({
      apiKey: TIPIMAIL_API_KEY,
      to: emails.map((address) => ({ address })),
      msg: {
        from: {
          address: "arnaud@ambroselli.io",
          personalName: APP_NAME,
        },
        subject,
        text,
        html,
      },
      headers: {
        "X-TM-TRACKING": { html: { open: 0, click: 0, text: { click: 0 } } },
      },
    }),
  });
  return response.json();
};

// user is Prisma.user
export const createForgetPasswordUrl = (user: any) => {
  const url = new URL(APP_URL);
  url.pathname = "";
  url.searchParams.set("email_token", user.email_token);
  return url.toString();
};

export const createForgetPasswordEmail = (user: any) => {
  const emailAddress = user.email;
  if (!emailAddress) throw new Error("No email provided for password reset");

  const forgetPasswordLink = createForgetPasswordUrl(user);

  const text = `
Here is your ${APP_NAME} password reset link:

${forgetPasswordLink}

Click on the link above to reset your password or copy and paste it in your browser.

Sincerely yours,
The ${APP_NAME} team.

If you did not request a password reset, please ignore this email.
`.trim();

  const html = fs
    .readFileSync(
      path.join(__dirname, "../templates/forgot-password.html"),
      "utf8",
    )
    .split("{APP_NAME}")
    .join(APP_NAME)
    .split("{APP_URL}")
    .join(APP_URL)
    .replace("{FORGOT_PASSWORD}", forgetPasswordLink)
    .replace("{FORGOT_PASSWORD}", forgetPasswordLink)
    .replace("{APP_COLOR}", fullConfig.theme.extend.colors.app["500"]);

  return {
    emails: [emailAddress],
    subject: `${APP_NAME} - Reset your password`,
    text,
    html,
  };
};

export const friendToInviteEmail = (
  sender: string,
  emailAddress: string,
  chocolatineName: string,
) => {
  if (!emailAddress) throw new Error("No email provided for password reset");

  const text = `
Hello!

${sender} as invited you to join ${APP_NAME}!

Go to ${APP_URL} to create your account.

With ${APP_NAME}, you can find all the ${chocolatineName} from the world, and review them!

Remember: doing one thing for Kiss My Chocolatine rewards some shares. One review, one addition of ingredients, one new shop or one referral is different amount of shares.
The more you do, the more share you get, the more money you'll get when the company become profitable!


Sincerely yours,
Arnaud from the ${APP_NAME} team.
`.trim();

  return {
    emails: [emailAddress],

    subject: `${sender} invites you to join ${APP_NAME}!`,
    text,
  };
};

export const friendInvitedEmail = (sender: string, emailAddress: string) => {
  if (!emailAddress) throw new Error("No email provided for password reset");

  const text = `
Hello!

You invited ${emailAddress} to join ${APP_NAME}!
Good job, you earned ${mapActionToShares.USER_REFERRAL_CREATER} shares of the company!
And ${emailAddress} earned ${mapActionToShares.USER_REFERRAL_RECEIVER} share of the company.

Remember: doing one thing for Kiss My Chocolatine rewards some shares. One review, one addition of ingredients, one new shop or one referral is different amount of shares.
The more you do, the more share you get, the more money you'll get when the company become profitable!


Sincerely yours,
Arnaud from ${APP_NAME} team.
`.trim();

  return {
    emails: [sender],
    subject: `You invited ${emailAddress} to join ${APP_NAME}!`,
    text,
  };
};

export const adminEMail = (
  sender: string,
  emailAddress: string,
  adminEmail: string,
) => {
  if (!adminEmail) throw new Error("No email provided for password reset");

  const text = `
Hello!

USER_REFERRAL_CREATER: ${sender}
USER_REFERRAL_RECEIVER: ${emailAddress}

Sincerely mine,
Arnaud from ${APP_NAME} team.
`.trim();

  return {
    emails: [adminEmail],
    subject: `Invitation to join ${APP_NAME}!`,
    text,
  };
};

export const feedbackEmail = (
  feedback: string,
  emailAddress: string,
  adminEmail: string,
) => {
  if (!adminEmail) throw new Error("No email provided for password reset");

  const text = `
Hello!

Feedback from: ${emailAddress}

${feedback}

Sincerely mine,
Arnaud from ${APP_NAME} team.
`.trim();

  return {
    emails: [adminEmail],
    subject: `Feedback from ${emailAddress}!`,
    text,
  };
};
