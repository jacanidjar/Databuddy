export const uptimeMonitorState = pgTable(
    "uptime_monitor_state",
    {
        id: text().primaryKey().notNull(), // usually websiteId or scheduleId
        status: integer("status").notNull(), // 0=DOWN, 1=UP
        consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
        lastCheckedAt: timestamp("last_checked_at", { precision: 3 }).defaultNow().notNull(),
        lastChangeAt: timestamp("last_change_at", { precision: 3 }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow().notNull(),
    },
    (table) => [
        index("uptime_monitor_state_status_idx").using("btree", table.status),
    ]
);
