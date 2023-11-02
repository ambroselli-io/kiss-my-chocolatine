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
  if (process.env.NODE_ENV !== "production" && !force) return;
  const headers: HeadersInit = {
    "X-Tipimail-ApiUser": TIPIMAIL_API_USER,
    "X-Tipimail-ApiKey": TIPIMAIL_API_KEY,
    "Content-Type": "application/json",
  };
  return fetch("https://api.tipimail.com/v1/messages/send", {
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
