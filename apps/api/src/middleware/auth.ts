import { createMiddleware } from 'hono/factory'
import { auth } from "@databuddy/auth"

// const auth = betterAuth({
//   baseURL: process.env.BETTER_AUTH_URL,
//   handler: {
//     onError: (error: Error) => {
//       console.error('Auth error:', error)
//       return new Response('Unauthorized', { status: 401 })
//     }
//   }
// })

export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    const session = await auth.api.getSession({ 
      headers: c.req.raw.headers 
    });

    if (!session) {
      c.set('user', null);
      c.set('session', null);
      return next();
    }

    c.set('user', session.user);
    c.set('session', session);
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return new Response('Authentication service error', { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}) 