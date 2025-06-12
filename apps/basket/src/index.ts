import { Elysia } from 'elysia'
import basketRouter from './routes/basket2';
import { logger } from './lib/logger';

// Custom error classes
class ValidationError extends Error {
  constructor(public message: string) {
    logger.error(new Error(`ValidationError: ${message}`));
    super(message)
  }
}

class NotFoundError extends Error {
  constructor(public message: string) {
    logger.error(new Error(`NotFoundError: ${message}`));
    super(message)
  }
}

class UnauthorizedError extends Error {
  constructor(public message: string) {
    logger.error(new Error(`UnauthorizedError: ${message}`));
    super(message)
  }
}

const app = new Elysia()
  .error({
    ValidationError,
    NotFoundError,
    UnauthorizedError
  }).onError(({ error }) => {
    logger.error(new Error(`${error instanceof Error ? error.name : 'Unknown'}: ${error instanceof Error ? error.message : 'Unknown'}`));
  });

app.onBeforeHandle(({ request, set }) => {
  const origin = request.headers.get('origin')

  if (origin) {
    set.headers ??= {}
    set.headers['Access-Control-Allow-Origin'] = origin
    set.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS, PUT, DELETE'
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, databuddy-client-id, databuddy-sdk-name, databuddy-sdk-version'
    set.headers['Access-Control-Allow-Credentials'] = 'true'
  }
})

// Handle preflight requests
app.options('*', () => new Response(null, { status: 204 }))

app.use(basketRouter);

app.get('/health', () => ({ status: 'ok', version: '1.0.0' }));

export default {
  fetch: app.fetch,
  port: process.env.PORT || 4001,
};
