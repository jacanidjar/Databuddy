import { TABLE_NAMES } from './clickhouse/client';

export interface SqlBuilderObject {
  where: Record<string, string>;
  having: Record<string, string>;
  select: Record<string, string>;
  groupBy: Record<string, string>;
  orderBy: Record<string, string>;
  from: string;
  limit: number | undefined;
  offset: number | undefined;
}

/**
 * Creates a SQL query builder for ClickHouse
 * @param tableName Optional table name to query (defaults to events table)
 */
export function createSqlBuilder(tableName?: keyof typeof TABLE_NAMES) {
  const join = (obj: Record<string, string> | string[], joiner: string) =>
    Object.values(obj).filter(Boolean).join(joiner);

  const sb: SqlBuilderObject = {
    where: {},
    from: tableName ? TABLE_NAMES[tableName] : TABLE_NAMES.events,
    select: {},
    groupBy: {},
    orderBy: {},
    having: {},
    limit: undefined,
    offset: undefined,
  };

  const getWhere = () =>
    Object.keys(sb.where).length ? `WHERE ${join(sb.where, ' AND ')}` : '';
  const getHaving = () =>
    Object.keys(sb.having).length ? `HAVING ${join(sb.having, ' AND ')}` : '';
  const getFrom = () => `FROM ${sb.from}`;
  const getSelect = () =>
    `SELECT ${Object.keys(sb.select).length ? join(sb.select, ', ') : '*'}`;
  const getGroupBy = () =>
    Object.keys(sb.groupBy).length ? `GROUP BY ${join(sb.groupBy, ', ')}` : '';
  const getOrderBy = () =>
    Object.keys(sb.orderBy).length ? `ORDER BY ${join(sb.orderBy, ', ')}` : '';
  const getLimit = () => (sb.limit ? `LIMIT ${sb.limit}` : '');
  const getOffset = () => (sb.offset ? `OFFSET ${sb.offset}` : '');

  return {
    sb,
    join,
    getWhere,
    getFrom,
    getSelect,
    getGroupBy,
    getOrderBy,
    getHaving,
    /**
     * Set the table to query
     * @param table The table name from TABLE_NAMES
     */
    setTable: (table: keyof typeof TABLE_NAMES) => {
      sb.from = TABLE_NAMES[table];
      return sb;
    },
    /**
     * Generates the complete SQL query string
     */
    getSql: () => {
      const sql = [
        getSelect(),
        getFrom(),
        getWhere(),
        getGroupBy(),
        getHaving(),
        getOrderBy(),
        getLimit(),
        getOffset(),
      ]
        .filter(Boolean)
        .join(' ');
      return sql;
    },
  };
}