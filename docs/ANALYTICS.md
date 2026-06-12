# Analytics

7labs.org uses two Cloudflare-native analytics surfaces when the owner enables them for a deployed environment:

- Workers Analytics Engine for custom product events from `/api/events`.
- Cloudflare Web Analytics for pageviews through the optional beacon token.

Both are disabled in the repo defaults.

## Event Taxonomy

| Event | Meaning |
| --- | --- |
| `tool_run` | A public tool generated a local or provider-backed result. |
| `copy_output` | A user copied or exported a tool result. |
| `example_loaded` | A user loaded a bundled example into a tool. |
| `feedback_submitted` | A user marked a result as useful or needing improvement. |
| `category_filter` | A user selected a tools-directory category filter. |
| `best_compare_click` | A user clicked from a best/compare surface into a related decision page or tool. |
| `newsletter_signup` | A newsletter form submission was attempted after the newsletter feature is enabled. |

## Data Contract

Workers Analytics Engine receives one data point per accepted event:

- `blob1`: event name
- `blob2`: tool slug, or an empty string
- `blob3`: short enum value, or an empty string
- `double1`: `1`
- `index1`: event name

The event route deliberately does not collect raw user inputs, generated outputs, full URLs, email addresses, IP addresses, user-agent strings, cookies, or browser storage identifiers. Newsletter email handling remains gated behind the newsletter provider path and is not written to Analytics Engine.

## Queries

Top tools by runs:

```sql
SELECT blob2 AS tool_slug, SUM(_sample_interval * double1) AS runs
FROM seven_labs_events
WHERE blob1 = 'tool_run'
  AND timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY tool_slug
ORDER BY runs DESC
LIMIT 20
```

Copy rate per tool:

```sql
SELECT
  blob2 AS tool_slug,
  SUM(CASE WHEN blob1 = 'copy_output' THEN _sample_interval * double1 ELSE 0 END) AS copies,
  SUM(CASE WHEN blob1 = 'tool_run' THEN _sample_interval * double1 ELSE 0 END) AS runs,
  copies / NULLIF(runs, 0) AS copy_rate
FROM seven_labs_events
WHERE timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY tool_slug
ORDER BY copy_rate DESC
LIMIT 20
```

Feedback ratio per tool:

```sql
SELECT
  blob2 AS tool_slug,
  SUM(CASE WHEN blob3 = 'useful' THEN _sample_interval * double1 ELSE 0 END) AS useful,
  SUM(CASE WHEN blob3 = 'needs_improvement' THEN _sample_interval * double1 ELSE 0 END) AS needs_improvement,
  useful / NULLIF(useful + needs_improvement, 0) AS useful_ratio
FROM seven_labs_events
WHERE blob1 = 'feedback_submitted'
  AND timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY tool_slug
ORDER BY useful + needs_improvement DESC
LIMIT 20
```

Best/compare click-through targets:

```sql
SELECT blob3 AS target, SUM(_sample_interval * double1) AS clicks
FROM seven_labs_events
WHERE blob1 = 'best_compare_click'
  AND timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY target
ORDER BY clicks DESC
LIMIT 20
```

Weekly event trend:

```sql
SELECT
  intDiv(toUInt32(timestamp), 604800) * 604800 AS week,
  blob1 AS event,
  SUM(_sample_interval * double1) AS events
FROM seven_labs_events
WHERE timestamp >= NOW() - INTERVAL '12' WEEK
GROUP BY week, event
ORDER BY week ASC, events DESC
```
