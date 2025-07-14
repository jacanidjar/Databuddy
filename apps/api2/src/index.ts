import { Elysia } from "elysia";
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createTRPCContext } from '@databuddy/rpc';
import { query } from "./routes/query";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(cors({
    credentials: true,
    origin: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://staging.databuddy.cc',
    // origin: (origin) => ['http://localhost:3000', 'https://staging.databuddy.cc'].includes(origin ?? '') ? origin : false
  }))
  .use(query)
  .all('/trpc/*', async ({ request }) => {
    return fetchRequestHandler({
      endpoint: '/trpc',
      router: appRouter,
      req: request,
      createContext: () => createTRPCContext({ headers: request.headers }),
    });
  })
  .onError(({ error, code }) => {
    console.error(error);
    return { success: false, code };
  })

export default {
  fetch: app.fetch,
  port: 3001
}