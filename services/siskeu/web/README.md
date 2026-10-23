# SISKEU web

SISKEU is the only writer for SPP invoices and payment state. The web application reads its own API over the same public origin (`/api/*`), while Auth remains the central SSO provider.

Required runtime variables:

- `INTERNAL_API_URL=http://127.0.0.1:3001`
- `NEXT_PUBLIC_AUTH_URL=https://auth.alfida.or.id`

Do not put service tokens, provider webhook keys, or database URLs into browser-visible `NEXT_PUBLIC_*` variables.
