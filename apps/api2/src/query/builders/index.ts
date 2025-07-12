import { ErrorBuilders } from "./errors";

export const QueryBuilders = {
    ...ErrorBuilders
};

export type QueryType = keyof typeof QueryBuilders; 