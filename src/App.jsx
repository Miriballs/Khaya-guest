import { useState, useRef, useEffect } from "react";
// Real npm dependency now that this runs through an actual build step
// (Vite) — see package.json. If you ever need to paste this file directly
// somewhere without a build step again, swap back to the CDN import:
// `import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";`
import { createClient } from "@supabase/supabase-js";

// ── Supabase connection. The anon/publishable key below is meant to be
// public — it's safe to ship in client-side code because every table it can
// touch is locked down by Row Level Security on the database side, not by
// keeping this key secret. See khaya-backend-notes.md for what guests can
// and can't do under RLS.
const SUPABASE_URL = "https://tmpcpfojwkvnvtfqyuwi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcGNwZm9qd2t2bnZ0ZnF5dXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Mzk1MDgsImV4cCI6MjA5ODMxNTUwOH0.Lcg_Jej1zAPx3jIgtHXy7gN3Z-Vw8RWm6RPLx5luAKA";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Palette (modern refresh: ocean blue = selected/primary, terracotta = booked, warm sand = base)
const BOOKED_BG   = "#CC6E48";   // terracotta
const BOOKED_FG   = "#CC6E48";
const FREE_BG     = "#FBF8F2";
const SELECTED_BG = "#2C6E8E";   // ocean blue
const SELECTED_FG = "#FFFFFF";
const HEADER_BG   = "#1F4E63";   // ocean, deep
const PAGE_BG     = "#F6F1E7";
const BORDER      = "#E3DACB";
const ROOM_COL_W  = 110;

