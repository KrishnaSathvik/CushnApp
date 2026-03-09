## parse-subscriptions edge function

Deploy this function to keep AI API keys off the client.

### Required secret

`ANTHROPIC_API_KEY`

### Deploy

```bash
supabase functions deploy parse-subscriptions
```

### Client env

Set this in the web app:

```bash
VITE_PARSE_API_URL=https://<project-ref>.functions.supabase.co/parse-subscriptions
```
