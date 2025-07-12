import { chQuery } from "@databuddy/db";
import type { SimpleQueryConfig, QueryRequest, CompiledQuery, Filter } from "./types";
import { FilterOperators, TimeGranularity } from "./types";

export class SimpleQueryBuilder {
    private config: SimpleQueryConfig;
    private request: QueryRequest;

    constructor(config: SimpleQueryConfig, request: QueryRequest) {
        this.config = config;
        this.request = request;
    }

    private buildFilter(filter: Filter, index: number): { clause: string, params: Record<string, unknown> } {
        const key = `f${index}`;
        const operator = FilterOperators[filter.op];

        if (filter.op === 'like') {
            return {
                clause: `${filter.field} ${operator} {${key}:String}`,
                params: { [key]: `%${filter.value}%` }
            };
        }

        if (filter.op === 'in' || filter.op === 'notIn') {
            return {
                clause: `${filter.field} ${operator} {${key}:Array(String)}`,
                params: { [key]: Array.isArray(filter.value) ? filter.value : [filter.value] }
            };
        }

        return {
            clause: `${filter.field} ${operator} {${key}:String}`,
            params: { [key]: filter.value }
        };
    }

    compile(): CompiledQuery {
        const params: Record<string, unknown> = {
            projectId: this.request.projectId,
            from: this.request.from,
            to: this.request.to
        };

        // SELECT
        let sql = `SELECT ${this.config.fields.join(', ')} FROM ${this.config.table}`;

        // WHERE
        const whereClause = [
            ...(this.config.where || []),
            "project_id = {projectId:String}",
            `${this.config.timeField || 'timestamp'} >= {from:DateTime}`,
            `${this.config.timeField || 'timestamp'} <= {to:DateTime}`
        ];

        // Add filters
        if (this.request.filters) {
            this.request.filters.forEach((filter, i) => {
                if (this.config.allowedFilters?.includes(filter.field)) {
                    const { clause, params: filterParams } = this.buildFilter(filter, i);
                    whereClause.push(clause);
                    Object.assign(params, filterParams);
                }
            });
        }

        sql += ` WHERE ${whereClause.join(' AND ')}`;

        // GROUP BY
        const groupBy = this.request.groupBy || this.config.groupBy;
        if (groupBy?.length) {
            sql += ` GROUP BY ${groupBy.join(', ')}`;
        }

        // ORDER BY
        const orderBy = this.request.orderBy || this.config.orderBy;
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }

        // LIMIT
        const limit = this.request.limit || this.config.limit;
        if (limit) {
            sql += ` LIMIT ${limit}`;
        }

        // OFFSET
        if (this.request.offset) {
            sql += ` OFFSET ${this.request.offset}`;
        }

        return { sql, params };
    }

    async execute(): Promise<Record<string, unknown>[]> {
        const { sql, params } = this.compile();
        return await chQuery(sql, params);
    }
} 