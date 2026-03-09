## Cushn Email Templates

These templates align transactional email styling with the current Cushn product look:

- dark slate background
- teal primary accent
- rounded glass-like panels
- compact dashboard-style metric cards

### Files

- `confirm-signup.html`
- `reset-password.html`
- `welcome-to-cushn.html`

### Where to use them

- Supabase Auth `Confirm signup` email template:
  use `confirm-signup.html`
- Supabase Auth `Reset password` / `Recovery` email template:
  use `reset-password.html`
- Post-confirmation welcome email:
  use `welcome-to-cushn.html`

### Template variables

These templates currently use:

- `{{ .ConfirmationURL }}`

That matches the current app flow, where the frontend calls `resetPasswordForEmail(..., { redirectTo: \`${window.location.origin}/login\` })`.

### Welcome email note

There is currently no automatic post-confirmation welcome-email sender wired in this repo.

If you want `welcome-to-cushn.html` to send automatically after email verification, you still need one of these:

- a Supabase auth hook / external automation after confirmation
- a custom edge function triggered after confirmation
- a backend job that detects newly confirmed users and sends the welcome email

### Reminder emails

Reminder emails are not pasted into Supabase Auth. They are rendered by:

- `supabase/functions/send-renewal-reminders/index.ts`

using the shared builder:

- `supabase/functions/_shared/cushnEmail.ts`
