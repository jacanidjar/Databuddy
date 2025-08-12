# Email Events API

## Environment Setup

Set the API key in your environment:

```bash
EMAIL_API_KEY=your-secret-api-key-here
```

## Data Validation & Schema

All email events are validated using Zod schemas with the following requirements:

### Schema Definition

```typescript
{
  email_id: string (1-255 characters, required)
  domain: string (1-255 characters, required)
  labels: string[] (optional, max 100 chars per label, defaults to [])
  event_time: number (optional, Unix timestamp in milliseconds)
  received_at: number (optional, Unix timestamp in milliseconds)
  metadata: Record<string, unknown> (optional, defaults to {})
}
```

### Date Format Requirements

- **event_time**: Unix timestamp in **milliseconds** (e.g., `1703123456789`)
- **received_at**: Unix timestamp in **milliseconds** (e.g., `1703123456789`)
- If not provided, both default to the current server time
- Use `Date.now()` in JavaScript or equivalent in other languages

### Validation Rules

- **email_id**: Must be 1-255 characters, will be hashed server-side for privacy
- **domain**: Must be 1-255 characters (sender domain)
- **labels**: Array of strings, each max 100 characters
- **metadata**: Any JSON object for additional data
- **Batch limit**: Maximum 100 events per batch request

## Single Email Event

**POST** `/email`

Headers:

```
Content-Type: application/json
X-API-Key: your-secret-api-key-here
```

Body:

```json
{
  "email_id": "unique-email-id-123",
  "domain": "sender-domain.com",
  "labels": ["inbox", "important"],
  "event_time": 1703123456789,
  "received_at": 1703123456789,
  "metadata": {
    "subject": "Meeting reminder",
    "from": "sender@domain.com",
    "custom_field": "value"
  }
}
```

Response:

```json
{
  "status": "success",
  "type": "email",
  "event_id": "abc123..."
}
```

## Batch Email Events

**POST** `/email/batch`

Headers:

```
Content-Type: application/json
X-API-Key: your-secret-api-key-here
```

Body:

```json
[
  {
    "email_id": "email-1",
    "domain": "domain1.com",
    "labels": ["inbox"],
    "event_time": 1703123456789,
    "received_at": 1703123456789
  },
  {
    "email_id": "email-2",
    "domain": "domain2.com",
    "labels": ["spam"],
    "event_time": 1703123456790,
    "received_at": 1703123456790
  }
]
```

Response:

```json
{
  "status": "success",
  "batch": true,
  "processed": 2,
  "results": [
    {
      "status": "success",
      "type": "email",
      "email_hash": "abc123..."
    },
    {
      "status": "success",
      "type": "email",
      "email_hash": "def456..."
    }
  ]
}
```

## Required Fields

- `email_id`: Unique identifier for the email (will be hashed server-side)
- `domain`: Sender domain

## Optional Fields

- `labels`: Array of strings for categorization
- `event_time`: Timestamp when the label state happened (defaults to now)
- `received_at`: Timestamp when email was first received (defaults to now)
- `metadata`: JSON object for additional data

## Error Responses

### Missing API Key

```json
{
  "status": "error",
  "message": "Invalid or missing API key"
}
```

### Schema Validation Error

```json
{
  "status": "error",
  "message": "Invalid email event schema",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 1 character(s)",
      "path": ["email_id"]
    }
  ]
}
```

### Invalid Date Format

```json
{
  "status": "error",
  "message": "Invalid email event schema",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["event_time"],
      "message": "Expected number, received string"
    }
  ]
}
```

### Batch Schema Validation Error

```json
{
  "status": "error",
  "message": "Invalid batch email event schema",
  "errors": [
    {
      "code": "too_big",
      "maximum": 100,
      "type": "array",
      "inclusive": true,
      "exact": false,
      "message": "Array must contain at most 100 element(s)",
      "path": []
    }
  ]
}
```

### Duplicate Event

```json
{
  "status": "success",
  "message": "Duplicate event ignored"
}
```

### JavaScript/Node.js

```javascript
const emailEvent = {
  email_id: "email-123",
  domain: "example.com",
  labels: ["inbox", "important"],
  event_time: Date.now(), // Current timestamp in milliseconds
  received_at: Date.now(),
  metadata: { subject: "Meeting reminder" },
};

const response = await fetch("http://basket.databuddy.cc/email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.EMAIL_API_KEY,
  },
  body: JSON.stringify(emailEvent),
});
```

## Notes

- **Privacy**: Email IDs are hashed with SHA-256 using domain as salt for privacy
- **Deduplication**: Events are deduplicated using email hash + event time (7 day TTL)
- **Rate Limits**: Batch endpoint supports up to 100 events per request
- **Storage**: All data is stored in ClickHouse `analytics.email_events` table
- **Timestamps**: Always use Unix timestamps in **milliseconds**, not seconds
- **Authentication**: X-API-Key header is required for all requests
