import type { DateRange } from "@databuddy/shared/types/analytics";
import type {
    BatchQueryResponse,
    DynamicQueryFilter,
} from "@databuddy/shared/types/api";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useBatchDynamicQuery } from "@/hooks/use-dynamic-query";

export function useCustomEventsData(
    websiteId: string,
    dateRange: DateRange,
    options?: Partial<UseQueryOptions<BatchQueryResponse>> & {
        filters?: DynamicQueryFilter[];
    }
) {
    const filters = options?.filters ?? [];

    return useBatchDynamicQuery(
        websiteId,
        dateRange,
        [
            {
                id: "custom_events_summary",
                parameters: ["custom_events_summary"],
                filters,
            },
            { id: "custom_events", parameters: ["custom_events"], filters },
            {
                id: "custom_event_properties",
                parameters: ["custom_event_properties"],
                filters,
            },
            {
                id: "custom_events_recent",
                parameters: ["custom_events_recent"],
                filters,
                limit: 50,
            },
            {
                id: "custom_events_trends",
                parameters: ["custom_events_trends"],
                filters,
            },
        ],
        options
    );
}

