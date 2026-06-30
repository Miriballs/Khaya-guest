# Khaya Guest Booking Calendar

The public guest-facing booking calendar for Khaya Kitehouse. Connects directly
to the real Supabase backend (project "Khaya booking calendar"). This is the
file meant to be embedded into the Wix site as a Custom Element, once deployed.

## What this is NOT

This does not include the Owner or Payments views — those live in a separate,
private project (`khaya-owner-app`), since they show guest names, contact
details, and payment information that should never be reachable from a public
page.

## Local development

```
npm install
npm run dev
```

## Deploying

This is a standard Vite + React project. Push it to its own GitHub repository,
then import that repository in Vercel (or Netlify) — both auto-detect Vite
projects and need no special configuration.

Once deployed, Vercel/Netlify will give you a real `https://...` URL. That
URL's built JavaScript file is what gets referenced from Wix's Custom Element
embed (Server URL field).

## If you ever need to change which Supabase project this talks to

The connection details are near the top of `src/App.jsx`:

```js
const SUPABASE_URL = "...";
const SUPABASE_ANON_KEY = "...";
```

The anon/publishable key is safe to have in this public-facing code — it is
not a secret. Everything it can or can't do is controlled by Row Level
Security policies on the database side, not by keeping this key hidden.
