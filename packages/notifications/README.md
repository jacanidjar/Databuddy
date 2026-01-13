# @databuddy/notifications

A unified notification package for sending alerts, messages, and webhooks across multiple platforms (Slack, Discord, Email, and custom webhooks).

## Features

- **Multi-channel support**: Send notifications to Slack, Discord, Email, or custom webhooks
- **Unified API**: Single interface for all notification channels
- **Error handling**: Built-in retry logic and timeout handling
- **Type-safe**: Full TypeScript support with strict typing
- **Extensible**: Easy to add new notification providers

## Installation

This is an internal workspace package. Install it in your app:

```json
{
  "dependencies": {
    "@databuddy/notifications": "workspace:*"
  }
}
```

## Usage

### Helper Functions (Simple)

For quick one-off notifications, use the helper functions:

```typescript
import { sendSlackWebhook, sendDiscordWebhook, sendEmail, sendWebhook } from "@databuddy/notifications";

// Send to Slack
await sendSlackWebhook(process.env.SLACK_WEBHOOK_URL!, {
  title: "Alert",
  message: "Something happened!",
  priority: "high",
  metadata: { key: "value" },
}, {
  channel: "#alerts",
  username: "Bot",
});

// Send to Discord
await sendDiscordWebhook(process.env.DISCORD_WEBHOOK_URL!, {
  title: "Deployment Complete",
  message: "New version deployed successfully",
  priority: "normal",
});

// Send Email
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

await sendEmail(
  async (payload) => resend.emails.send({ from: "noreply@databuddy.cc", ...payload }),
  {
    title: "Welcome",
    message: "Thanks for signing up!",
    to: "user@example.com",
  },
  { from: "noreply@databuddy.cc" }
);

// Send to custom webhook
await sendWebhook(process.env.CUSTOM_WEBHOOK_URL!, {
  title: "Event",
  message: "Something occurred",
}, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
```

### Client Setup (Advanced)

```typescript
import { NotificationClient } from "@databuddy/notifications";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const client = new NotificationClient({
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL!,
    channel: "#alerts",
    username: "Databuddy",
  },
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL!,
    username: "Databuddy Bot",
  },
  email: {
    sendEmail: async (payload) => {
      return resend.emails.send({
        from: "noreply@databuddy.cc",
        ...payload,
      });
    },
    from: "noreply@databuddy.cc",
  },
  webhook: {
    url: process.env.CUSTOM_WEBHOOK_URL!,
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}`,
    },
  },
  defaultChannels: ["slack", "discord"],
});
```

### Sending Notifications

#### Send to all default channels

```typescript
const results = await client.send({
  title: "Traffic Spike Detected",
  message: "Your website has experienced a 300% increase in traffic.",
  priority: "high",
  metadata: {
    website: "example.com",
    traffic: "15,000 visits",
    threshold: "5,000 visits",
  },
});

