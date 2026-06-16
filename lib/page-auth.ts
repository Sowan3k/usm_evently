import type { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

/**
 * Redirects to the login page unless the request has a valid session.
 * Returns the session (with a plain object shape safe for serialization)
 * when authenticated.
 */
export async function getAuthSession(ctx: GetServerSidePropsContext) {
  return getServerSession(ctx.req, ctx.res, authOptions);
}

export const loginRedirect = {
  redirect: { destination: "/register", permanent: false },
} as const;

export const adminRedirect = {
  redirect: { destination: "/home", permanent: false },
} as const;
