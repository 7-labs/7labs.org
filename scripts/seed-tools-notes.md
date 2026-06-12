# Tool data maintenance notes

Current tool definitions live in:

```text
lib/tools.ts
lib/aiCatalog.ts
```

For production, migrate these to a database:

- Tool title
- Slug
- Category
- SEO title
- Meta description
- Example input
- FAQ
- Related tools
- Whether the tool requires an LLM
- Monetization tier
- Last verified date for third-party AI tools

After launch, rank featured tools by real usage and conversion data instead of fixed priority alone.
