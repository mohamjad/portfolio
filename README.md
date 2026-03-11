# Setta

Marketing site and lightweight commerce layer for `setta.ca`.

Setta is positioned as allocation infrastructure for paid social teams. The site is a static landing page with proof sections, pricing, intake flow, and supporting serverless endpoints for checkout and public receipt data.

## What Is In This Repo

- `index.html`: main homepage for Setta
- `styles.css`: full site styling and responsive layout
- `script.js`: homepage interactions, intake flow, proof UI, and checkout wiring
- `signal-spec.html`: supporting product/spec page
- `privacy.html` and `terms.html`: legal pages
- `api/create-checkout-session.js`: serverless Stripe checkout session endpoint
- `api/receipts.js`: serverless public receipts endpoint backed by Supabase
- `assets/`: logos, hero art, memo art, fonts, and showcase assets

## Local Development

This repo is served as a static site.

```bash
npm install
npm run dev
```

That starts a local server on `http://localhost:8080`.

If you only need to preview markup changes, any static file server will work.

## Environment Variables

The homepage itself is static, but the API routes depend on external services.

### Stripe checkout

Required by `api/create-checkout-session.js`:

- `STRIPE_SECRET_KEY`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`
- `STRIPE_PRICE_ID_ALLOCATION_GATE_500`

The code also supports legacy fallback names:

- `STRIPE_PRICE_ID_ALLOCATION_MEMO_500`
- `STRIPE_PRICE_ID_ALLOCATION_GATE`
- `STRIPE_PRICE_ID_ALLOCATION_MEMO_1500`

### Supabase receipts

Required by `api/receipts.js`:

- `SETTA_SUPABASE_URL` or `SUPABASE_URL`
- `SETTA_SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

The receipts endpoint calls the `export_control_room_bundle` RPC and returns a de-identified public payload for the site.

## Editing The Site

Most homepage copy lives directly in `index.html`.

Common sections:

- Hero: top of `index.html`
- Phase ladder / mechanism rail: `#mechanism`
- Market-read bullets: `#thinking`
- Proof cases: `#gate`
- Positioning thesis: `#moat`
- Pricing: `#pricing`
- Intake / buy flow: `#intake`

Interactive behavior for the phase rail, proof cases, intake state, checkout requests, and receipts rendering lives in `script.js`.

## Deployment

This repo is configured for Vercel via `vercel.json`.

Typical flow:

1. Push to `main`
2. Vercel deploys the static site and serverless functions
3. The live domain serves the updated homepage and API routes

## Notes

- The site includes public-facing receipt data, but the API is designed to keep handles, direct URLs, and internal IDs out of the public payload.
- There are local backup/reference files in some working copies of this repo; they are not part of the production site unless explicitly committed.

## License

MIT
