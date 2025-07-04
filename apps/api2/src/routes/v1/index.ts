import { Elysia } from 'elysia';
import queryRouter from './query';

const v1Router = new Elysia({
  prefix: '/v1',
})
  .use(queryRouter);

export default v1Router;
