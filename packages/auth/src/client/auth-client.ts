"use client"

import { createAuthClient } from "better-auth/react"
import { customSessionClient, twoFactorClient, organizationClient, emailOTPClient, magicLinkClient, multiSessionClient } from "better-auth/client/plugins";
import type { auth } from "../auth";
import type { AuthUser } from "../types";
import type { Role } from "@databuddy/db";

// Define a type for the auth client configuration
export type AuthClientConfig = {
  baseURL?: string;
  debug?: boolean;
};

// Default configuration that can be overridden
const defaultConfig: AuthClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string,
  debug: process.env.NODE_ENV !== "production",
};

// Helper function to safely access localStorage
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

// Create a singleton instance with the default configuration
export const authClient = createAuthClient({
  baseURL: defaultConfig.baseURL,
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => {
        const storage = getLocalStorage();
        return storage ? storage.getItem("authToken") || "" : "";
      },
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token")
      console.log(authToken);
      if(authToken){
        const storage = getLocalStorage();
        console.log(storage);
        if (storage) {
          console.log("setting auth token");
          storage.setItem("authToken", authToken);
        }
      }
    },
  },
  plugins: [ 
    customSessionClient<typeof auth>(),
    twoFactorClient(),
    multiSessionClient(),
    emailOTPClient(),
    magicLinkClient(),
  ],
});

const signIn = authClient.signIn;
const signUp = authClient.signUp;
const signOut = authClient.signOut;
const useSession = authClient.useSession;
const getSession = authClient.getSession;

export { signIn, signUp, signOut, useSession, getSession };

export function hasRole(user: AuthUser | null | undefined, role: Role | Role[]) {
  if (!user) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role as Role);
}