<!--
For AI assistants: This file describes durable conventions, not
phase-specific work. If you observe drift between this file and the
code, surface it. If you make changes that warrant a CLAUDE.md update,
update it in the same change. Don't let this file go stale.
-->

# evey: AI Guidelines

evey has two parts:

- **The terminal**: a dedicated kitchen screen that lives on the fridge door, not a laptop or a phone. It shows recipes, runs cooking sessions step by step with timers, and knows what is in the pantry and the fridge ("can cook now").
- **The backoffice**: where recipes, pantry, leftovers and weekend plans are edited.

evey grows out of japanese-batch-kitchen: Shota Horii's *Aisle to Tokyo* recipes laid out as process grids, with a weekend batch-cooking planner.

The owner coordinates what is worked on. Agents implement, commit, open PRs and merge them once reviewed, without asking. They wait only for physical or visual checks and for roadmap decisions (`docs/agents/workflow.md`).

## Project posture

- **Remove barriers to cooking.** A feature earns its place by making it easier to decide, shop, cook, or eat through the week with wet hands and a busy head. The evidence behind the terminal's design is in `docs/research/ux-cooking-research.md`.
- **Ask for no discipline.** The owner has to want to use evey. Every input it asks for costs something every week, so prefer what it can infer from actions already taken, defaults that age out safely, and one-press confirmations. Skipping an input never breaks anything.
- **The terminal is real hardware.** A change to what the terminal shows isn't done until it has been checked at the panel's native resolution, in 1-bit.
- **Three keys, nothing to type.** The terminal runs on Move, Grid and Next plus a buzzer, from a 7.5″ panel up; choosing, shopping and editing happen on the phone (ADR 0002).
- **No throwaway code.** The one exception is a prototype ticket's branch, which is never merged (`docs/agents/workflow.md`, Tickets).
- **Goals are explicit.** Work traces to a ticket in the live milestone.

## Documents

- `docs/agents/workflow.md`: how work moves (ladder, tickets, PRs, session start). Read before starting, closing or reordering work.
- `docs/agents/sessions.md`: which skill starts which kind of session.
- `GLOSSARY.md`: the vocabulary of code, tickets and reviews. `/domain-modeling` adds to it as terms are resolved.
- `docs/adr/`: decisions that are hard to reverse. A change that contradicts one says so.
- `docs/research/`: cited research notes, linked from tickets so each is read once.

If any of these conflicts with the current code, **the code is the source of truth**. Flag the drift to the owner explicitly; do not silently follow stale guidance.

## Agent skills

### Issue tracker

GitHub Issues on `gariasf/evey`, via the `gh` CLI; wayfinder maps use sub-issues and native dependencies. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`); each label string equals its role name. `fog` marks a ticket placed at a later milestone's charting, off the triage queue and the frontier. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Stack

The server is TypeScript run directly by Node 24 (erasable syntax only), with Hono and server-rendered pages for the backoffice. Frames come from a long-lived headless Chromium with fontconfig anti-aliasing off, so they are only right in the Linux image. The image serves development, `npm run verify` and the host. The dependencies are the ones ADR 0009 lists; adding one is a roadmap decision (ADR 0009).

Layout, created in M0: `server/` (TypeScript), `firmware/` (the terminal's C++), `fixtures/` (fixture recipes and golden PNGs), with `package.json` and `Dockerfile` at the root.

The terminal is a Seeed reTerminal E1001 running our own MIT firmware on Seeed_GFX2; the 10.3″ E1003 is the upgrade path (ADR 0005).

The backoffice is built, not adopted; other recipe tools lend ideas, never AGPL code (ADR 0003).

A recipe is one document: a step tree with stable ids, its source part and its labelled additions kept apart (ADR 0006).

The server runs at home as one Linux container; the phone reaches it away from home over Tailscale, never the public internet (ADR 0004).

The private store is one SQLite file on the server's data volume, the server its only writer, backed up nightly as a text dump to a private repo; recipes change only through import with review (ADR 0008).

## Public code, private data

The repo is public under MIT. Recipe content and the owner's data stay out of it (ADR 0001).

- **Never commit recipe content.** That means ingredients, quantities, steps and notes, from any source.
  - It lives in the private store and is loaded at runtime.
  - Tests, examples and PR images use invented fixture recipes.
- **Never commit the owner's data.** That covers kitchen equipment, shops, pantry, leftovers and plans. The conductor and the shopping list read these as data from the private store.
- **Nothing private on any branch, issue or PR.** That covers secrets and tokens, and also personal details.

## Domain rules (carried over from japanese-batch-kitchen)

- **Recipes.** Quantities and methods are the source author's: transcribe, don't improve. This project's additions are labelled as such: batch ratings, keep times, air-fryer notes and session ordering on recipes; shop routing and local shelf names on ingredients.
- **Diet rules are data.** The owner's diet excludes shellfish, and surimi counts as shellfish. A recipe that breaks a diet rule is dropped or adapted, and the adaptation is labelled.
- **Credit and link, don't copy.** Every recipe links to its source. No copied video stills, thumbnails or audio.
- **Units and language.** Metric units. English UI with local shelf names.

## How agents work here

- **Implement tickets end to end:** code, tests, verification, PR, merge.
  - Make routine calls yourself and state them in the PR.
  - Bring the owner only roadmap decisions and physical or visual checks, each with a recommendation. Roadmap decisions are milestones, ADRs, dependencies, and money spent on hardware.
- **Work the live milestone's frontier.** Work that is not a ticket becomes a proposed ticket first.
- **Review before the PR opens.** `/implement` closes with a local `/code-review`; run it and fix what it finds.
- **Do what the ticket says.** A bug fix is not a refactor, and a feature is not a cleanup. The acceptance criteria are the ceiling.
- **Leave code you didn't change alone.** Don't add comments, docstrings or type annotations to it.
- **Prefer deep modules behind small interfaces**, tested at those seams (skills: `codebase-design`, `tdd`).

## Maintenance

This file is durable guidance. Keep it short: the more rules, the faster they drift.

**Update this file in the same PR when:**

- the folder layout changes
- a new cross-cutting convention is adopted
- an ADR is added or superseded
- a repeated correction emerges (the same mistake twice means it's a rule)

**Don't update it for** ticket-specific work, one-off fixes or style nits.
