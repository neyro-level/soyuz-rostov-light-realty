# fixture-broken

TEST candidates that snapshot verify must reject:

- `bad-signature`
- `hash-mismatch`
- `duplicate-publicUrlId`
- `privacy-leak`
- `broken-relation`
- `invalid-slug`
- `excessive-quarantine`

Regenerate with `pnpm exec tsx scripts/generate-broken-fixtures.ts`.
