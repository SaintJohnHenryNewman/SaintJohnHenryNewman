# JHN Computer Shop

`index.html` — a budget-build simulation: match computer parts to a
customer's actual needs without overspending.

## How it plays

1. **Pick a customer** from five scenarios (see below), each with a
   budget and a plain-English description of what they need the
   computer for.
2. **Shop the floor** — pick one item from each category (CPU, RAM,
   Storage, Input, Monitor) into a trolley. A running budget bar shows
   spend against the customer's limit; "Build It!" is disabled until a
   full, in-budget set is selected.
3. **Get a build report** — feedback per category on whether the choice
   suits the job (not just whether it was the most expensive option),
   plus an overall verdict and a budget note. Options to adjust the
   build or try another customer.

## Customers (scenarios)

| Customer | Budget | Need |
|---|---|---|
| The Sharma Family | £450 | Everyday browsing, video calls, homework |
| Jordan the Gamer | £800 | Competitive online gaming, fast response |
| Amara, Video Editor | £1050 | Editing 4K footage and large photo files |
| Lee, College Student | £280 | Essays, research, coursework, tight budget |
| Riverside Bikes (Shop Server) | £480 | File server for a small team, quiet, huge storage |

Each scenario defines minimum tiers/specs it actually needs per
category (e.g. the shop server scenario wants high storage capacity but
only a low-tier monitor and input device) — the point is over-buying
(e.g. a top-tier gaming monitor for a file server) scores worse than a
sensible match, teaching that "biggest number" isn't the same as
"right for the job."

## Parts catalogue

Four tiers each of CPU, RAM, and monitors; HDD and SSD storage options
at a few capacities; basic/ergonomic/gaming keyboard+mouse sets plus a
graphics tablet for the input category.

## Files

- `index.html` — self-contained (inline `<style>`/`<script>`), no
  external dependencies.
- `jhn_logo.jpg` — this lesson's own copy of the school logo.

Links back to `../fetch_decode_execute/teacher_fde.html` as the "KS3
Computing tasks" hub.
