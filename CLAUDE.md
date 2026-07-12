# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The public, guest-facing booking calendar for Khaya Kitehouse — a Vite + React 18 app that talks directly to a live Supabase backend and is deployed (Vercel/Netlify) to be embedded in a Wix site as a Custom Element.

**Important boundary:** Owner and Payments views live in a separate private project (`khaya-owner-app`). Nothing in this repo may expose guest names, contact details, or payment info — it is public-facing code. The Supabase anon key hardcoded in `src/App.jsx` is intentionally public; all access control is enforced by Row Level Security on the database side, not by hiding the key.

## Commands

```
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm run preview   # preview the production build
```

There are no tests and no linter configured.

## Architecture

Essentially the entire app lives in **`src/App.jsx`** (~2000 lines): connection constants, room catalog, pricing engine, date helpers, availability maps, and the full UI (calendar grid, drag selection, summary/request views, modals). `main.jsx` just mounts it. When changing behavior, expect to work within this one file and follow its existing organization (helpers at top, component below).

### Data flow with Supabase

- **Reads** come only from the `availability` view (`room_id, check_in, check_out, status, people`) plus a `settings` row (`away_until`). Guests have **no read access to the `bookings` table** at all.
- **Writes** (a booking request) are two inserts in strict order: first a `bookings` row with a **client-generated UUID** (guests can't read the id back, so it must be chosen in the browser), then `booking_segments` rows pointing at it. The RLS policy only allows a segment insert if the booking exists, is `pending`, and is fresh (<5 min old). Double-booking/dorm-capacity conflicts are enforced by the database — the segment insert failing is the expected signal, and the client responds by reloading availability.
- Availability is reloaded on mount, after a successful submit, and (throttled to 30s) when the tab regains focus.

### Domain model and invariants

- **Rooms** are a hardcoded catalog (`ROOMS`) with types `private`, `dorm`, `special`, `tent`; `ownerOnly` rooms (tents) are filtered out of the guest view. Dorms are booked per bed against `DORM_CAP`; private rooms/tent/special sleep up to 2 (`UNIT_SLEEPS`).
- **Availability maps** (`BOOKED`, `PENDING`, `CELLMAP`, `DORM_OCC`) are module-level objects rebuilt from the bookings state via `rebuildMaps()` on **every render** — this call is load-bearing; without it every room shows free.
- **Selection** is a `Set` of `"roomId::dateKey"` strings; a drag rebuilds the selection declaratively from a snapshot (anchor + current cell), never by toggling cells. One room per night is enforced during selection.
- **Date keys** are local-time `YYYY-MM-DD` strings built by `toKey()` — never use `toISOString()`, which shifts to UTC and breaks selection in timezones ahead of UTC.
- **Pricing:** seasonal rates (high = Dec–Feb), €5/night double-occupancy surcharge on non-dorms, and long-stay discount tiers (30/60/90 nights) decided by the **whole booking's** distinct-night count, not per segment or per bed.
- **Minimum stay:** every segment must be ≥2 nights, except a single "orphan night" (a free night sandwiched between taken nights in the same room), which may be booked alone.
- WhatsApp number is the required contact field (must start with `+` or `00`); email is optional.
