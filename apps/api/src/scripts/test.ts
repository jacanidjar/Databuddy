import { clickHouse } from '../clickhouse/client';

const result = await clickHouse.query({
  query: 'SELECT * FROM websites',
});

const connects =

console.log(result);
