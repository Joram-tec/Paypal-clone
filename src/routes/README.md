# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.

## Wallet reference screens

The index route and static Pages entry both render `WalletApp`. Local mock
fixtures (profile, USD balance, card, contacts, activity and notifications) are
centralized in `src/components/wallet/data.ts`. The local avatar is cropped from
the supplied reference. Screen styling lives in `src/components/wallet/wallet.css`
and scales the 739px-wide reference layout to smaller viewports.

The October 2026 ledger contains nine income items, each followed in time by an
equal withdrawal to Equity Bank, for 18 entries displayed newest first. Thus each
withdrawal appears above its receipt. US$135,000 received minus US$135,000 withdrawn
reconciles to the displayed US$0 wallet balance, with a zero opening balance.
The two US$3,000 receipts remain distinct. Each transaction records its category
and `balanceAfter`; notifications reuse only the incoming transactions.
Categories appear in the existing transaction description line, without adding
rows or changing the layout. Whole-dollar amounts omit decimal places.

Log In opens the home screen without authentication; leave the password empty.
No credentials are stored or transmitted. Bottom navigation, wallet/activity
tabs, search and transaction filters operate locally. See more opens Activity.
Transfer previews and unsupported actions are explicitly labeled as demos and
never change the fixture balance or contact a payment service.
