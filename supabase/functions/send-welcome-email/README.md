## send-welcome-email edge function

Sends a one-time welcome email to a verified user after confirmation/login.

### Required secrets

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

Optional:

- `EMAIL_FROM`
- `SITE_URL`

### Behavior

- validates the authenticated caller from the `Authorization` header
- only sends if `email_confirmed_at` exists
- only sends once per user
- stores `welcome_email_sent_at` in `user_metadata`

### Deploy

```bash
supabase functions deploy send-welcome-email
```
