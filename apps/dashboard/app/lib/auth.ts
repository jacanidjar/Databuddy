import { auth } from "@databuddy/auth";
import { cache } from "react";
import { headers } from "next/headers";

export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers()
  });
});

export const getUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  return session.user;
}); 