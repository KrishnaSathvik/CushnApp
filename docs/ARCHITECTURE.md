# SubTrackr Architecture

## State management

SubTrackr intentionally uses a hook/context architecture instead of a centralized global store:

- `AuthContext` handles auth, session, and guest-mode state.
- `ThemeContext` handles theme preference and token selection.
- `SettingsContext` handles currency preference.
- Feature hooks (`useSubscriptions`, `useBudget`) own domain data loading/mutations.
- `dataService` abstracts persistence between Dexie (guest) and Supabase (authenticated).

This keeps domain state close to feature code while avoiding an extra state library.