results.forEach((result) => {
  if (result.success) {
    console.log(`✅ Sent to ${result.channel}`);
  } else {
    console.error(`❌ Failed to send to ${result.channel}: ${result.error}`);
  }
});
```

#### Send to specific channels

```typescript
const results = await client.send(
  {
    title: "Goal Completed",
    message: "Your conversion goal has been reached!",
    priority: "normal",
  },
  {
    channels: ["slack", "email"],
  }
);
```

#### Send to a single channel

```typescript
const result = await client.sendToChannel("slack", {
  title: "Error Alert",
  message: "High error rate detected on your website.",
  priority: "urgent",
  metadata: {
    errorRate: "5.2%",
    threshold: "1%",
  },
});
```

### Email Notifications

For email notifications, you must provide the recipient address in `metadata.to`:

```typescript
await client.sendToChannel("email", {
  title: "Weekly Report",
  message: "Your weekly analytics report is ready.",
  metadata: {
    to: "user@example.com",
    // or multiple recipients:
    // to: ["user1@example.com", "user2@example.com"],
  },
});
```

### Custom Webhook Transformations

You can customize how the payload is transformed for webhooks:

```typescript
const client = new NotificationClient({
  webhook: {
    url: process.env.CUSTOM_WEBHOOK_URL!,
    transformPayload: (payload) => ({
      alert: {
        title: payload.title,
        body: payload.message,
        severity: payload.priority ?? "normal",
        data: payload.metadata,
      },
    }),
  },
});
```

### Priority Levels

Notifications support priority levels that affect Discord embed colors:

- `urgent` - Red
- `high` - Orange
- `normal` - Green (default)
- `low` - Blue

## Provider Configuration

### Slack Provider

```typescript
{
  slack: {
    webhookUrl: string;           // Required: Slack webhook URL
    channel?: string;              // Optional: Override default channel
    username?: string;             // Optional: Bot username
    iconEmoji?: string;            // Optional: Bot emoji icon
    iconUrl?: string;              // Optional: Bot icon URL
    timeout?: number;              // Optional: Request timeout (default: 10000ms)
    retries?: number;              // Optional: Retry attempts (default: 0)
    retryDelay?: number;          // Optional: Delay between retries (default: 1000ms)
  }
}
```

### Discord Provider

```typescript
{
  discord: {
    webhookUrl: string;            // Required: Discord webhook URL
    username?: string;             // Optional: Bot username
    avatarUrl?: string;            // Optional: Bot avatar URL
    timeout?: number;              // Optional: Request timeout (default: 10000ms)
    retries?: number;              // Optional: Retry attempts (default: 0)
    retryDelay?: number;          // Optional: Delay between retries (default: 1000ms)
  }
}
```

### Email Provider

```typescript
{
  email: {
    sendEmail: (payload: EmailPayload) => Promise<unknown>;  // Required: Email sending function
    from?: string;                // Optional: Default from address
    timeout?: number;             // Optional: Request timeout (default: 10000ms)
    retries?: number;             // Optional: Retry attempts (default: 0)
    retryDelay?: number;          // Optional: Delay between retries (default: 1000ms)
  }
}
```

### Webhook Provider

```typescript
{
  webhook: {
    url: string;                   // Required: Webhook URL
    method?: "GET" | "POST" | "PUT" | "PATCH";  // Optional: HTTP method (default: POST)
    headers?: Record<string, string>;  // Optional: Custom headers
    timeout?: number;              // Optional: Request timeout (default: 10000ms)
    retries?: number;              // Optional: Retry attempts (default: 0)
    retryDelay?: number;           // Optional: Delay between retries (default: 1000ms)
    transformPayload?: (payload: NotificationPayload) => unknown;  // Optional: Custom payload transformer
  }
}
```

## API Reference

### Helper Functions

#### `sendSlackWebhook(webhookUrl, payload, options?)`

Send a notification to Slack via webhook.

```typescript
await sendSlackWebhook(webhookUrl, {
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}, {
  channel?: string;
  username?: string;
  iconEmoji?: string;
  iconUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
});
```

#### `sendDiscordWebhook(webhookUrl, payload, options?)`

Send a notification to Discord via webhook.

```typescript
await sendDiscordWebhook(webhookUrl, {
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}, {
  username?: string;
  avatarUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
});
```

#### `sendEmail(sendEmailFn, payload, options?)`

Send an email notification.

```typescript
await sendEmail(sendEmailFn, {
  title: string;
  message: string;
  to: string | string[];  // Required
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}, {
  from?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
});
```

#### `sendWebhook(url, payload, options?)`

Send a notification to a custom webhook.

```typescript
await sendWebhook(url, {
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}, {
  method?: "GET" | "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  transformPayload?: (payload: NotificationPayload) => unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
});
```

### `NotificationClient`

Main client for sending notifications.

#### Methods

- `send(payload: NotificationPayload, options?: NotificationOptions): Promise<NotificationResult[]>`
  - Sends a notification to all configured default channels or specified channels

- `sendToChannel(channel: NotificationChannel, payload: NotificationPayload): Promise<NotificationResult>`
  - Sends a notification to a specific channel

- `hasChannel(channel: NotificationChannel): boolean`
  - Checks if a channel is configured

- `getConfiguredChannels(): NotificationChannel[]`
  - Returns all configured channels

### Types

```typescript
type NotificationChannel = "slack" | "discord" | "email" | "webhook";
type NotificationPriority = "low" | "normal" | "high" | "urgent";

interface NotificationPayload {
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}

interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  error?: string;
  response?: unknown;
}
```

## Examples

### Migrating from existing code

If you have existing Slack webhook code:

```typescript
// Before
async function sendToSlack(data: AmbassadorFormData) {
  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });
}

// After
const client = new NotificationClient({
  slack: { webhookUrl: SLACK_WEBHOOK_URL },
});

await client.sendToChannel("slack", {
  title: "New Ambassador Application",
  message: `Name: ${data.name}\nEmail: ${data.email}`,
  metadata: data,
});
```

## Roadmap

See [TODO.md](./TODO.md) for planned features including:
- Database-backed alarm system
- Uptime monitoring integration
- Additional notification providers (Teams, Telegram, PagerDuty, SMS, etc.)

## License

Internal use only.
