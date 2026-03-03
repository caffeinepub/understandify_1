# Understandify

## Current State
- Child mode with Ask & Learn + Create (image generator) tabs
- Parent mode with History, Alerts, Settings tabs and a news ticker banner
- News ticker shows static child-safety education tips (not real news)
- Image generator is locked behind a subscription paywall (weekly ₹100 / monthly ₹300 / yearly ₹3600)
- App logo shows half astronaut body (object-cover object-top)
- Parent access via PIN (3-dots menu to exit parent mode)
- PIN-protected parent mode entry and exit

## Requested Changes (Diff)

### Add
- "News" tab inside Parent Mode showing latest real-world current events headlines (fetched from a free public news API via RSS/fetch, rotated daily). Do not mention "Google" anywhere in the UI. Headlines should cover general current happenings, world news, science, education.
- The News tab should be a clean card-style feed, not a ticker. It should look like a proper news section.
- A dedicated "Parent Controls" section/panel (rename existing Settings tab or add clarity) that is clearly labelled for PIN management and parental controls — this stays in Parent Mode.

### Modify
- Image generator in child mode: remove the subscription paywall — make image generation FREE for all users (no lock screen, no subscription modal needed, remove SubscriptionModal from this flow).
- News ticker banner at the top of Parent Mode: replace static tips with a scrolling feed of current event headlines (can reuse the same fetched news data). Headlines should rotate and update.
- The subscription plans (weekly/monthly/yearly pricing) should only appear for app-creation features if applicable — but the image generator itself should be FREE.
- Keep the logo exactly as-is (half astronaut, object-top cropping).
- Keep the 3-dots menu for exiting parent mode in the header.
- Parent Mode tabs: rename or restructure so there's clearly a "News" tab, "History" tab, "Alerts" tab, and "Settings/Controls" tab.

### Remove
- Subscription lock on image generation (ImageGeneratorPanel should not show SubscriptionModal or Lock screen for basic image generation).
- SubscriptionModal import/usage from ImageGeneratorPanel (free image gen).

## Implementation Plan
1. Update `ImageGeneratorPanel.tsx` — remove subscription gate, show image generation UI directly to all users (no lock, no SubscriptionModal).
2. Update `NewsTickerBanner.tsx` — fetch headlines from a free public RSS/news source (e.g., BBC RSS, Reuters RSS, or similar) using fetch + XML parsing. Show real current event headlines. Do NOT label source as "Google". Fall back to curated current-events headlines if fetch fails.
3. Update `ParentMode.tsx` — add a fourth "News" tab with a card-feed of current news headlines. Rename tabs clearly: History | Alerts | News | Controls. Move parental settings to "Controls" tab.
4. Create `NewsPanel.tsx` — a new component showing current news as cards (title, brief description if available, category tag). Fetches same data as ticker.
5. Keep all PIN logic, header, logo, and child mode features unchanged.
