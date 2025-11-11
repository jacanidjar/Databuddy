import { auth, type User } from "@databuddy/auth";
import { db } from "@databuddy/db";
import { os as createOS, ORPCError } from "@orpc/server";

export const createRPCContext = (opts: { headers: Headers }) => ({
    db,
    auth,
    headers: opts.headers,
});

export type BaseContext = ReturnType<typeof createRPCContext>;

type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;

export type Context = BaseContext & {
    session: NonNullable<SessionData>["session"];
    user: User;
};

const os = createOS.$context<BaseContext>();

export const publicProcedure = os;

export const protectedProcedure = os.use(async ({ context, next }) => {
    const sessionData = await auth.api.getSession({
        headers: context.headers,
    });

    if (!(sessionData?.session && sessionData?.user)) {
        throw new ORPCError("UNAUTHORIZED");
    }

    return next({
        context: {
            ...context,
            session: sessionData.session,
            user: sessionData.user,
        },
    });
});

export const adminProcedure = protectedProcedure.use(({ context, next }) => {
    if (context.user.role !== "ADMIN") {
        throw new ORPCError("FORBIDDEN", {
            message: "You do not have permission to access this resource",
        });
    }

    return next({ context });
});

export { os };