// ── Rooms with guest-facing details and season prices (low = Oct/Nov/Mar,
// high = Dec/Jan/Feb). Dorm prices are per bed. Tent & Hippobus prices are
// placeholders — they weren't in the supplied list.
const ROOMS = [
  { id: "ocean",         name: "Ocean twin",      type: "private", desc: "Small twin room with 2 single beds or king, shared bathroom.", priceLow: 41, priceHigh: 44, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/Ocean.jpg"] },
  { id: "sky",           name: "Sky twin",        type: "private", desc: "Larger twin room with 2 single beds or king, shared bathroom & desk. Note: by the kitchen, so more susceptible to noise.", priceLow: 41, priceHigh: 44, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/Sky.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/sky2.png"] },
  { id: "joannas_cabin", name: "Joanna's Cabin", type: "private", desc: "Cabin in the front yard. Double bed, outdoor bathroom & desk. Please note, the cabin is in a very central location.", priceLow: 44, priceHigh: 48, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/joannas_cabin.jpeg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/joannas_cabin2.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/joannas_cabin3.jpg"] },
  { id: "zazus_cabin",   name: "Zazu's Cabin",   type: "private", desc: "Cabin in a private corner of the property. Double bed, outdoor bathroom & desk.", priceLow: 44, priceHigh: 48, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/zazus_cabin.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/zazus_cabin2.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/zazus_cabin3.jpg"] },
  { id: "cove",          name: "Cove ensuite",    type: "private", desc: "Small private room with double bed, en-suite bathroom, separate entrance from the rest of the house for added privacy.", priceLow: 44, priceHigh: 48, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/cove.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/cove2.jpg"] },
  { id: "savanna",       name: "Savanna ensuite", type: "private", desc: "Double bed, en-suite bathroom with tub/shower combo, desk.", priceLow: 49, priceHigh: 54, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/Savanna.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/savanna2.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/savanna3.jpg"] },
  { id: "jungle",        name: "Jungle ensuite",  type: "private", desc: "Double bed, en-suite bathroom with tub/shower combo, door to garden, desk.", priceLow: 49, priceHigh: 54, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/jungle.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/jungle2.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/jungle3.jpg"] },
  { id: "sunrise",       name: "Sunrise ensuite", type: "private", desc: "Largest room. Double bed, desk, en-suite bathroom with separate tub and shower.", priceLow: 52, priceHigh: 56, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/sunrise.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/sunrise2.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/sunrise3.png"] },
  { id: "dorm8",         name: "Dorm 8-bed",     type: "dorm",    beds: 8, desc: "Japan-inspired 8-bed dorm with ensuite bathroom and (optional) AC.", priceLow: 17, priceHigh: 20, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/dorm8.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/dorm8_2.jpg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/dorm8_3.jpg"] },
  { id: "dorm4",         name: "Dorm 4-bed",     type: "dorm",    beds: 4, desc: "Bed in the 4-bed shared dorm. Shared bathroom.", priceLow: 17, priceHigh: 20, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/dorm4.jpg"] },
  { id: "dorm2",         name: "Dorm 2-bed",     type: "dorm",    beds: 2, desc: "Bed in the 2-bed shared dorm. Please note, the room is tiny, but it has doors opening up to the pool.", priceLow: 17, priceHigh: 20, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/dorm2.jpg"] },
  { id: "hippobus",      name: "Hippobus",       type: "special", desc: "A simple van with a big history. Double bed, make-shift tiny desk and a fan. Not a luxurious option, but our cheapest private.", priceLow: 25, priceHigh: 30, photos: ["https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/hippobus.jpeg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/hippobus2.jpeg", "https://tmpcpfojwkvnvtfqyuwi.supabase.co/storage/v1/object/public/room-photos/hippobus3.jpeg"] },
  { id: "tent1", name: "Tent 1", type: "tent", desc: "Owner-managed tent (not shown to guests).", priceLow: 28, priceHigh: 34, ownerOnly: true },
  { id: "tent2", name: "Tent 2", type: "tent", desc: "Owner-managed tent (not shown to guests).", priceLow: 28, priceHigh: 34, ownerOnly: true },
  { id: "tent3", name: "Tent 3", type: "tent", desc: "Owner-managed tent (not shown to guests).", priceLow: 28, priceHigh: 34, ownerOnly: true },
];
const GUEST_ROOMS = ROOMS.filter(r => !r.ownerOnly);

// ── Pricing engine ─────────────────────────────────────────────────
const DOUBLE_OCC_SURCHARGE = 5;   // €/night extra when 2 people share a non-dorm room
const MIN_NIGHTS = 2;             // minimum nights for the whole stay (1-night segments OK within a longer split stay)
const LONG_STAY_TIERS = [          // applied per room segment, on that segment's nights
  { minNights: 90, pct: 18 },
  { minNights: 60, pct: 15 },
  { minNights: 30, pct: 10 },
];

function seasonOf(dateKey) {
  const m = parseInt(dateKey.slice(5, 7), 10); // 1–12
  return (m === 12 || m === 1 || m === 2) ? "high" : "low";
}
function nightlyRate(room, dateKey) {
  return seasonOf(dateKey) === "high" ? room.priceHigh : room.priceLow;
}
function discountPctForNights(nights) {
  for (const t of LONG_STAY_TIERS) if (nights >= t.minNights) return t.pct;
  return 0;
}

// Full price breakdown for one room segment (array of date keys), given party size.
// The long-stay discount tier is decided by the WHOLE booking's night count
// (stayNights) — rooms added together — not by this segment alone. Bed count
// never inflates the tier: 2 dorm beds for 40 nights is still a 40-night stay.
function priceSegment(room, dates, people, stayNights) {
  const isDormRoom = room.type === "dorm";
  const surchargePer = !isDormRoom && people >= 2 ? DOUBLE_OCC_SURCHARGE : 0;
  let low = 0, high = 0, lowN = 0, highN = 0;
  for (const dk of dates) {
    const rate = nightlyRate(room, dk);
    if (seasonOf(dk) === "high") { high += rate; highN++; } else { low += rate; lowN++; }
  }
  const beds = isDormRoom ? people : 1;
  const roomBase = (low + high) * beds;                 // season rates × beds (dorm)
  const surcharge = surchargePer * dates.length;        // +€5/night if double occ
  const subtotal = roomBase + surcharge;
  const tierNights = stayNights ?? dates.length;        // whole-stay length decides the tier
  const pct = discountPctForNights(tierNights);
  const discount = Math.round(subtotal * pct / 100);
  const total = subtotal - discount;
  return {
    nights: dates.length, stayNights: tierNights, lowN, highN,
    lowRate: room.priceLow, highRate: room.priceHigh,
    beds, surchargePer, surcharge, subtotal, pct, discount, total, isDormRoom,
  };
}

// ── Date helpers
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function toKey(date) {
  // Local date components — NOT toISOString(), which shifts to UTC and breaks
  // selection in timezones ahead of UTC (e.g. SAST/UTC+2).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
// Real current date — nights before this can't be booked. (In this demo the whole
// season is in the future, so nothing shows as past; the guard is for the live site.)
const TODAY_KEY = (() => { const t = new Date(); t.setHours(0, 0, 0, 0); return toKey(t); })();
function isPastDate(dateKey) { return dateKey < TODAY_KEY; }
function fmt(date, opts) {
  return date.toLocaleDateString("en-GB", opts);
}
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ── Generate date range (90 days from today)
function buildDates(startDate, count) {
  return Array.from({ length: count }, (_, i) => addDays(startDate, i));
}

// parseKey: shared date-string helper used throughout this file for real
// date math (availability checks, the orphan-night rule, etc).
function parseKey(k) { const [y,m,d] = k.split("-").map(Number); const dt = new Date(y, m-1, d); dt.setHours(0,0,0,0); return dt; }

// Availability maps, rebuilt from the booking list on every render. A pending request
// holds the room too (your "hold, auto-release after 48h" rule — expiry lands next pass).
let BOOKED = {};
let PENDING = {};
let CELLMAP = {};   // private rooms: roomId -> { dk: booking }
let DORM_OCC = {};  // dorms: dormId -> { dk: [bookings occupying that night] }
function rebuildMaps(bookings) {
  BOOKED = {}; PENDING = {}; CELLMAP = {}; DORM_OCC = {};
  for (const bk of bookings) {
    if (bk.status !== "confirmed" && bk.status !== "pending") continue;
    for (const sg of bk.segments) {
      const nights = sg.nights ? sg.nights : (() => { const out = []; let d = parseKey(sg.from); const end = parseKey(sg.to); while (d < end) { out.push(toKey(d)); d = addDays(d, 1); } return out; })();
      const dorm = isDorm(sg.roomId);
      for (const dk of nights) {
        if (dorm) {
          const room = DORM_OCC[sg.roomId] || (DORM_OCC[sg.roomId] = {});
          (room[dk] || (room[dk] = [])).push(bk);
        } else {
          const target = bk.status === "confirmed" ? BOOKED : PENDING;
          (target[sg.roomId] || (target[sg.roomId] = new Set())).add(dk);
          (CELLMAP[sg.roomId] || (CELLMAP[sg.roomId] = {}))[dk] = bk;
        }
      }
    }
  }
}


// Turns a guest's selected cells into real booking segments for submission —
// grouped per room, AND split into contiguous date runs, since a guest can
// select two separate stretches in the same room (a genuine split stay) and
// each stretch needs its own check_in/check_out range. Lumping all of a
// room's selected nights into a single range would silently include any
// gap nights in between.
function selectionToSubmissionSegments(selected) {
  const byRoom = {};
  for (const k of selected) { const [roomId, dateKey] = k.split("::"); (byRoom[roomId] || (byRoom[roomId] = [])).push(dateKey); }
  const segments = [];
  for (const [roomId, dates] of Object.entries(byRoom)) {
    const sorted = dates.slice().sort();
    let run = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const dayGap = (parseKey(sorted[i]) - parseKey(sorted[i - 1])) / 86400000;
      if (dayGap === 1) { run.push(sorted[i]); }
      else { segments.push({ roomId, nights: run }); run = [sorted[i]]; }
    }
    segments.push({ roomId, nights: run });
  }
  return segments;
}
function bookingNights(bk) { let n = 0; for (const sg of bk.segments) { n += sg.nights ? sg.nights.length : Math.round((parseKey(sg.to) - parseKey(sg.from)) / 86400000); } return n; }
function bookingRoomNames(bk) { const ids = [...new Set(bk.segments.map(sg => sg.roomId))]; return ids.map(id => (ROOMS.find(r => r.id === id) || { name: id }).name).join(", "); }

// ── Dorm beds: each dorm has a capacity; a deterministic number of beds are
// booked each night. Guests book per bed, so what matters is beds *free*.
const DORM_CAP = { dorm8: 8, dorm4: 4, dorm2: 2 };
function isDorm(roomId) { return roomId in DORM_CAP; }
function isPending(roomId, dateKey) { return PENDING[roomId] && PENDING[roomId].has(dateKey); }
function isBlocked(roomId, dateKey) { return isBooked(roomId, dateKey) || isPending(roomId, dateKey); }

function dormOcc(roomId, dk) { return (DORM_OCC[roomId] && DORM_OCC[roomId][dk]) || []; }
function dormBedsBooked(roomId, dateKey) { return dormOcc(roomId, dateKey).reduce((n, b) => n + (b.people || 1), 0); }
function dormConfirmedBeds(roomId, dk) { return dormOcc(roomId, dk).filter(b => b.status === "confirmed").reduce((n, b) => n + (b.people || 1), 0); }
function dormPendingBeds(roomId, dk) { return dormOcc(roomId, dk).filter(b => b.status === "pending").reduce((n, b) => n + (b.people || 1), 0); }
function bedsFree(roomId, dateKey) {
  return DORM_CAP[roomId] - dormBedsBooked(roomId, dateKey);
}

function isBooked(roomId, dateKey) {
  if (isDorm(roomId)) return bedsFree(roomId, dateKey) <= 0; // dorm full
  return BOOKED[roomId]?.has(dateKey) ?? false;
}

// Checks whether [checkInKey, checkOutKey) is free in roomId for `people`,
// the same way a brand-new booking would be checked — EXCEPT it ignores any
// conflict caused by `excludeId` itself, so editing a booking to its own
// current dates (or a range that still overlaps them) doesn't falsely
// collide with itself. Returns { ok: true, nights } or { ok: false, reason }.
// (Defined after UNIT_SLEEPS/fitsParty below, since it depends on UNIT_SLEEPS.)

// Can this night hold the whole party? Dorms need that many free beds;
// private rooms and the tent sleep up to 2.
const UNIT_SLEEPS = { private: 2, tent: 2, special: 2 };
function fitsParty(roomId, dateKey, people) {
  if (isDorm(roomId)) return bedsFree(roomId, dateKey) >= people;
  const room = ROOMS.find(r => r.id === roomId);
  const sleeps = UNIT_SLEEPS[room?.type] ?? 2;
  return people <= sleeps;
}

// True if every guest-facing room is blocked on this night — used to flag
// genuinely dead nights in the date-range picker. Deliberately independent
// of party size (a strict "is there any capacity left at all, for anyone"
// check) since the picker is often used before party size is finalized.
function nightFullyUnavailable(dateKey) {
  return GUEST_ROOMS.every(r => isBlocked(r.id, dateKey));
}

function checkRoomDatesFreeForEdit(roomId, checkInKey, checkOutKey, people, excludeId) {
  const room = ROOMS.find(r => r.id === roomId);
  if (!room) return { ok: false, reason: "Unknown room." };
  if (!(checkOutKey > checkInKey)) return { ok: false, reason: "Check-out must be after check-in." };
  const nights = [];
  let d = parseKey(checkInKey); const end = parseKey(checkOutKey);
  while (d < end) { nights.push(toKey(d)); d = addDays(d, 1); }
  for (const dk of nights) {
    if (isPastDate(dk)) return { ok: false, reason: `${dk} is in the past.` };
    if (isDorm(roomId)) {
      const occupants = dormOcc(roomId, dk).filter(b => b.id !== excludeId);
      const used = occupants.reduce((n, b) => n + (b.people || 1), 0);
      if (DORM_CAP[roomId] - used < people) return { ok: false, reason: `${room.name} is full on ${dk}.` };
    } else {
      const occupant = CELLMAP[roomId] && CELLMAP[roomId][dk];
      if (occupant && occupant.id !== excludeId) return { ok: false, reason: `${room.name} is already taken on ${dk}.` };
      const sleeps = UNIT_SLEEPS[room.type] ?? 2;
      if (people > sleeps) return { ok: false, reason: `${room.name} only sleeps ${sleeps}.` };
    }
  }
  return { ok: true, nights };
}

// ── Summary helpers
function buildSegments(selected) {
  // selected: Set of "roomId::dateKey"
  // Group into contiguous runs per room
  const byRoom = {};
  for (const key of selected) {
    const [roomId, dateKey] = key.split("::");
    if (!byRoom[roomId]) byRoom[roomId] = [];
    byRoom[roomId].push(dateKey);
  }
  const segments = [];
  for (const [roomId, dates] of Object.entries(byRoom)) {
    const sorted = dates.slice().sort();
    const room = ROOMS.find(r => r.id === roomId);
    // split into contiguous runs
    let run = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i-1]);
      const curr = new Date(sorted[i]);
      if ((curr - prev) / 86400000 === 1) {
        run.push(sorted[i]);
      } else {
        segments.push({ room, dates: run });
        run = [sorted[i]];
      }
    }
    segments.push({ room, dates: run });
  }
  // Sort by first date
  segments.sort((a, b) => a.dates[0].localeCompare(b.dates[0]));
  return segments;
}

// Find unselected nights between the earliest and latest selected night.
// Returns array of contiguous missing-date runs: [{ from, to, nights }]
function findGaps(selected) {
  const dates = [...selected].map(k => k.split("::")[1]).sort();
  if (dates.length === 0) return [];
  const first = new Date(dates[0] + "T00:00:00");
  const last  = new Date(dates[dates.length - 1] + "T00:00:00");
  const have  = new Set(dates);

  const missing = [];
  let cursor = new Date(first);
  while (cursor <= last) {
    const key = toKey(cursor);
    if (!have.has(key)) missing.push(key);
    cursor.setDate(cursor.getDate() + 1);
  }
  if (missing.length === 0) return [];

  // Group missing into contiguous runs
  const runs = [];
  let run = [missing[0]];
  for (let i = 1; i < missing.length; i++) {
    const prev = new Date(missing[i - 1]);
    const curr = new Date(missing[i]);
    if ((curr - prev) / 86400000 === 1) run.push(missing[i]);
    else { runs.push(run); run = [missing[i]]; }
  }
  runs.push(run);

  return runs.map(r => ({ from: r[0], to: r[r.length - 1], nights: r.length }));
}

// ── Main component

// Converts a row from the `availability` view (room_id, check_in, check_out,
// status, people) into the { status, segments: [{roomId, from, to}], people }
// shape rebuildMaps()/dormBedsBooked() etc. expect — i.e. the same shape
// INITIAL_BOOKINGS used to provide, just sourced from the real database
// instead of hardcoded seed data.
function availabilityRowToBooking(row, i) {
  return {
    id: "avail-" + i, // synthetic — guests never get a real booking id back (see below), and these rows are read-only anyway
    status: row.status,
    people: row.people,
    segments: [{ roomId: row.room_id, from: row.check_in, to: row.check_out }],
  };
}

export default function KhayaGuestCalendar() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [awayUntilKey, setAwayUntilKey] = useState(null);

  // Loads (or reloads) the real availability picture from Supabase. Called
  // once on mount, and again right after a guest successfully submits a
  // request, so their own new pending dates show as held immediately.
  async function loadAvailability() {
    setLoadError(null);
    const [{ data: avail, error: availErr }, { data: settings, error: settingsErr }] = await Promise.all([
      supabase.from("availability").select("room_id, check_in, check_out, status, people"),
      supabase.from("settings").select("away_until").eq("id", true).maybeSingle(),
    ]);
    if (availErr) { setLoadError("Couldn't load the calendar. Please refresh the page."); return; }
    setBookings((avail || []).map(availabilityRowToBooking));
    if (!settingsErr && settings?.away_until) {
      setAwayUntilKey(toKey(new Date(settings.away_until)));
    } else {
      setAwayUntilKey(null);
    }
  }

  // Loads the brand fonts once — purely cosmetic, no effect on data/logic.
  useEffect(() => {
    if (document.getElementById("khaya-font-link")) return;
    const link = document.createElement("link");
    link.id = "khaya-font-link";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700&family=Work+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    loadAvailability().finally(() => setLoading(false));
  }, []);

  // Re-check availability when the guest comes back to this tab after
  // stepping away — a tab left open for a while can otherwise keep showing
  // nights as free that someone else has since booked. Throttled to once
  // per 30s so switching tabs rapidly doesn't hammer the database.
  const lastRefreshRef = useRef(Date.now());
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefreshRef.current < 30000) return;
      lastRefreshRef.current = Date.now();
      loadAvailability();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submits a real guest booking request. Two inserts, in order, matching
  // what the database's RLS policy on booking_segments actually checks
  // (see khaya-backend-notes.md): the booking row must exist, be pending,
  // and be fresh (<5 min old) before a segment insert pointing at it is
  // allowed. The id is generated here in the browser rather than left to
  // the database, because guests have no read access to the bookings table
  // at all — there is no way to ask the database for the id back afterward,
  // so the only way to know it is to choose it ourselves up front.
  async function submitRequest({ guestName, guestWhatsapp, guestEmail, people, segments }) {
    setSubmitting(true);
    setSubmitError(null);
    const bookingId = crypto.randomUUID();

    const { error: bookingErr } = await supabase.from("bookings").insert({
      id: bookingId, guest_name: guestName, guest_whatsapp: guestWhatsapp || null,
      guest_email: guestEmail || null, people, status: "pending",
    });
    if (bookingErr) {
      setSubmitting(false);
      setSubmitError("Something went wrong sending your request. Please try again, or message us directly.");
      return false;
    }

    const segmentRows = segments.map(sg => ({
      booking_id: bookingId, room_id: sg.roomId,
      check_in: sg.nights[0], check_out: toKey(addDays(parseKey(sg.nights[sg.nights.length - 1]), 1)),
    }));
    const { error: segErr } = await supabase.from("booking_segments").insert(segmentRows);
    if (segErr) {
      // Most likely cause: someone else's request/confirmation landed on
      // these exact dates in the moments between this guest loading the
      // calendar and submitting — the database's own double-booking/dorm
      // capacity rules are what actually catch this, not anything checked
      // client-side beforehand. Refresh so the calendar reflects reality
      // immediately, rather than continuing to show the now-stale picture.
      setSubmitting(false);
      setSubmitError("Sorry — one of your selected dates was just taken by someone else. Please check the calendar and try again.");
      loadAvailability();
      return false;
    }

    setSubmitting(false);
    await loadAvailability(); // guest's own new pending request now shows as held
    return true;
  }

  // The live booking window: starts today, runs 12 months out — set
  // deliberately, not a leftover default.
  const SEASON_START = (() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; })();
  const SEASON_END = (() => { const d = new Date(SEASON_START); d.setMonth(d.getMonth() + 12); return d; })();
  const today = SEASON_START;
  const dayCount = Math.round((SEASON_END - SEASON_START) / 86400000) + 1;
  const DATES = buildDates(SEASON_START, dayCount);

  // Populates BOOKED/PENDING/CELLMAP/DORM_OCC from the current bookings
  // state, every render. (This call was missing entirely in the version of
  // this file split out for Wix — meaning every room always showed fully
  // free regardless of real bookings. Fixed here as part of wiring in real
  // data, since real data makes this call non-optional.)
  rebuildMaps(bookings);

  const [selected, setSelected] = useState(new Set()); // "roomId::dateKey"
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState("calendar"); // calendar | summary
  const [hoverCol, setHoverCol] = useState(null);
  const [expandedRoom, setExpandedRoom] = useState(null); // room id whose details panel is open
  // How-to popup. Shows once when the calendar opens. "Don't show again" hides it
  // for the session; a developer can persist this (e.g. localStorage) for real visits.
  const [showHelp, setShowHelp] = useState(true);
  const [dontShowHelp, setDontShowHelp] = useState(false);
  const [people, setPeople] = useState(1);          // party size (beds needed in a dorm)
  const [searchIn, setSearchIn] = useState("");     // preferred check-in (YYYY-MM-DD)
  const [searchOut, setSearchOut] = useState("");   // preferred check-out
  const scrollRef = useRef(null);
  const [showDatePicker, setShowDatePicker] = useState(false); // custom date-range popup
  const [lightboxRoom, setLightboxRoom] = useState(null); // room object whose photos are open, or null
  const [lightboxIndex, setLightboxIndex] = useState(0); // which photo within lightboxRoom.photos
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showCoach, setShowCoach] = useState(false); // animated first-use hints, three in sequence
  const [showCoach2, setShowCoach2] = useState(false); // second hint, revealed shortly after the first
  const [showCoach3, setShowCoach3] = useState(false); // third hint, revealed after the second

  // Guests always see the compact layout (no size toggle).
  const ZOOM = {
    comfortable: { cw: 36, rh: 34, showNumbers: true },
    compact:     { cw: 22, rh: 30, showNumbers: true },
    overview:    { cw: 12, rh: 24, showNumbers: false },
  };
  const zoom = "compact";
  const Z = ZOOM[zoom];
  const CW = Z.cw, RH = Z.rh;

  // Refs for edge auto-scroll while dragging
  const autoScrollRef = useRef(null);
  const lastTouchY = useRef(null);

  // Scroll to show a bit of past context (today is at index 0, but feel free to offset)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, []);

  // Coachmarks: reveal the three hints in sequence (0s, 2s, 4s), then auto-dismiss
  useEffect(() => {
    if (!showCoach) { setShowCoach2(false); setShowCoach3(false); return; }
    const t2 = setTimeout(() => setShowCoach2(true), 2000);
    const t3 = setTimeout(() => setShowCoach3(true), 4000);
    const tEnd = setTimeout(() => setShowCoach(false), 10000);
    return () => { clearTimeout(t2); clearTimeout(t3); clearTimeout(tEnd); };
  }, [showCoach]);

  // Close the welcome popup and reveal the on-grid hints
  function dismissHelp() {
    setShowHelp(false);
    setShowCoach(true);
  }

  // Jump the calendar so a chosen date sits near the left edge
  function jumpToDate(dateKey) {
    if (!dateKey || !scrollRef.current) return;
    const idx = DATES.findIndex(d => toKey(d) === dateKey);
    if (idx < 0) return; // outside the visible booking window (see SEASON_END above)
    scrollRef.current.scrollTo({ left: Math.max(0, idx * CW - CW), behavior: "smooth" });
  }

  // If the party grows past what a selected dorm night can hold, drop those nights.
  useEffect(() => {
    setSelected(prev => {
      let changed = false;
      const next = new Set(prev);
      for (const key of prev) {
        const [roomId, dateKey] = key.split("::");
        if (isDorm(roomId) && !fitsParty(roomId, dateKey, people)) { next.delete(key); changed = true; }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people]);

  // Is a date within the searched window (for a subtle header highlight)?
  function inSearchWindow(dateKey) {
    if (!searchIn) return false;
    const end = searchOut || searchIn;
    return dateKey >= searchIn && dateKey <= end;
  }

  // ── Declarative drag selection ────────────────────────────────────
  // All drag state lives in one ref so the document touch listener and the
  // auto-scroll timer always read fresh values. During a drag the selection is
  // a pure function of (anchor, current): we rebuild it from a snapshot each
  // move instead of toggling cells. That makes re-entering a cell, scroll
  // jitter, and fast moves harmless — they recompute the same answer rather
  // than accumulating stray cells (the old bug).
  const dragInfo = useRef({ active: false, room: null, anchorKey: null, currentKey: null, mode: "add", base: null });

  function cellKey(roomId, dateKey) { return `${roomId}::${dateKey}`; }

  function dateTakenElsewhere(roomId, dateKey) {
    return takenElsewhereIn(selected, roomId, dateKey);
  }
  function takenElsewhereIn(set, roomId, dateKey) {
    for (const key of set) {
      const [r2, d2] = key.split("::");
      if (d2 === dateKey && r2 !== roomId) return true;
    }
    return false;
  }

  // A cell the guest can still select: free, not in another room, and big
  // enough for the whole party (dorms need that many free beds).
  function guestCellFree(roomId, dateKey) {
    return !isPastDate(dateKey)
      && !isBlocked(roomId, dateKey)
      && !dateTakenElsewhere(roomId, dateKey)
      && fitsParty(roomId, dateKey, people);
  }

  function rangeKeys(aKey, bKey) {
    const lo = aKey < bKey ? aKey : bKey;
    const hi = aKey > bKey ? aKey : bKey;
    const out = [];
    let c = new Date(lo + "T00:00:00");
    const end = new Date(hi + "T00:00:00");
    while (c <= end) { out.push(toKey(c)); c = addDays(c, 1); }
    return out;
  }

  // Rebuild the selection from the drag's base snapshot + the current range.
  function applyDrag() {
    const di = dragInfo.current;
    if (!di.active) return;
    const next = new Set(di.base);
    for (const dk of rangeKeys(di.anchorKey, di.currentKey)) {
      if (isBlocked(di.room, dk)) continue;                 // never select a booked night
      const k = cellKey(di.room, dk);
      if (di.mode === "add") {
        if (isPastDate(dk)) continue;                      // can't book past nights
        if (takenElsewhereIn(next, di.room, dk)) continue; // respect one-room-per-night
        if (!fitsParty(di.room, dk, people)) continue;     // not enough beds for the party
        next.add(k);
      } else {
        next.delete(k);
      }
    }
    setSelected(next);
  }

  function beginDrag(roomId, dateKey) {
    const alreadySelected = selected.has(cellKey(roomId, dateKey));
    if (!alreadySelected && !guestCellFree(roomId, dateKey)) return; // can't start on a locked night
    dragInfo.current = {
      active: true, room: roomId, anchorKey: dateKey, currentKey: dateKey,
      mode: alreadySelected ? "remove" : "add",
      base: new Set(selected),
    };
    setDragging(true);
    applyDrag();
  }

  function moveDrag(roomId, dateKey) {
    const di = dragInfo.current;
    if (!di.active) return;
    if (roomId !== di.room) return;                        // a drag stays in its row
    if (di.currentKey === dateKey) return;                 // no change
    di.currentKey = dateKey;
    applyDrag();
  }

  function endDrag() {
    dragInfo.current.active = false;
    setDragging(false);
    lastTouchY.current = null;
    stopAutoScroll();
  }

  // ── Edge auto-scroll, stopping cleanly at a booked/taken night ────
  function autoScrollStep(direction) {
    const node = scrollRef.current;
    const di = dragInfo.current;
    if (!node || !di.active) { stopAutoScroll(); return; }
    // Stop if the next night past the current edge isn't free (only when adding).
    const nextKey = toKey(addDays(new Date(di.currentKey + "T00:00:00"), direction > 0 ? 1 : -1));
    if (di.mode === "add" && !guestCellFree(di.room, nextKey)) { stopAutoScroll(); return; }
    node.scrollLeft += direction * 12;
    const rect = node.getBoundingClientRect();
    const probeX = direction > 0 ? rect.right - 8 : rect.left + ROOM_COL_W + 8;
    const probeY = lastTouchY.current ?? rect.top + rect.height / 2;
    const el = document.elementFromPoint(probeX, probeY);
    const cell = el?.closest("[data-room]");
    if (cell) {
      const rId = cell.getAttribute("data-room");
      const dKey = cell.getAttribute("data-date");
      if (rId === di.room) moveDrag(rId, dKey);
    }
  }
  function startAutoScroll(direction) {
    if (autoScrollRef.current) return;
    autoScrollRef.current = setInterval(() => autoScrollStep(direction), 16);
  }
  function stopAutoScroll() {
    if (autoScrollRef.current) { clearInterval(autoScrollRef.current); autoScrollRef.current = null; }
  }
  function maybeEdgeScroll(clientX) {
    const node = scrollRef.current;
    if (!node || !dragInfo.current.active) return;
    const rect = node.getBoundingClientRect();
    const EDGE = 44;
    if (clientX > rect.right - EDGE) startAutoScroll(1);
    else if (clientX < rect.left + ROOM_COL_W + EDGE) startAutoScroll(-1);
    else stopAutoScroll();
  }

  // ── Unified pointer handling (mouse, touch, pen) ──────────────────
  // One pointer stream means no duplicated "emulated mouse" events after a
  // tap — which was causing single taps to cancel themselves and stray cells
  // to appear. Movement is resolved by hit-testing the cell under the pointer.
  function handlePointerMoveGlobal(e) {
    const di = dragInfo.current;
    if (!di.active) return;
    lastTouchY.current = e.clientY;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el?.closest("[data-room]");
    if (cell) {
      const roomId = cell.getAttribute("data-room");
      const dateKey = cell.getAttribute("data-date");
      if (roomId === di.room) moveDrag(roomId, dateKey);
    }
    maybeEdgeScroll(e.clientX);
  }
  function handlePointerUpGlobal() {
    if (dragInfo.current.active) endDrag();
  }
  function handlePointerCancelGlobal() {
    const di = dragInfo.current;
    // If the browser hijacked the gesture for scrolling before the selection
    // grew beyond its starting cell, treat it as a scroll, not a tap: revert.
    if (di.active && di.currentKey === di.anchorKey) setSelected(di.base);
    endDrag();
  }

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMoveGlobal);
    window.addEventListener("pointerup", handlePointerUpGlobal);
    window.addEventListener("pointercancel", handlePointerCancelGlobal);
    return () => {
      window.removeEventListener("pointermove", handlePointerMoveGlobal);
      window.removeEventListener("pointerup", handlePointerUpGlobal);
      window.removeEventListener("pointercancel", handlePointerCancelGlobal);
      stopAutoScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const segments = buildSegments(selected);
  const gaps = findGaps(selected);
  // Distinct calendar nights spanned by the selection — two rooms picked
  // across the same 35 nights counts as 35, not 70, so the long-stay
  // discount tier (and the "X nights selected" summary) reflect the actual
  // length of the stay rather than the number of room-nights sold.
  const totalNights = new Set(segments.flatMap(seg => seg.dates)).size;
  const segPricings = segments.map(seg => ({ seg, p: priceSegment(seg.room, seg.dates, people, totalNights) }));
    const totalCost   = segPricings.reduce((s, x) => s + x.p.total, 0);

  // Fewer-moves nudge: is a single room free for EVERY selected night?
  // Stays silent when no one room can cover the whole stay — i.e. when the guest
  // is filling gaps between existing bookings, which is exactly what we want to allow.
  const consolidation = (() => {
    const nights = [...new Set([...selected].map(k => k.split("::")[1]))].sort();
    const roomsUsed = new Set([...selected].map(k => k.split("::")[0]));
    if (nights.length < 2 || roomsUsed.size < 2) return null;
    const free = (r, dk) => !isPastDate(dk) && !isBlocked(r.id, dk) && fitsParty(r.id, dk, people);
    // Only suggest a room of a type the guest already used (don't push private bookers into a dorm).
    const usedTypes = new Set([...roomsUsed].map(id => ROOMS.find(r => r.id === id)?.type));
    const candidates = ROOMS.filter(r => usedTypes.has(r.type) && nights.every(dk => free(r, dk)));
    if (!candidates.length) return null;
    const usedNights = {};
    for (const k of selected) { const rid = k.split("::")[0]; usedNights[rid] = (usedNights[rid] || 0) + 1; }
    const priced = candidates
      .map(r => ({ room: r, total: priceSegment(r, nights, people, nights.length).total, used: usedNights[r.id] || 0 }))
      .sort((a, b) => (b.used - a.used) || (a.total - b.total)); // most-used room first, then cheapest
    return { ...priced[0], nights, changes: roomsUsed.size - 1 };
  })();

  // A free night that's only sellable on its own: the nights immediately before
  // AND after it, in the SAME room, are already taken (booked or pending) by
  // someone else. There's no way to ever offer it as part of a longer stay, so
  // it's fine for a guest to take just that one night.
  function isOrphanNight(roomId, dateKey) {
    const prev = toKey(addDays(parseKey(dateKey), -1));
    const next = toKey(addDays(parseKey(dateKey), 1));
    return isBlocked(roomId, prev) && isBlocked(roomId, next);
  }

  // Every segment must be ≥2 nights, UNLESS it's exactly 1 night AND that night
  // is an orphan gap (see above) — in which case a single night is fine to book
  // on its own. Anything else that's just 1 night gets actively blocked.
  const invalidSingleNightSegments = segments.filter(seg => seg.dates.length === 1 && !isOrphanNight(seg.room.id, seg.dates[0]));
  const hasInvalidSingleNight = invalidSingleNightSegments.length > 0;

  // Contact validation: WhatsApp number must start with + or 00 (then digits).
  const phoneClean = guestPhone.replace(/[\s()\-]/g, "");
  const phoneValid = /^(\+|00)\d{7,}$/.test(phoneClean);
  const phoneTouchedInvalid = guestPhone.trim().length > 0 && !phoneValid;
  // Email is always optional — a nice-to-have extra way to reach a guest,
  // never a substitute for WhatsApp. Only validated if they actually type
  // something in; an empty field is always fine.
  const emailValid = guestEmail.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim());
  const emailTouchedInvalid = guestEmail.trim().length > 0 && !emailValid;
  // Every segment is ≥2 nights, OR exactly 1 night and a genuine orphan gap —
  // no blanket "total ≥2 nights" check, since a single qualifying orphan night
  // is a perfectly valid whole booking on its own.
  const canSubmit = guestName.trim().length > 0 && phoneValid && emailValid && segments.length > 0 && !hasInvalidSingleNight;

  // Nights implied by the date search (arrive … night before leave). Used to show
  // an average-per-night estimate under each room before the guest picks cells.
  const searchNights = (() => {
    if (!searchIn || !searchOut || searchOut <= searchIn) return [];
    const out = [];
    let c = new Date(searchIn + "T00:00:00");
    const end = new Date(searchOut + "T00:00:00"); // checkout = exclusive
    while (c < end) { out.push(toKey(c)); c = addDays(c, 1); }
    return out;
  })();

  // Is there at least one guest-facing room that's free for every night the
  // guest searched, and big enough for their party? Used to trigger the
  // "fully booked — message me about Mayana" popup. Independent of the
  // guest's own draft selection (unlike guestCellFree's "taken elsewhere"
  // check), since this is a plain room-by-room availability scan.
  function roomFreeForRange(roomId, nights) {
    return nights.every(dk => !isPastDate(dk) && !isBlocked(roomId, dk) && fitsParty(roomId, dk, people));
  }
  const noRoomFitsSearch = searchNights.length > 0 && !GUEST_ROOMS.some(r => roomFreeForRange(r.id, searchNights));
  const [dismissedFullPopup, setDismissedFullPopup] = useState(false);
  useEffect(() => { setDismissedFullPopup(false); }, [searchIn, searchOut]);

  // Same rule as canSubmit: a non-empty selection where every segment is
  // either ≥2 nights or a genuine 1-night orphan gap.
  const meetsMin = segments.length > 0 && !hasInvalidSingleNight;

  // Build month header groups
  const monthGroups = [];
  let cur = null;
  DATES.forEach((d, i) => {
    const mk = `${d.getFullYear()}-${d.getMonth()}`;
    if (!cur || cur.key !== mk) {
      cur = { key: mk, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, count: 1, start: i };
      monthGroups.push(cur);
    } else { cur.count++; }
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Work Sans', 'Helvetica Neue', Arial, sans-serif" }}>
        <div style={{ color: "#7A8C7D", fontSize: 14 }}>Loading availability…</div>
      </div>
    );
  }
  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Work Sans', 'Helvetica Neue', Arial, sans-serif", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ color: "#C0392B", fontSize: 14, marginBottom: 10 }}>{loadError}</div>
          <button onClick={() => { setLoading(true); loadAvailability().finally(() => setLoading(false)); }}
            style={{ background: SELECTED_BG, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "'Work Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Persistent WhatsApp contact — always available, sits behind any
          focused modal (photo viewer, room details, date picker, etc.) so it
          never clutters those, but is otherwise visible throughout. */}
      <a
        href="https://wa.me/27723770575?text=Hi!%20I%20have%20a%20question%20about%20booking%20at%20Khaya."
        target="_blank"
        rel="noreferrer"
        title="Message us on WhatsApp"
        style={{
          position: "fixed", right: 14, bottom: selected.size > 0 ? 80 : 14, zIndex: 140,
          width: 52, height: 52, borderRadius: "50%",
          background: "#258071", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, textDecoration: "none",
          boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
          transition: "bottom 0.2s ease",
        }}
      >
        💬
      </a>
      {/* Top bar */}
      <div style={{
        background: HEADER_BG, color: "#fff", padding: "14px 20px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#9DC5D6", textTransform: "uppercase", marginBottom: 2 }}>Khaya Kitehouse</div>
          <div style={{ fontSize: 18, fontWeight: 500, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>Availability Calendar</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              style={{ background: "none", border: "1px solid #9DC5D6", color: "#9DC5D6", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}
            >
              Clear
            </button>
          )}
          <button
            disabled={view === "calendar" && !meetsMin}
            onClick={() => setView(view === "calendar" ? "summary" : "calendar")}
            style={{
              background: view === "summary" ? "transparent" : meetsMin ? "#C1694F" : "#2A4550",
              color: view === "summary" ? "#9DC5D6" : meetsMin ? "#fff" : "#8496A0",
              border: view === "summary" ? "1px solid #9DC5D6" : "none", borderRadius: 8,
              padding: "8px 18px", cursor: (view === "calendar" && !meetsMin) ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 800, transition: "background 0.2s",
              boxShadow: (view === "calendar" && meetsMin) ? "0 2px 10px rgba(193,105,79,0.4)" : "none",
            }}
          >
            {view === "calendar" ? `Request to Book` : `Back to calendar`}
          </button>
        </div>
        <svg style={{ position: "absolute", left: 0, right: 0, bottom: -1, width: "100%", height: 22, display: "block" }} viewBox="0 0 400 28" preserveAspectRatio="none">
          <path d="M0,14 C33,4 67,4 100,14 C133,24 167,24 200,14 C233,4 267,4 300,14 C333,24 367,24 400,14 L400,28 L0,28 Z" fill={PAGE_BG} />
        </svg>
      </div>

      {view === "calendar" ? (
        <>
          {/* How-to popup — shows when the calendar opens */}
          {showHelp && (
            <div
              onClick={dismissHelp}
              style={{ position: "fixed", inset: 0, background: "rgba(20,30,22,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ background: "#fff", borderRadius: 16, maxWidth: 380, width: "100%", padding: "26px 24px", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
              >
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, fontWeight: 700, color: HEADER_BG, marginBottom: 4 }}>
                  Welcome to Khaya
                </div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Booking stays here is easy — here's how:</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <HelpStep n="1" title="Browse the dates">
                    Select your dates or slide your finger along the <strong>date row at the top</strong> to scroll through availability.
                  </HelpStep>
                  <HelpStep n="2" title="Pick your room(s)">
                    Tap and drag across the white cells to choose your nights.
                  </HelpStep>
                  <HelpStep n="3" title="Review your stay">
                    Hit <em>Request to Book</em> for a summary and price.
                  </HelpStep>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, fontSize: 13, color: "#666", cursor: "pointer" }}>
                  <input type="checkbox" checked={dontShowHelp} onChange={(e) => setDontShowHelp(e.target.checked)} style={{ width: 16, height: 16, accentColor: SELECTED_BG }} />
                  Don't show this again
                </label>

                <button
                  onClick={dismissHelp}
                  style={{ marginTop: 16, width: "100%", background: SELECTED_BG, color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Date search + party size */}
          <div style={{ padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Dates</div>
              <button
                onClick={() => setShowDatePicker(true)}
                style={{
                  ...searchInputStyle, cursor: "pointer", textAlign: "left",
                  minWidth: 168, display: "inline-flex", alignItems: "center", gap: 8,
                  color: searchIn ? "#1F4E63" : "#999",
                }}
              >
                <span style={{ fontSize: 15 }}>📅</span>
                {searchIn
                  ? `${prettyShort(searchIn)} ${searchOut ? "→ " + prettyShort(searchOut) : "→ …"}`
                  : "Arrive → Leave"}
              </button>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Guests</div>
              <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden", height: 38 }}>
                <button onClick={() => setPeople(p => Math.max(1, p - 1))} style={stepBtn} aria-label="Fewer guests">−</button>
                <span style={{ minWidth: 28, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#1F4E63" }}>{people}</span>
                <button onClick={() => setPeople(p => Math.min(8, p + 1))} style={stepBtn} aria-label="More guests">+</button>
              </div>
            </div>
            {searchIn && (
              <button
                onClick={() => { setSearchIn(""); setSearchOut(""); }}
                style={{ background: "none", border: "none", color: "#999", fontSize: 12, cursor: "pointer", padding: "0 0 10px" }}
              >
                Clear dates
              </button>
            )}
          </div>

          {/* First coach mark: inline, immediately below the date input so it
              naturally points at it on every screen size without fixed-pixel
              positioning that breaks between phone and desktop. */}
          {showCoach && (
            <div style={{ display: "flex", justifyContent: "flex-start", padding: "6px 16px 0", pointerEvents: "none" }}>
              <style>{`
                @keyframes khayaBounceUp { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @keyframes khayaFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
              `}</style>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(28,56,41,0.94)", color: "#fff", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 600, boxShadow: "0 4px 14px rgba(0,0,0,0.25)", animation: "khayaFade 0.3s ease both" }}>
                <span style={{ display: "inline-block", animation: "khayaBounceUp 1.1s ease-in-out infinite", fontSize: 15 }}>👆</span>
                Choose your dates here
              </div>
            </div>
          )}

          {/* Date-range picker popup */}
          {showDatePicker && (
            <DateRangePicker
              start={SEASON_START}
              end={SEASON_END}
              searchIn={searchIn}
              searchOut={searchOut}
              onPick={(inKey, outKey) => {
                setSearchIn(inKey);
                setSearchOut(outKey);
                if (outKey) { setShowDatePicker(false); jumpToDate(inKey); }
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}

          {/* Room photo lightbox */}
          {lightboxRoom && (
            <PhotoLightbox
              room={lightboxRoom}
              index={lightboxIndex}
              onIndexChange={setLightboxIndex}
              onClose={() => setLightboxRoom(null)}
            />
          )}

          {/* Triggered popup: the guest searched a specific range and nothing fits
              anywhere — this is the moment to mention Mayana, since it's the one
              point where the app can tell the guest "no" with confidence. */}
          {noRoomFitsSearch && !dismissedFullPopup && (
            <div onClick={() => setDismissedFullPopup(true)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }}>
              <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 20, width: "100%", maxWidth: 420 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#1F4E63", marginBottom: 8 }}>Oops — time to message me</div>
                <p style={{ fontSize: 14, color: "#444", lineHeight: 1.5, marginTop: 0, marginBottom: 14 }}>
                  Calendar is looking pretty full for {prettyShort(searchIn)} → {prettyShort(searchOut)}, but contact me directly and I can often still find you space at Khaya or at our sister guesthouse nearby.
                </p>
                <button onClick={() => setDismissedFullPopup(true)} style={{ width: "100%", background: SELECTED_BG, color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Legend + reopen help */}
          <div style={{ padding: "10px 16px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", borderBottom: `1px solid ${BORDER}`, background: "#FAF7F2" }}>
            <button
              onClick={() => setShowHelp(true)}
              style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: SELECTED_BG, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <span style={{ fontWeight: 700 }}>?</span> How it works
            </button>
            <span style={{ fontSize: 11, color: "#7A6F5E" }}>
              <strong style={{ color: "#5A4F3E" }}>Long-stay discounts:</strong> ≥30 days 10% · ≥60 days 15% · ≥90 days 18%
            </span>
            <div style={{ display: "flex", gap: 14, marginLeft: "auto", flexWrap: "wrap" }}>
              <Legend color={FREE_BG} border="#ccc" label="Available" />
              <Legend color={BOOKED_BG} label="Booked" />
              <Legend color={SELECTED_BG} label="Your selection" />
              <span style={{ fontSize: 11, color: "#888" }}>Dorm numbers = beds free</span>
            </div>
          </div>

          {/* Standing sister-property nudge — always visible, separate from the
              triggered full-dates popup below. Deliberately a bit more
              noticeable than a typical helper line, but still calm — a
              left accent border and icon, not a loud banner. */}
          <div style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#3D3424", background: "#F2EDE0", borderBottom: `1px solid ${BORDER}`, borderLeft: `4px solid ${SELECTED_BG}`, textAlign: "center" }}>
            Fully booked for your dates? Message me anyway — I can often still find a space at Khaya, or at our sister guesthouse nearby.
          </div>

          {/* Tape chart */}
          <div style={{ position: "relative" }}>
          <div
            ref={scrollRef}
            style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 130px)", position: "relative", paddingBottom: 90 }}
          >
            <table style={{ borderCollapse: "collapse", tableLayout: "fixed", minWidth: ROOM_COL_W + DATES.length * CW }}>

              {/* Month row */}
              <thead style={{ position: "sticky", top: 0, zIndex: 50 }}>
                <tr>
                  <th style={{ width: ROOM_COL_W, minWidth: ROOM_COL_W, background: HEADER_BG, position: "sticky", left: 0, zIndex: 60, border: "none" }} />
                  {monthGroups.map(mg => (
                    <th
                      key={mg.key}
                      colSpan={mg.count}
                      style={{
                        background: HEADER_BG, color: "#9DC5D6",
                        fontSize: 11, fontWeight: 700, letterSpacing: 2,
                        textTransform: "uppercase", textAlign: "left",
                        padding: "6px 8px", borderLeft: "1px solid #2C6E8E",
                        border: "none", borderBottom: "none",
                      }}
                    >
                      {mg.label}
                    </th>
                  ))}
                </tr>

                {/* Day-of-week row */}
                <tr>
                  <th style={{
                    width: ROOM_COL_W, minWidth: ROOM_COL_W, background: "#1B3E4F",
                    position: "sticky", left: 0, zIndex: 60,
                    color: "#9DC5D6", fontSize: 10, padding: "4px 8px", textAlign: "left",
                    borderRight: `2px solid #2C6E8E`, whiteSpace: "nowrap",
                  }}>
                    Room
                  </th>
                  {DATES.map((d, i) => {
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isToday   = i === 0;
                    const isMonthStart = d.getDate() === 1;
                    const searched = inSearchWindow(toKey(d));
                    return (
                      <th
                        key={i}
                        style={{
                          width: CW, minWidth: CW, maxWidth: CW,
                          background: searched ? "#CC6E48" : isToday ? "#2C6E8E" : isWeekend ? "#24445A" : "#1B3E4F",
                          color: searched ? "#1F4E63" : isToday ? "#fff" : isWeekend ? "#9DC5D6" : "#9DC5D6",
                          fontSize: 9, fontWeight: isToday || searched ? 800 : 600,
                          textAlign: "center", padding: "3px 0", userSelect: "none",
                          borderLeft: isMonthStart ? `2px solid #9DC5D6` : `1px solid #2C6E8E`,
                          borderRight: i === DATES.length - 1 ? `1px solid #2C6E8E` : "none",
                          overflow: "hidden",
                        }}
                      >
                        {Z.showNumbers ? (
                          <>
                            <div>{DAY_NAMES[d.getDay()]}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 1 }}>{d.getDate()}</div>
                          </>
                        ) : (
                          <div style={{ fontSize: 8, fontWeight: 700, lineHeight: 1 }}>
                            {(d.getDay() === 1 || isMonthStart) ? d.getDate() : " "}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Room rows */}
              <tbody>
                {GUEST_ROOMS.map((room, ri) => {
                  const myDates = [...selected].filter(kk => kk.startsWith(room.id + "::")).map(kk => kk.split("::")[1]).sort();
                  const myPricing = myDates.length ? priceSegment(room, myDates, people, totalNights) : null;
                  // If no cells picked yet but the guest searched dates, estimate this
                  // room's average/night across that window.
                  const searchPricing = (!myPricing && searchNights.length) ? priceSegment(room, searchNights, people, searchNights.length) : null;
                  const rowPricing = myPricing || searchPricing; // what drives the row price line
                  const isGroupStart = ri === 0 ||
                    (ri === 8)  || // dorm section
                    (ri === 11) || // tent section
                    (ri === 12);   // special section

                  return (
                    <>
                      {isGroupStart && ri > 0 && (
                        <tr key={`sep-${ri}`}>
                          <td colSpan={DATES.length + 1} style={{ height: 4, background: "#E8E0D6", padding: 0 }} />
                        </tr>
                      )}
                      <tr key={room.id} style={{ height: RH }}>
                        {/* Room name cell — sticky */}
                        <td style={{
                          position: "sticky", left: 0, zIndex: 10,
                          background: "#FAF7F2", borderRight: `2px solid #C8BFB5`,
                          padding: "0 8px 0 10px", fontSize: 12, fontWeight: 600,
                          color: "#2D2D2D", whiteSpace: "nowrap",
                          width: ROOM_COL_W, minWidth: ROOM_COL_W,
                          borderBottom: `1px solid ${BORDER}`,
                        }}>
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <RoomDot type={room.type} />
                              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{room.name}</span>
                              <button
                                onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                                aria-label={`Details for ${room.name}`}
                                style={{
                                  background: "none", border: "none", cursor: "pointer", padding: 2,
                                  color: "#7A8C7D", fontSize: 11, lineHeight: 1, flexShrink: 0,
                                  transform: expandedRoom === room.id ? "rotate(180deg)" : "none",
                                  transition: "transform 0.15s",
                                }}
                              >
                                ▼
                              </button>
                            </div>
                            {zoom !== "overview" && (
                              <div style={{ fontSize: 10, fontWeight: 700, color: rowPricing ? SELECTED_BG : "#9A9388", marginLeft: 12, lineHeight: 1.2 }}>
                                {rowPricing
                                  ? `€${(rowPricing.total / rowPricing.nights).toFixed(2)}/n`
                                  : `€${room.priceLow}/n`}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Date cells */}
                        {DATES.map((d, ci) => {
                          const dk  = toKey(d);
                          const k   = cellKey(room.id, dk);
                          const bkd = isBooked(room.id, dk);
                          const pnd = isPending(room.id, dk);
                          const sel = selected.has(k);
                          const dorm = isDorm(room.id);
                          const free = dorm ? bedsFree(room.id, dk) : null;
                          // "Too small" = can't hold the party (dorm short on beds, or a
                          // 2-sleeper private/tent with a group bigger than 2).
                          const tooSmall = !bkd && !pnd && !sel && !fitsParty(room.id, dk, people);
                          const takenElsewhere = !sel && !bkd && !pnd && !tooSmall && dateTakenElsewhere(room.id, dk);
                          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                          const isToday   = ci === 0;

                          let bg = FREE_BG;
                          if (bkd) bg = BOOKED_BG;
                          else if (pnd) bg = "#EFD9CE";
                          else if (sel) bg = SELECTED_BG;
                          else if (takenElsewhere) bg = "#E9E4DD";
                          else if (tooSmall) bg = "#EFE7E4"; // not enough beds for the party
                          else if (isWeekend) bg = "#F8F4EF";

                          const locked = bkd || pnd || takenElsewhere || tooSmall;
                          const showNum = dorm && !bkd && Z.showNumbers;
                          const numColor = sel ? "#fff" : tooSmall ? "#B06A5E" : "#1B2A2E";

                          return (
                            <td
                              key={ci}
                              data-room={room.id}
                              data-date={dk}
                              onPointerDown={(e) => {
                                if (locked) return;
                                if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                                  e.currentTarget.releasePointerCapture(e.pointerId);
                                }
                                beginDrag(room.id, dk);
                              }}
                              onPointerEnter={(e) => { if (e.pointerType === "mouse") setHoverCol(ci); }}
                              onPointerLeave={(e) => { if (e.pointerType === "mouse") setHoverCol(null); }}
                              title={
                                pnd ? "Pending request — held while we confirm"
                                : takenElsewhere ? "This night is already in another room — remove it there first"
                                : tooSmall && dorm ? `Only ${free} bed${free !== 1 ? "s" : ""} left — not enough for ${people}`
                                : tooSmall ? `Sleeps 2 — too small for ${people}`
                                : dorm && !bkd ? `${free} bed${free !== 1 ? "s" : ""} free`
                                : undefined
                              }
                              style={{
                                width: CW, minWidth: CW, maxWidth: CW,
                                height: RH, padding: 0, textAlign: "center",
                                fontSize: CW >= 30 ? 12 : 10, fontWeight: 700,
                                background: bg,
                                // Was two separate `backgroundImage` keys before (one for pending,
                                // one for takenElsewhere) — in a JS object literal the second one
                                // silently wins, so the pending stripe was never actually
                                // reaching the screen. Merged into one so both work correctly.
                                backgroundImage: pnd
                                  ? "repeating-linear-gradient(45deg, rgba(166,90,60,0.5) 0 5px, transparent 5px 10px)"
                                  : takenElsewhere
                                    ? "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 8px)"
                                    : "none",
                                borderLeft: isToday ? `2px solid ${SELECTED_BG}` : `1px solid ${bkd ? "#A8502F" : pnd ? "#C98A6B" : sel ? "#1F5670" : BORDER}`,
                                borderBottom: `1px solid ${bkd ? "#A8502F" : pnd ? "#C98A6B" : sel ? "#1F5670" : BORDER}`,
                                cursor: locked ? "not-allowed" : "pointer",
                                userSelect: "none",
                                touchAction: "pan-y",
                                transition: "background 0.08s",
                                outline: hoverCol === ci && !locked ? "1px solid #AAA" : "none",
                                outlineOffset: -1,
                              }}
                            >
                              {showNum ? <span style={{ color: numColor, pointerEvents: "none" }}>{free}</span> : null}
                            </td>
                          );
                        })}
                      </tr>

                      {expandedRoom === room.id && (
                        <tr key={room.id + "-details"}>
                          <td colSpan={DATES.length + 1} style={{ padding: 0, background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
                            <div style={{
                              position: "sticky", left: 0,
                              width: "min(460px, 92vw)", padding: "14px 16px",
                              display: "flex", gap: 14, alignItems: "flex-start",
                            }}>
                              <div style={{ width: 120, flexShrink: 0 }}>
                                {room.photos && room.photos.length ? (
                                  <div
                                    onClick={() => { setLightboxRoom(room); setLightboxIndex(0); }}
                                    style={{ position: "relative", cursor: "pointer" }}
                                    title="View photos"
                                  >
                                    <img src={room.photos[0]} alt={room.name} style={{ width: "100%", borderRadius: 10, display: "block", aspectRatio: "4 / 3", objectFit: "cover" }} />
                                    {room.photos.length > 1 && (
                                      <span style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 6px" }}>
                                        1/{room.photos.length}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{
                                    width: "100%", aspectRatio: "4 / 3", borderRadius: 10,
                                    background: `linear-gradient(135deg, ${roomTint(room.type)}, #FAF7F2)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#8496A0", fontSize: 11, textAlign: "center", padding: 6,
                                  }}>
                                    Photo coming soon
                                  </div>
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#1F4E63", marginBottom: 4 }}>{room.name}</div>
                                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 8 }}>{room.desc}</div>
                                {myPricing ? (
                                  <div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: SELECTED_BG }}>
                                      €{myPricing.total}
                                      <span style={{ fontSize: 11, fontWeight: 500, color: "#999" }}> for your {myPricing.nights} night{myPricing.nights !== 1 ? "s" : ""}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
                                      ≈ €{(myPricing.total / myPricing.nights).toFixed(2)}/night{myPricing.isDormRoom ? ` · ${people} bed${people !== 1 ? "s" : ""}` : ""}{myPricing.pct ? ` · ${myPricing.pct}% long-stay off` : ""}
                                    </div>
                                  </div>
                                ) : searchPricing ? (
                                  <div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: SELECTED_BG }}>
                                      ≈ €{(searchPricing.total / searchPricing.nights).toFixed(2)}
                                      <span style={{ fontSize: 11, fontWeight: 500, color: "#999" }}> / night{searchPricing.isDormRoom ? " per bed" : ""}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
                                      average for your {searchPricing.nights} night{searchPricing.nights !== 1 ? "s" : ""}{searchPricing.pct ? ` · incl. ${searchPricing.pct}% long-stay off` : ""}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: SELECTED_BG }}>
                                      €{room.priceLow} <span style={{ fontSize: 11, fontWeight: 500, color: "#999" }}>/ night{room.type === "dorm" ? " per bed" : ""}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>before discounts or surcharges</div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => setExpandedRoom(null)}
                                aria-label="Close details"
                                style={{ background: "none", border: "none", color: "#bbb", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0, flexShrink: 0 }}
                              >×</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* First-use animated hints over the grid */}
          {showCoach && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 60 }}>
              <style>{`
                @keyframes khayaSlide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(26px); } }
                @keyframes khayaTap   { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.82); opacity: 0.6; } }
                @keyframes khayaFade  { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
              `}</style>

              {/* Hint 2 — OR slide along the dates (anchored near the date header) */}
              {showCoach2 && (
                <div style={{ position: "absolute", top: 8, left: ROOM_COL_W + 10, right: 12, display: "flex", justifyContent: "center", animation: "khayaFade 0.3s ease both" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(28,56,41,0.94)", color: "#fff", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 600, boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}>
                    <span style={{ display: "inline-block", animation: "khayaSlide 1.3s ease-in-out infinite", fontSize: 15 }}>👉</span>
                    OR slide along the dates to browse
                  </div>
                </div>
              )}

              {/* Hint 3 — pick your nights (anchored over the first room rows) */}
              {showCoach3 && (
                <div style={{ position: "absolute", top: 150, left: ROOM_COL_W + 64, display: "flex", animation: "khayaFade 0.3s ease both" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: SELECTED_BG, color: "#fff", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 600, boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}>
                    <span style={{ display: "inline-block", animation: "khayaTap 1.1s ease-in-out infinite", fontSize: 15 }}>👆</span>
                    Tap &amp; drag white cells to pick nights
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Floating selection tally */}
          {selected.size > 0 && (
            <div style={{
              position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
              background: SELECTED_BG, color: "#fff", borderRadius: 24,
              padding: "10px 16px", fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 200,
              display: "flex", gap: 14, alignItems: "center", justifyContent: "center",
              maxWidth: "96vw", flexWrap: "wrap", textAlign: "center",
            }}>
              {meetsMin ? (
                <>
                  <span style={{ whiteSpace: "nowrap" }}>{totalNights} night{totalNights !== 1 ? "s" : ""} selected</span>
                  <span style={{ opacity: 0.7 }}>|</span>
                  <span style={{ whiteSpace: "nowrap" }}>€{totalCost}</span>
                  <span style={{ opacity: 0.7 }}>|</span>
                  <span
                    onClick={() => setView("summary")}
                    style={{ textDecoration: "underline", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Review →
                  </span>
                </>
              ) : (
                // Decluttered on purpose: the nights/price info above isn't
                // actionable while the selection is invalid, so showing just
                // the warning alone keeps this readable and short enough to
                // never need to wrap awkwardly on a small phone screen.
                <span style={{ color: "#F4D58D" }}>
                  {hasInvalidSingleNight ? "Uh-oh! Sorry, we don't allow 1 night bookings. Please choose a longer range of days" : "Minimum 2 nights"}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        /* ── Summary view ── */
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1F4E63", marginBottom: 4 }}>Your stay at Khaya</h2>
          <p style={{ color: "#888", fontSize: 13, marginTop: 0, marginBottom: 28 }}>
            {gaps.length > 0
              ? `Split across ${segments.length} room${segments.length !== 1 ? "s" : ""}, with ${gaps.reduce((s, g) => s + g.nights, 0)} night${gaps.reduce((s, g) => s + g.nights, 0) !== 1 ? "s" : ""} still open.`
              : segments.length > 1
                ? `Split across ${segments.length} rooms — every night covered.`
                : "One room for your whole stay."}
          </p>

          {/* Timeline bar — spans the full range so gaps show as light breaks */}
          <FullTimeline selected={selected} segments={segments} />

          {/* Fewer-moves banner: only appears when one room could cover the whole stay */}
          {consolidation && (
            <div style={{
              background: "#EAF1E5", border: "1px solid #9DBE86", borderRadius: 12,
              padding: "16px 18px", marginBottom: 16,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2C6E8E", marginBottom: 6 }}>
                1 room could cover your whole stay
              </div>
              <div style={{ fontSize: 13, color: "#3C5A45", lineHeight: 1.5, marginBottom: 12 }}>
                {consolidation.room.name} is free for all {consolidation.nights.length} of your nights — no room changes. €{consolidation.total} total.
              </div>
              <button
                onClick={() => setSelected(new Set(consolidation.nights.map(dk => cellKey(consolidation.room.id, dk))))}
                style={{
                  background: "#2C6E8E", color: "#fff", border: "none", borderRadius: 8,
                  padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Switch to {consolidation.room.name} →
              </button>
            </div>
          )}

          {/* Missing-night banner */}
          {gaps.length > 0 && (
            <div style={{
              background: "#FBF1E3", border: "1px solid #E8C879", borderRadius: 12,
              padding: "16px 18px", marginBottom: 24,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#8B6914", marginBottom: 8 }}>
                Missing a night? No worries.
              </div>
              <div style={{ fontSize: 13, color: "#6B5410", lineHeight: 1.5, marginBottom: 10 }}>
                These nights aren't covered yet. Send your request through anyway and we'll try to find space on our side:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {gaps.map((g, i) => {
                  const from = new Date(g.from + "T00:00:00");
                  const to   = new Date(g.to + "T00:00:00");
                  const toPlus = addDays(to, 1);
                  return (
                    <div key={i} style={{
                      fontSize: 12, color: "#8B6914", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8C879", display: "inline-block" }} />
                      {fmt(from, { day: "numeric", month: "short" })}
                      {g.nights > 1 ? ` → ${fmt(toPlus, { day: "numeric", month: "short" })}` : ""}
                      {" · "}{g.nights} night{g.nights !== 1 ? "s" : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Segment cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {segments.map((seg, i) => {
              const from = new Date(seg.dates[0] + "T00:00:00");
              const to   = new Date(seg.dates[seg.dates.length - 1] + "T00:00:00");
              const toPlus = addDays(to, 1);
              const p = priceSegment(seg.room, seg.dates, people, totalNights);
              const beds = p.beds;
              return (
                <div key={i} style={{
                  background: "#fff", borderRadius: 12,
                  border: `1px solid ${BORDER}`, padding: "16px 18px",
                  display: "flex", gap: 16,
                }}>
                  <div style={{
                    width: 10, borderRadius: 99,
                    background: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1F4E63" }}>{seg.room.name}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1F4E63" }}>€{p.total}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                      {fmt(from, { day: "numeric", month: "short" })} → {fmt(toPlus, { day: "numeric", month: "short" })} · {p.nights} night{p.nights !== 1 ? "s" : ""}{p.isDormRoom ? ` · ${people} bed${people !== 1 ? "s" : ""}` : ""}
                    </div>

                    {/* Breakdown — how the price was reached */}
                    <div style={{ fontSize: 12, color: "#666", display: "flex", flexDirection: "column", gap: 3, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
                      {p.lowN > 0 && (
                        <Row label={`${p.lowN} low-season night${p.lowN !== 1 ? "s" : ""} × €${p.lowRate}${beds > 1 ? ` × ${beds} beds` : ""}`} value={`€${p.lowN * p.lowRate * beds}`} />
                      )}
                      {p.highN > 0 && (
                        <Row label={`${p.highN} high-season night${p.highN !== 1 ? "s" : ""} × €${p.highRate}${beds > 1 ? ` × ${beds} beds` : ""}`} value={`€${p.highN * p.highRate * beds}`} />
                      )}
                      {p.surcharge > 0 && (
                        <Row label={`Double occupancy +€${p.surchargePer}/night × ${p.nights}`} value={`€${p.surcharge}`} />
                      )}
                      {p.pct > 0 && (
                        <Row label={`Long-stay discount (${p.stayNights}-night stay → ${p.pct}% off)`} value={`−€${p.discount}`} accent="#2D6B32" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div style={{
            background: HEADER_BG, borderRadius: 12, padding: "18px 22px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            color: "#fff", marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: 13, color: "#9DC5D6" }}>Total</div>
              <div style={{ fontSize: 13, color: "#9DC5D6", marginTop: 3 }}>{totalNights} nights across {segments.length} room{segments.length !== 1 ? "s" : ""}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>€{totalCost}</div>
          </div>

          {/* Your details */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1F4E63", marginBottom: 8 }}>Your details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Name <span style={{ color: "#C0392B" }}>*</span></label>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your full name"
                  style={{ width: "100%", boxSizing: "border-box", marginTop: 4, border: `1px solid ${BORDER}`, borderRadius: 9, padding: "11px 12px", fontSize: 15, color: "#1F4E63", fontFamily: "inherit" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>
                  WhatsApp number <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+27 ... or 0027 ..."
                  inputMode="tel"
                  style={{ width: "100%", boxSizing: "border-box", marginTop: 4, border: `1px solid ${phoneTouchedInvalid ? "#C0392B" : BORDER}`, borderRadius: 9, padding: "11px 12px", fontSize: 15, color: "#1F4E63", fontFamily: "inherit" }}
                />
                <div style={{ fontSize: 11, color: phoneTouchedInvalid ? "#C0392B" : "#aaa", marginTop: 4 }}>
                  Include the country code — start with + or 00 (e.g. +27 or 0027).
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>
                  Email
                </label>
                <input
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Optional"
                  inputMode="email"
                  style={{ width: "100%", boxSizing: "border-box", marginTop: 4, border: `1px solid ${emailTouchedInvalid ? "#C0392B" : BORDER}`, borderRadius: 9, padding: "11px 12px", fontSize: 15, color: "#1F4E63", fontFamily: "inherit" }}
                />
                <div style={{ fontSize: 11, color: emailTouchedInvalid ? "#C0392B" : "#aaa", marginTop: 4 }}>
                  Optional — happy to have it as a backup, but not required.
                </div>
              </div>
            </div>
          </div>

          {/* Deposit & cancellation policy (expandable) */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
            <button
              onClick={() => setShowPolicy(s => !s)}
              style={{ width: "100%", background: "#FAF7F2", border: "none", padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#1F4E63" }}
            >
              Deposit &amp; cancellation policy
              <span style={{ transform: showPolicy ? "rotate(180deg)" : "none", transition: "transform 0.15s", color: "#7A8C7D" }}>▼</span>
            </button>
            {showPolicy && (
              <div style={{ padding: "14px 16px", fontSize: 13, color: "#444", lineHeight: 1.55 }}>
                <p style={{ marginTop: 0 }}>
                  Payment is taken after confirmation of your booking request, via WhatsApp or email.
                </p>
                <div style={{ fontWeight: 700, color: "#1F4E63", marginTop: 12, marginBottom: 4 }}>Deposit policy</div>
                <p style={{ margin: 0 }}>
                  100% of the stay is payable on confirmation of your reservation, or 50% if your booking is over 30 nights — with the other 50% due just before arrival.
                </p>
                <div style={{ fontWeight: 700, color: "#1F4E63", marginTop: 12, marginBottom: 4 }}>Cancellation policy</div>
                <ul style={{ marginTop: 0, marginBottom: 12, paddingLeft: 18 }}>
                  <li>60 or more days before arrival — 100% refund</li>
                  <li>59–30 days before arrival — 50% refund</li>
                  <li>Less than 30 days before arrival, or no-show — 0% refund</li>
                </ul>
                <p style={{ marginTop: 0, marginBottom: 12 }}>
                  That said, if you change or cancel — even shortly before or during your stay — we'll always try to fill the room or bed for you, and if we succeed we'll return your deposit in full. So please get in touch and we'll find the best solution together.
                </p>
                <p style={{ marginBottom: 0, fontWeight: 600, color: "#1F4E63" }}>
                  Your booking is only valid after we have sent you a final confirmation and payment is taken.
                </p>
              </div>
            )}
          </div>

          <button
            disabled={!canSubmit || submitting}
            onClick={async () => {
              const ok = await submitRequest({
                guestName, guestWhatsapp: guestPhone, guestEmail, people,
                segments: selectionToSubmissionSegments(selected),
              });
              if (ok) setRequestSent(true);
            }}
            style={{
              width: "100%", padding: "15px 0",
              background: (!canSubmit || submitting) ? "#B9C7BD" : SELECTED_BG,
              color: "#fff", border: "none",
              borderRadius: 12, fontSize: 15, fontWeight: 800,
              cursor: (!canSubmit || submitting) ? "not-allowed" : "pointer",
              letterSpacing: 0.5,
            }}>
            {requestSent ? "Request sent ✓" : submitting ? "Sending…" : "Send request"}
          </button>
          {submitError && (
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, lineHeight: 1.5, color: "#C0392B", fontWeight: 600 }}>
              {submitError}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 10, fontSize: requestSent ? 13 : 11, lineHeight: 1.5, color: requestSent ? "#2C6E8E" : "#aaa", fontWeight: requestSent ? 600 : 400 }}>
            {requestSent
              ? (awayUntilKey
                  ? `Thanks for your booking request. We're away for a few days and will be slower than usual to reply — but don't worry, your request is locked in until we're back on ${prettyShort(awayUntilKey)}. The booking is only confirmed once approved on our side and payment received.`
                  : "Thanks for your booking request, we will be in touch within 24 hours. Please note the booking is only confirmed once approved on our side and payment received.")
              : (!guestName.trim()
                  ? "Please add your name and WhatsApp number to continue."
                  : !phoneValid
                    ? "Enter a WhatsApp number starting with + or 00 to continue."
                    : emailTouchedInvalid
                      ? "That email doesn't look quite right — fix it or clear the field to continue."
                      : gaps.length > 0
                        ? "We'll confirm what we can cover, including the open nights, within 24 hours."
                        : "We'll get back to you within 24 hours to confirm and arrange payment.")}
          </div>
          {requestSent && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <a
                href="https://wa.me/27723770575?text=Hi!%20I%20just%20sent%20a%20booking%20request%20on%20the%20calendar%20%E2%80%94%20wanted%20to%20follow%20up."
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-block", background: "#258071", color: "#fff", borderRadius: 20, padding: "9px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
              >
                💬 Message me on WhatsApp
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SEGMENT_COLORS = ["#2C6E8E", "#6B8F3E", "#C4622D", "#8B6914", "#2B5E8C", "#7B5EA7", "#5C6B6E", "#A0522D"];

// Timeline spanning the full booking range; selected nights coloured by room,
// gaps shown as a hatched light strip.
function FullTimeline({ selected, segments }) {
  const dates = [...selected].map(k => k.split("::")[1]).sort();
  if (dates.length === 0) return null;
  const first = new Date(dates[0] + "T00:00:00");
  const last  = new Date(dates[dates.length - 1] + "T00:00:00");

  // Map each date -> segment index (for colour)
  const dateToColor = {};
  segments.forEach((seg, i) => {
    seg.dates.forEach(d => { dateToColor[d] = SEGMENT_COLORS[i % SEGMENT_COLORS.length]; });
  });

  const cells = [];
  let cursor = new Date(first);
  while (cursor <= last) {
    const key = toKey(cursor);
    cells.push({ key, color: dateToColor[key] || null });
    cursor.setDate(cursor.getDate() + 1);
  }

  return (
    <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 20, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
      {cells.map((c, i) => (
        <div
          key={i}
          title={c.color ? c.key : `${c.key} — open`}
          style={{
            flex: 1, minWidth: 2,
            background: c.color || "#EDE7DE",
            backgroundImage: c.color ? "none"
              : "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(184,150,60,0.4) 3px, rgba(184,150,60,0.4) 6px)",
          }}
        />
      ))}
    </div>
  );
}

function Legend({ color, label, border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#666" }}>
      <div style={{ width: 14, height: 14, background: color, borderRadius: 3, border: border ? `1px solid ${border}` : "none" }} />
      {label}
    </div>
  );
}

function HelpStep({ n, title, children }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "#2C6E8E", color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1F4E63", marginBottom: 1 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.45 }}>{children}</div>
      </div>
    </div>
  );
}

// "12 Oct" from a YYYY-MM-DD key
function prettyShort(key) {
  if (!key) return "";
  const d = new Date(key + "T00:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// Custom tap-arrive-then-tap-leave date range picker. Works everywhere (no
// reliance on the native date input, which the artifact sandbox blocks).
// Full-screen photo viewer for a room — opened by tapping its thumbnail.
// Supports left/right navigation (buttons, keyboard arrows, and a small
// thumbnail strip) when a room has more than one photo; degrades cleanly
// to just a close button when there's only one.
function PhotoLightbox({ room, index, onIndexChange, onClose }) {
  const photos = room.photos || [];
  const hasMultiple = photos.length > 1;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && hasMultiple) onIndexChange((index + 1) % photos.length);
      else if (e.key === "ArrowLeft" && hasMultiple) onIndexChange((index - 1 + photos.length) % photos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, hasMultiple, onIndexChange, onClose]);

  if (!photos.length) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(10,16,12,0.92)", zIndex: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "50%", width: 38, height: 38, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>

      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12, textAlign: "center" }}>{room.name}</div>

      <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: 640, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {hasMultiple && (
          <button
            onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
            style={{ position: "absolute", left: 4, background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, fontSize: 18, cursor: "pointer", zIndex: 1 }}
          >‹</button>
        )}
        <img src={photos[index]} alt={`${room.name} photo ${index + 1} of ${photos.length}`} style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 10, display: "block", objectFit: "contain" }} />
        {hasMultiple && (
          <button
            onClick={() => onIndexChange((index + 1) % photos.length)}
            style={{ position: "absolute", right: 4, background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, fontSize: 18, cursor: "pointer", zIndex: 1 }}
          >›</button>
        )}
      </div>

      {hasMultiple && (
        <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 }}>
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              style={{
                width: 46, height: 34, padding: 0, border: i === index ? "2px solid #fff" : "2px solid transparent",
                borderRadius: 6, overflow: "hidden", cursor: "pointer", opacity: i === index ? 1 : 0.55, background: "none",
              }}
            >
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateRangePicker({ start, end, searchIn, searchOut, onPick, onClose }) {
  // Build the list of months spanning [start, end]
  const months = [];
  let m = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (m <= last) { months.push(new Date(m)); m = new Date(m.getFullYear(), m.getMonth() + 1, 1); }

  const startKey = toKey(start), endKey = toKey(end);

  function tapDay(key) {
    // No anchor yet, or a full range already chosen → start fresh
    if (!searchIn || (searchIn && searchOut)) { onPick(key, ""); return; }
    // Second tap before/on the anchor → reset anchor
    if (key <= searchIn) { onPick(key, ""); return; }
    // Second tap after the anchor → complete the range
    onPick(searchIn, key);
  }

  function inRange(key) {
    if (!searchIn) return false;
    const hi = searchOut || searchIn;
    return key >= searchIn && key <= hi;
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(20,30,22,0.55)", zIndex: 210, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, width: "100%", maxWidth: 460, maxHeight: "82vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 40px rgba(0,0,0,0.3)" }}
      >
        {/* Header */}
        <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: "#1F4E63" }}>
              {!searchIn ? "Pick your arrival" : !searchOut ? "Now pick your departure" : "Your dates"}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "#bbb", cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
            {searchIn ? `${prettyShort(searchIn)} ${searchOut ? "→ " + prettyShort(searchOut) : "→ …"}` : "Tap a day to start"}
          </div>
        </div>

        {/* Scrollable months */}
        <div style={{ overflowY: "auto", padding: "8px 14px 16px" }}>
          {months.map((mon, mi) => {
            const y = mon.getFullYear(), mo = mon.getMonth();
            const firstDow = new Date(y, mo, 1).getDay();
            const daysIn = new Date(y, mo + 1, 0).getDate();
            const cells = [];
            for (let i = 0; i < firstDow; i++) cells.push(null);
            for (let d = 1; d <= daysIn; d++) cells.push(d);
            return (
              <div key={mi} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1F4E63", margin: "6px 4px 8px" }}>
                  {mon.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                  {DAY_NAMES.map((dn, i) => (
                    <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#aaa" }}>{dn}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                  {cells.map((d, ci) => {
                    if (d === null) return <div key={ci} />;
                    const key = toKey(new Date(y, mo, d));
                    const outOfSeason = key < startKey || key > endKey;
                    const isAnchor = key === searchIn || key === searchOut;
                    const within = inRange(key);
                    // Flags a genuinely dead night — every guest-facing room
                    // blocked, nobody could book anything. Still tappable
                    // (a guest may want to select it anyway and message
                    // about it), just visually marked. Selection/anchor
                    // states still take priority if they tap it regardless.
                    const dead = !outOfSeason && nightFullyUnavailable(key);
                    return (
                      <button
                        key={ci}
                        disabled={outOfSeason}
                        onClick={() => tapDay(key)}
                        style={{
                          aspectRatio: "1 / 1", border: "none", borderRadius: 8,
                          fontSize: 13, fontWeight: isAnchor ? 800 : 500,
                          cursor: outOfSeason ? "default" : "pointer",
                          background: outOfSeason ? "transparent" : isAnchor ? SELECTED_BG : within ? "#DCEAE0" : dead ? "#F6DEDA" : "#F4F1EB",
                          color: outOfSeason ? "#D8D2C8" : isAnchor ? "#fff" : dead ? "#A13B2E" : "#2D3D30",
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10 }}>
          <button
            onClick={() => onPick("", "")}
            style={{ flex: "0 0 auto", background: "none", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 16px", fontSize: 13, fontWeight: 600, color: "#777", cursor: "pointer" }}
          >
            Clear
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, background: SELECTED_BG, color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}


const searchInputStyle = {
  border: "1px solid #D5CFC7", borderRadius: 8, padding: "8px 10px",
  fontSize: 14, color: "#1F4E63", height: 38, boxSizing: "border-box",
  background: "#fff", fontFamily: "inherit",
};
const stepBtn = {
  background: "#F2EDE6", border: "none", width: 34, height: 38,
  fontSize: 18, fontWeight: 700, color: "#2C6E8E", cursor: "pointer",
};

function RoomDot({ type }) {
  const colors = { private: "#2C6E8E", dorm: "#7B5EA7", tent: "#8B6914", special: "#C4622D" };
  return <div style={{ width: 7, height: 7, borderRadius: "50%", background: colors[type] ?? "#999", flexShrink: 0 }} />;
}

// Soft background tint for the placeholder photo, themed by room type
function roomTint(type) {
  const tints = { private: "#D6E8EE", dorm: "#E3DCF0", tent: "#EFE6CC", special: "#F2DECF" };
  return tints[type] ?? "#E2E2E2";
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: accent || "#444", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}


