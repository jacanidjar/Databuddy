export interface CustomEventsSummary {
    total_events: number;
    unique_event_types: number;
    unique_users: number;
    unique_sessions: number;
    unique_pages: number;
}

export interface CustomEventItem {
    name: string;
    total_events: number;
    unique_users: number;
    unique_sessions: number;
    last_occurrence: string;
    first_occurrence: string;
    events_with_properties: number;
    percentage: number;
}

export interface EventPropertyValue {
    name: string;
    property_key: string;
    property_value: string;
    count: number;
}

export interface RecentCustomEvent {
    name: string;
    event_name: string;
    path: string;
    properties: Record<string, unknown>;
    anonymous_id: string;
    session_id: string;
    timestamp: string;
}

export interface RawRecentCustomEvent {
    event_name: string;
    path: string;
    properties: string;
    anonymous_id: string;
    session_id: string;
    timestamp: string;
}

export interface CustomEventsTrend {
    date: string;
    total_events: number;
    unique_event_types: number;
    unique_users: number;
}

export interface MiniChartDataPoint {
    date: string;
    value: number;
}

