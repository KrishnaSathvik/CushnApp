## delete-account edge function

Deletes the currently authenticated Supabase user.

The app calls this from Settings when a signed-in user confirms account deletion.

### Required secrets

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Deploy

```bash
supabase functions deploy delete-account
```

With an explicit project ref:

```bash
supabase functions deploy delete-account --project-ref <your-project-ref>
```

### Invoke

This function requires the caller's access token in the `Authorization` header.

Example:

```bash
curl -X POST \
  https://<project-ref>.functions.supabase.co/delete-account \
  -H "Authorization: Bearer <user-access-token>" \
  -H "Content-Type: application/json"
```

### Behavior

- validates the caller via the access token
- uses the service role key to delete that same auth user
- returns:
  - `success`
  - `deletedUserId`
  - `themePreferenceKey`
  - `brand`

### Notes

- user-linked rows in app tables should be removed via `ON DELETE CASCADE`
- this function only allows `POST`
