import { betterAuth } from "better-auth";
import { db } from "@databuddy/db";
import { getRedisCache } from "@databuddy/redis";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

const redisCache = getRedisCache();

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    appName: "databuddy.cc",
    advanced: {
        crossSubDomainCookies: {
            enabled: isProduction(),
            domain: ".databuddy.cc"
        },
        cookiePrefix: "databuddy",
        useSecureCookies: isProduction()
    },
    trustedOrigins: [
        'https://databuddy.cc',
        'https://app.databuddy.cc',
        'https://api.databuddy.cc'
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        }
    },
    secondaryStorage: {
        get: async (key) => {
            const value = await redisCache.get(key);
            return value ? value : null;
        },
        set: async (key, value, ttl) => {
            if (ttl) await redisCache.setex(key, ttl, value);
            else await redisCache.set(key, value);
        },
        delete: async (key) => {
            await redisCache.del(key);
        },
    },
    
})

export type User = (typeof auth)["$Infer"]["Session"]["user"];
export type Session = (typeof auth)["$Infer"]["Session"];
