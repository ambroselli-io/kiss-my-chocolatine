import { json, redirect } from "@remix-run/node";
import React, { useEffect, useMemo, useState } from "react";
import ShortUniqueId from "short-unique-id";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { bcrypt, crypto } from "~/services/crypto.server";
import { detect } from "detect-browser";
import { createUserSession, getUserFromCookie } from "../services/auth.server";
import { prisma } from "~/db/prisma.server";
import { getPasswordStrengthInTime } from "../utils/passwordStrength.client";
import { createForgetPasswordEmail, sendEmail } from "../services/email.server";
import Cookies from "js-cookie";
import { ModalBody, ModalRouteContainer } from "~/components/Modal";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const page = formData.get("page");
  const email = formData.get("username")?.toLocaleLowerCase?.();
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const redirectPathname = searchParams.get("redirect") || "/";
  const referralIdFromFriend =
    formData.get("referral_id") || searchParams.get("referral_id");
  searchParams.delete("redirect");

  if (!email?.length) {
    return json(
      {
        ok: false,
        errorField: "email",
        error: "No email, no chocolate.",
      },
      { status: 403 },
    );
  }

  if (page === "forgot-password") {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return json(
        {
          ok: false,
          errorField: "email",
          error:
            "This email doesn't exist in our database. Please signup instead!",
        },
        { status: 403 },
      );
    }

    const email_token = crypto.randomBytes(20).toString("hex");
    prisma.user.update({
      where: { id: user.id },
      data: {
        email_token,
        email_token_expires_at: Date.now() + 1000 * 60 * 30,
      },
    });
    sendEmail(createForgetPasswordEmail(user));
  }

  const password = formData.get("password");

  if (!password) {
    return json(
      {
        ok: false,
        errorField: "password",
        error: "Please provide a password.",
      },
      { status: 403 },
    );
  }

  if (page === "signup") {
    const username = formData.get("name");
    if (!username) {
      return json(
        {
          ok: false,
          errorField: "password",
          error: "Please provide a username.",
        },
        { status: 403 },
      );
    }
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser?.password?.length > 0) {
      return json(
        {
          ok: false,
          errorField: "email",
          error:
            "This credential is already registered in our database. Please signin instead!",
        },
        { status: 403 },
      );
    }
    const existingUsername = await prisma.user.findFirst({
      where: { username },
    });
    if (!!existingUsername) {
      return json(
        {
          ok: false,
          errorField: "username",
          error:
            "This username is already registered in our database. Please choose another one!",
        },
        { status: 403 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
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

    const redirectUrl = `${redirectPathname}?${searchParams.toString()}`;

    const cookieToSet = await createUserSession(request, user);
    return redirect(redirectUrl, {
      // we need to relad the page so that the socket is initiated with the new cookie
      headers: {
        "Set-Cookie": cookieToSet,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
  }

  if (page === "signin") {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return json(
        {
          ok: false,
          errorField: "email",
          error:
            "This email doesn't exist in our database. Please signup instead!",
        },
        { status: 403 },
      );
    }
    // test a matching password
    if (process.env.NODE_ENV === "production") {
      const passwordMatched = await bcrypt.compare(password, user.password);
      if (!passwordMatched) {
        return json(
          {
            ok: false,
            errorField: "password",
            error: "This password doesn't match!",
          },
          { status: 403 },
        );
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
    const redirectUrl = `${redirectPathname}?${searchParams.toString()}`;

    return redirect(redirectUrl, {
      // we need to relad the page so that the socket is initiated with the new cookie
      headers: {
        "Set-Cookie": cookieToSet,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
  }
  return null;
};

export const loader = async ({ request }) => {
  const user = await getUserFromCookie(request, { optional: true });
  if (!user) return null;
  return redirect("/");
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.error) alert(actionData?.error);
  }, [actionData]);

  const [chocolatineName, setChocolatineName] = useState("pain au chocolat");
  useEffect(() => {
    setChocolatineName(Cookies.get("chocolatine-name") || "pain au chocolat");
  }, []);

  const initEmail = useMemo(() => {
    if (searchParams.get("email")) {
      return searchParams.get("email");
    }
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production" && // this line to prevent ssr hydration error
      window.localStorage.getItem("email")
    ) {
      return window.localStorage.getItem("email");
    }
    return "";
  }, [searchParams]);

  const browser = useMemo(() => {
    const browser = detect();
    var isHomescreen =
      typeof window !== "undefined" &&
      (window.navigator.standalone ||
        (window.matchMedia &&
          window.matchMedia("(display-mode: standalone)").matches));

    return { ...browser, isHomescreen };
  }, []);

  const [form, setForm] = useState(() => {
    if (initEmail) return "signin";
    if (typeof window !== "undefined" && window.ENV.APP_PLATFORM === "native")
      return "signin";
    return "signup";
  });
  const [referral_id, setReferralId] = useState(null);
  useEffect(() => {
    if (window.localStorage.getItem("referral_id")) {
      setReferralId(window.localStorage.getItem("referral_id"));
    }
  }, []);

  return (
    <ModalRouteContainer aria-label="Register">
      <ModalBody>
        <div className="max-h-full w-full basis-full self-stretch overscroll-y-auto bg-white">
          <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm space-y-5">
              <div>
                <img src="/assets/marker-black.svg" className="mx-auto mb-10" />
                <h2 className="text-center text-2xl leading-9 tracking-tight text-gray-900">
                  {form === "signin" && "Sign in to your account"}
                  {form === "signup" && (
                    <>
                      All the <b>{chocolatineName}</b>
                      <br /> from the world 🌍
                    </>
                  )}
                  {form === "forgot-password" && "Forgot your password?"}
                </h2>
                {!!searchParams.get("redirect") && (
                  <div className="flex w-full justify-center">
                    <small className="text-center italic">
                      Before adding review or shop, you need to register first.
                      You'll become automatically{" "}
                      <a
                        href="/about-one-action-one-share"
                        className="inline-flex items-center gap-x-1 font-medium underline decoration-[#FFBB01] !opacity-100"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        a shareholder{" "}
                        <ArrowTopRightOnSquareIcon className="inline-block h-3 w-3" />
                      </a>{" "}
                      of Kiss&nbsp;my&nbsp;Chocolatine!&nbsp;🤑
                    </small>
                  </div>
                )}
              </div>
              <Form
                className="space-y-6"
                method="POST"
                onSubmit={(e) => {
                  // save email in localstorage
                  window.localStorage.setItem("email", e?.target?.email?.value);
                }}
              >
                <input type="hidden" name="page" value={form} />
                {!!referral_id && (
                  <input type="hidden" name="referral_id" value={referral_id} />
                )}
                <ClientOnly>
                  {() => (
                    <>
                      <input
                        type="hidden"
                        name="is_mobile"
                        value={window.innerWidth <= 640}
                      />
                      <input
                        type="hidden"
                        name="is_homescreen"
                        value={browser.isHomescreen}
                      />
                      <input
                        type="hidden"
                        name="is_app"
                        value={window.ENV.APP_PLATFORM === "native"}
                      />
                      <input
                        type="hidden"
                        name="browser_type"
                        value={browser.type}
                      />
                      <input
                        type="hidden"
                        name="browser_name"
                        value={browser.name}
                      />
                      <input
                        type="hidden"
                        name="browser_version"
                        value={browser.version}
                      />
                      <input
                        type="hidden"
                        name="browser_os"
                        value={browser.os}
                      />
                    </>
                  )}
                </ClientOnly>

                <div className="relative -space-y-px rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300" />
                  <div>
                    <label htmlFor="email-address" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email-address"
                      name="username"
                      type="email"
                      autoComplete="username"
                      required
                      defaultValue={initEmail}
                      className={[
                        "relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6",
                        form === "forgot-password" ? "rounded-b-md" : "",
                      ].join(" ")}
                      placeholder="Email address"
                    />
                  </div>
                  {form === "signup" && (
                    <div>
                      <label htmlFor="name" className="sr-only">
                        Pseudo (for showing on reviews)
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6"
                        placeholder="Pseudo"
                      />
                    </div>
                  )}
                  {form !== "forgot-password" && (
                    <div className="relative">
                      <label htmlFor="password" className="sr-only">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={[
                          "relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6",
                          form === "signin" ? "rounded-b-md" : "",
                        ].join(" ")}
                        placeholder="Password"
                      />
                      {form === "signup" && (
                        <div className="absolute -right-2 bottom-0">
                          <p className="mb-0 px-3 text-[8px] italic text-gray-500">
                            {!!password.length &&
                              getPasswordStrengthInTime(password)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    {form === "signup" && (
                      <>
                        <input
                          id="accept-conditions"
                          name="accept-conditions"
                          type="checkbox"
                          required
                          className="mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-gray-700"
                        />
                        <label
                          htmlFor="accept-conditions"
                          className="ml-3 block text-xs text-gray-500"
                        >
                          I accept the terms and conditions: no ad cookie, no
                          spam. Maybe event ads later on. No sharing of your
                          data with third parties. Never ever. And you are
                          shareholder of Kiss&nbsp;my&nbsp;Chocolatine.
                        </label>
                      </>
                    )}
                  </div>

                  <div className="text-sm leading-6">
                    <div className="font-semibold text-gray-900 hover:text-gray-700">
                      {form === "signin" && (
                        <a
                          className="underline"
                          href="mailto:kiss.my.chocolatine@gmail.com?subject=Forgot%20my%password"
                        >
                          Forgot password?
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
                  >
                    {form === "signin" && "Sign in"}
                    {form === "signup" && "Sign up"}
                    {form === "forgot-password" && "Send reset link"}
                  </button>
                </div>
              </Form>

              <p className="text-center text-sm leading-6 text-gray-500">
                {form === "signin" && "Don't have an account?"}
                {form === "signup" && "Already have an account?"}
                {form === "forgot-password" && "Remember your password?"}{" "}
                <button
                  className="font-semibold text-gray-900 hover:text-gray-700"
                  onClick={() =>
                    setForm(form === "signin" ? "signup" : "signin")
                  }
                >
                  {form === "signin"
                    ? "Sign up to Kiss my Chocolatine"
                    : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </ModalBody>
    </ModalRouteContainer>
  );
}
