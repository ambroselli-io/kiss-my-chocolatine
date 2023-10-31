import ShortUniqueId from "short-unique-id";
import { bcrypt, crypto } from "~/services/crypto.server";
import { createUserSession } from "./auth.server";
import { prisma } from "~/db/prisma.server";
import { createForgetPasswordEmail, sendEmail } from "./email.server";
import type { ActionFunction, ActionFunctionArgs } from "@remix-run/node";

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
   // all strings
  const formData = await request.formData() as
  const page = formData.get("page");
  const email = formData.get("username")?.toLocaleLowerCase?.();
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const referralIdFromFriend =
    formData.get("referral_id") || searchParams.get("referral_id");
  searchParams.delete("redirect");

  if (!email?.length) {
    return [
      {
        ok: false,
        errorField: "email",
        error: "No email, no chocolate.",
      },
      { status: 403 },
    ];
  }

  if (page === "forgot-password") {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return [
        {
          ok: false,
          errorField: "email",
          error:
            "This email doesn't exist in our database. Please signup instead!",
        },
        { status: 403 },
      ];
    }

    const email_token = crypto.randomBytes(20).toString("hex");
    prisma.user.update({
      where: { id: user.id },
      data: {
        email_token,
        email_token_expires_at: new Date(Date.now() + 1000 * 60 * 30),
      },
    });
    sendEmail(createForgetPasswordEmail(user));
  }

  const password = formData.get("password");

  if (!password) {
    return [
      {
        ok: false,
        errorField: "password",
        error: "Please provide a password.",
      },
      { status: 403 },
    ];
  }

  if (page === "signup") {
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (!!existingUser?.password?.length) {
      return [
        {
          ok: false,
          errorField: "email",
          error:
            "This credential is already registered in our database. Please signin instead!",
        },
        { status: 403 },
      ];
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        referral_id: new ShortUniqueId({ length: 6 }).randomUUID(),
      },
    });
    const is_mobile = formData.get("is_mobile");
    const is_homescreen = formData.get("is_homescreen");
    const is_app = formData.get("is_app");
    const browser_type = formData.get("browser_type");
    const browser_name = formData.get("browser_name");
    const browser_version = formData.get("browser_version");
    const browser_os = formData.get("browser_os");
    const unique_key = `${user.id}-${is_mobile}-${is_homescreen}-${browser_type}-${browser_name}-${browser_os}`;
    await prisma.userOs.upsert({
      where: {
        unique_key,
      },
      create: {
        user_id: user.id,
        is_mobile: is_mobile === "true" ? true : false,
        is_homescreen: is_homescreen === "true" ? true : false,
        is_app: is_app === "true" ? true : false,
        browser_type,
        browser_name,
        browser_version,
        browser_os,
        unique_key,
      },
      update: {
        browser_version,
      },
    });
    if (referralIdFromFriend) {
      const friend = await prisma.user.findFirst({
        where: { referral_id: referralIdFromFriend },
      });
      if (friend) {
        await prisma.userAction.upsert({
          where: {
            id: `${friend.id}-${user.id}`,
          },
          create: {
            id: `${friend.id}-${user.id}`,
            user_id: friend.id,
            action: "USER_REFERRAL_CREATER",
            shares: 1,
            created_at: new Date(),
          },
        });
        await prisma.userAction.upsert({
          where: {
            id: `${user.id}-${friend.id}`,
          },
          create: {
            id: `${friend.id}-${user.id}`,
            user_id: friend.id,
            action: "USER_REFERRAL_RECEIVER",
            shares: 1,
            created_at: new Date(),
          },
        });
      }
      searchParams.delete("referral_id");
    }

    const cookieToSet = await createUserSession(request, user);
    return [
      {
        ok: true,
      },
      {
        headers: {
          "Set-Cookie": cookieToSet,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      },
    ];
  }

  if (page === "signin") {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return [
        {
          ok: false,
          errorField: "email",
          error:
            "This email doesn't exist in our database. Please signup instead!",
        },
        { status: 403 },
      ];
    }
    // test a matching password
    if (process.env.NODE_ENV === "production") {
      const passwordMatched = await bcrypt.compare(password, user.password);
      if (!passwordMatched) {
        return [
          {
            ok: false,
            errorField: "password",
            error: "This password doesn't match!",
          },
          { status: 403 },
        ];
      }
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        last_login_at: new Date(),
      },
    });
    const is_mobile = formData.get("is_mobile");
    const is_homescreen = formData.get("is_homescreen");
    const browser_type = formData.get("browser_type");
    const browser_name = formData.get("browser_name");
    const browser_version = formData.get("browser_version");
    const browser_os = formData.get("browser_os");
    const unique_key = `${user.id}-${is_mobile}-${is_homescreen}-${browser_type}-${browser_name}-${browser_os}`;

    await prisma.userOs.upsert({
      where: {
        unique_key,
      },
      create: {
        user_id: user.id,
        is_mobile: is_mobile === "true" ? true : false,
        is_homescreen: is_homescreen === "true" ? true : false,
        browser_type,
        browser_name,
        browser_version,
        browser_os,
        unique_key,
      },
      update: {
        browser_version,
      },
    });
    const cookieToSet = await createUserSession(request, user);

    return [
      {
        ok: true,
      },
      {
        headers: {
          "Set-Cookie": cookieToSet,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      },
    ];
  }
  return [
    {
      ok: false,
      errorField: "page",
      error: "No page.",
    },
    { status: 403 },
  ];
};
