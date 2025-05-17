import { Logtail } from "@logtail/edge";
// import pino from "pino";

// Create a logger instance with Better Stack
export const logger = new Logtail("cEe8CU2VwLfsESg52QLAwPvp", {
    endpoint: 'https://s1222612.eu-nbg-2.betterstackdata.com',
    batchSize: 10, // Send logs in batches of 10
    batchInterval: 1000, // Or when 1 second passes
});
