import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { APP_NAME, SECRET } from "~/config.server";
import { prisma } from "~/db/prisma.server";
import * as Sentry from "@sentry/remix";

const sessionExpirationTime = 1000 * 60 * 60 * 24 * 365 * 10; // 10 years

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: `${APP_NAME.split(" ").join("_")}_session`,
      secrets: [SECRET],
      sameSite: "lax",
      path: "/",
      maxAge: sessionExpirationTime / 1000,
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
    },
  });

export const getUserFromCookie = async (
  request,
  { failureRedirect = "/", successRedirect = null, optional = false } = {},
) => {
  const userId = await getUserIdFromCookie(request, { optional: true });
  if (!userId) {
    if (optional) return null;
    throw redirect(failureRedirect);
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      password: false,
      id: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
      last_login_at: true,
      last_seen_at: true,
      email: true,
      admin: true,
      username: true,
      email_token: true,
      email_token_expires_at: true,
      email_verified: true,
    },
  });
  if (user && !user.deleted_at) {
    Sentry.setUser({ id: userId, username: user.username });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        last_seen_at: new Date(),
      },
    });
    if (successRedirect) return redirect(successRedirect);
    return user;
  }
  if (optional) return null;
  throw redirect(failureRedirect);
};

export const getUserIdFromCookie = async (
  request,
  { failureRedirect = "/", optional = false } = {},
) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session) {
    if (optional) return null;
    throw redirect(failureRedirect);
  }
  const userId = session.get("userId");
  if (!userId) {
    if (optional) return null;
    throw redirect(failureRedirect);
  }
  Sentry.setUser({ id: userId });
  return userId;
};

export const getUserEmailFromCookie = async (
  request,
  { failureRedirect = "/", optional = false } = {},
) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session) {
    if (optional) return null;
    throw redirect(failureRedirect);
  }
  const userEmail = session.get("userEmail");
  if (!userEmail) {
    if (optional) return null;
    throw redirect(failureRedirect);
  }
  Sentry.setUser({ email: userEmail });
  return userEmail;
};

export const getUnauthentifiedUserFromCookie = (request) =>
  getUserFromCookie(request, { optional: true });

export const createUserSession = async (request, user, failureRedirect) => {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", user.id);
  session.set("userEmail", user.email);
  await prisma.user.update({
    where: { id: user.id },
    data: { last_login_at: new Date() },
  });
  if (!failureRedirect) return await commitSession(session);
  return redirect(failureRedirect, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
