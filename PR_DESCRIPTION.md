# Implement Uptime Monitoring Alarms (Bounty #268)

/claim #268
/claim #268

## Description
This PR implements the full Uptime Monitoring Alarm system, integrating the uptime service with the notification system. It allows users to create, manage, and assign alarms to monitored websites, and triggers notifications based on configurable thresholds (consecutive failures) and state changes (UP/DOWN).

## Changes

### 1. Backend Integration (apps/uptime)
- **State Tracking:** Added `uptimeMonitorState` table to DB schema to persist monitor status and consecutive failure counts.
- **Trigger Logic:** Implemented `getConsecutiveFailures` and `getPreviousStatus` in `alarm-trigger.ts` to support threshold-based alarming.
- **Action Update:** Refactored `checkUptime` in `actions.ts` to calculate and update failure streaks and previous status in real-time.
- **Notifications:** Integrated `@databuddy/notifications` to send rich alerts for "Down" and "Recovery" events.

### 2. Frontend UI (apps/dashboard)
- **Alarm Management:** Created `AlarmList`, `AlarmCard`, and `AlarmForm` components.
- **Integration:** Added the alarm management section to the Website Pulse page (`websites/[id]/pulse`).
- **Features:**
    - Create/Edit/Delete alarms.
    - "Quick Assign" existing alarms to other sites.
    - Toggle alarms on/off.
    - Test notifications directly from UI.

### 3. dev / Environment Fixes
- **Windows Support:** Fixed `packages/email/package.json` to correctly handle `bun` paths and binary execution on Windows environments.

## Testing
- **Unit Tests:** Verified `alarm-trigger.test.ts`.
- **Manual Verification:** Verified UI flows for creating and managing alarms.
- **Type Safety:** All code passes `bun run lint` and `bun run check-types`.

## Screenshots
[Please attach screenshots of the Alarm UI and the Notification output here]

## Checklist
- [x] Uptime service checks for alarms
- [x] Triggers alarm on status change (UP <-> DOWN)
- [x] Respects consecutive failure thresholds
- [x] Prevents duplicate notifications (Cooldown)
- [x] Logs alarm trigger history
- [x] Alarm Assignment UI matches design
