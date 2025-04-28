import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth, type AuthUser, type SessionData } from '@databuddy/auth';
import basketRouter from './routes/basket';
import analyticsRouter from './routes/analytics';
import { logger } from './lib/logger';

// Define the Hono app with typed context
type AppVariables = {
  Variables: {
    user: AuthUser; // Replace 'any' with your actual user type
    session: SessionData; // Replace 'any' with your actual session type
  }
}

const app = new Hono<AppVariables>();

// Configure CORS - must be before auth routes
app.use('*', cors({
  origin: (origin) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return '*';
    
    const allowedOrigins = [
      'https://dashboard.databuddy.cc',
      'https://app.databuddy.cc',
      'http://localhost:3000',
      'http://localhost:4000',
      'https://api.databuddy.cc',
      'https://databuddy.cc',
      'https://www.databuddy.cc'
    ];
    
    return allowedOrigins.includes(origin) ? origin : null;
  },
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'databuddy-client-id',
    'databuddy-sdk-name',
    'databuddy-sdk-version',
    'x-user-timezone'
  ],
  allowMethods: ['POST', 'OPTIONS', 'GET'],
  credentials: true,
  exposeHeaders: ['Content-Type', 'Set-Cookie'],
  maxAge: 600,
}));

// Mount auth routes first
app.on(['POST', 'GET', 'OPTIONS'], '/api/auth/*', async (c) => {
  try {
    const response = await auth.handler(c.req.raw);
    return response;
  } catch (error: any) {
    logger.error('[Auth Handler Error]:', error);
    return new Response(JSON.stringify({ 
      error: 'Authentication error', 
      message: error?.message || 'An error occurred in the authentication service' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Health check route
app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }));

// Mount analytics basket endpoint (no auth required)
app.route('/basket', basketRouter);


// Mount analytics routes with auth middleware
app.route('/analytics', analyticsRouter);

app.get('/session', (c) => {
  return c.json({ session: c.get('session') });
});

// Error handling
app.onError((err, c) => {
  logger.error('[API Error]:', err);
  return new Response(JSON.stringify({ 
    error: err.message || 'Internal Server Error',
    status: 500
  }), { 
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
});

app.notFound((c) => {
  return new Response(JSON.stringify({ error: 'Route not found' }), { 
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
});

// Helper function to access environment variables in both Node.js and Cloudflare Workers
function getEnv(key: string) {
  return process.env[key] || 
         (typeof globalThis.process !== 'undefined' ? globalThis.process.env?.[key] : null) || 
         (typeof globalThis !== 'undefined' && key in globalThis ? (globalThis as Record<string, any>)[key] : null);
}

export default {
  fetch: app.fetch,
  port: getEnv('PORT') || 3001,
};
