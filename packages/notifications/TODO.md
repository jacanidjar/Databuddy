# Notifications Package TODO

## Database & Alarms System

- [ ] Create database table for "Alarms"
  - User-configurable alarms
  - Fields:
    - `id` - Unique identifier
    - `user_id` / `organization_id` - Owner
    - `name` - Alarm name
    - `description` - Alarm description
    - `enabled` - Whether alarm is active
    - `notification_channels` - Array of channels (slack, discord, email, webhook)
    - `slack_webhook_url` - Optional Slack webhook URL
    - `discord_webhook_url` - Optional Discord webhook URL
    - `email_addresses` - Array of email addresses
    - `webhook_url` - Optional custom webhook URL
    - `webhook_headers` - JSON object for custom webhook headers
    - `conditions` - JSON object for alarm conditions/triggers
    - `created_at` - Timestamp
    - `updated_at` - Timestamp
  - Support assigning alarms to:
    - Websites (uptime monitoring)
    - Analytics events (traffic spikes, goal completions)
    - Error rates
    - Performance metrics
    - Custom events

## Uptime Monitoring Integration

- [ ] Add alarm integration for uptime tracking
  - Trigger when site goes down
  - Trigger when site comes back up
  - Configurable thresholds (e.g., alert after X consecutive failures)
  - Support multiple notification channels per alarm
  - Include site details in notification (URL, status code, response time, etc.)

## Additional Notification Providers

- [ ] **Microsoft Teams** - Webhook support for Teams channels
- [ ] **Telegram** - Bot API for sending messages to Telegram channels/groups
- [ ] **PagerDuty** - Integration for incident management
- [ ] **Opsgenie** - Alerting and on-call management
- [ ] **SMS/Twilio** - SMS notifications via Twilio API
- [ ] **Pushover** - Push notifications for mobile devices
- [ ] **Mattermost** - Webhook support for Mattermost channels
- [ ] **Rocket.Chat** - Webhook support for Rocket.Chat
- [ ] **Google Chat** - Webhook support for Google Chat spaces
- [ ] **Zulip** - Webhook support for Zulip streams
- [ ] **Line** - Line Notify API for Line messaging
- [ ] **WeChat** - WeChat Work webhook support
- [ ] **Amazon SNS** - AWS Simple Notification Service integration
- [ ] **Google Cloud Pub/Sub** - GCP Pub/Sub integration
- [ ] **Azure Service Bus** - Azure messaging integration
- [ ] **Apprise** - Universal notification library wrapper (supports 70+ services)

## Notification Templates & Branding

- [ ] Create reusable notification templates
  - Good templates with nice branding
  - Clean, professional design
  - Reusable across all channels
  - Support for:
    - Brand colors and logos
    - Consistent formatting
    - Variable substitution (e.g., `{{website}}`, `{{errorRate}}`)
    - Channel-specific optimizations (Slack blocks, Discord embeds, HTML emails)
    - Template inheritance/composition
  - Pre-built templates for common scenarios:
    - Uptime alerts (site down/up)
    - Traffic spikes
    - Error rate warnings
    - Goal completions
    - Weekly/monthly reports
    - Deployment notifications
  - Template editor/management UI
  - Preview functionality

## Future Enhancements

- [ ] Rate limiting per channel/user
- [ ] Notification history/logging
- [ ] Webhook signature verification utilities
- [ ] Batch notification sending
- [ ] Scheduled notifications (cron-like)
- [ ] Notification preferences per user/organization
- [ ] Notification grouping/deduplication
- [ ] Rich formatting helpers (tables, code blocks, etc.)
- [ ] Attachment support (files, images)
- [ ] Interactive notifications (buttons, actions)
