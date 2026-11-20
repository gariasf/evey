# Charting brief: Foundations and ladder

> **Transient.** Input for the first `/mattpocock-skills:wayfinder` chart session. Everything here is a proposal for the owner to confirm, cut or redraw while grilling. Delete this file in the PR that lands the map's first ADRs.

## Proposed destination

The destination has two parts:

- **A ratified milestone ladder:** M0 onward, with exit criteria written as commands plus observable results.
- **ADRs for the decisions that are expensive to reverse:**
  - the terminal's concept and form factor
  - the hardware platform
  - the device–server protocol
  - the recipe and pantry data model
  - whether the backoffice adopts an existing tool

With both in place, milestones can be specified and built without reopening foundations.

## Proposed notes (map body)

- **Domain.**
  - `GLOSSARY.md` doesn't exist yet. `domain-modeling` creates it in the chart session.
  - japanese-batch-kitchen is the starting corpus (97 recipes as step trees) and the planner baseline. It is a private, local repo, and its content never enters this one (ADR 0001).
- **Skills every session consults.**
  - `grilling` and `domain-modeling`.
  - `research` for fact-finding tickets.
  - `prototype` for "how should it look or behave".
- **Standing preferences.**
  - The domain rules in `CLAUDE.md`.
  - Remove barriers first: deciding, shopping, cooking, eating through the week.
  - Facts are the agent's job; decisions are the owner's.
  - Technique and product decisions start from a "State of the art: …" research ticket that blocks them.

## Evidence already gathered

These resolve tickets at charting: create each ticket, post the note as its resolution, and close it.

| Would-be ticket | Type | Answer |
|---|---|---|
| Cooking UX: what research says about following recipes while cooking | research | `docs/research/ux-cooking-research.md` |
| State of the art: ESP32-class boards with integrated e-paper | research | `docs/research/hardware-mcu-epaper-boards.md` |
| State of the art: other routes (Pi with IT8951 panels, e-readers, Android e-ink, reflective LCD) | research | `docs/research/hardware-alternative-routes.md` |
| Prior art: recipe managers, recipe formats, e-paper thin-client protocols | research | `docs/research/software-prior-art.md` |
| What should the terminal be? | prototype | Branch `prototype/device-ui`: three concepts (Sheet, Card, Board) over the 97 recipes, 1-bit renders at native resolution, and a grid-fit measurement. Its README holds the findings. |

Headline facts so far:

- **Grid legibility.** This is how many recipes' full process grid fits beside the step banner with type at 3.5 mm or larger (printed-cookbook size):
  - 7.5″: 35%
  - 9.7″: 95%
  - 10.3″: 99%
  - 13.3″: 100%
- **What the UX research says to design around.**
  - Put quantities inside the step.
  - Never show a step alone.
  - Keep all timers on one screen.
  - One main action per step.
  - "Next" is the dominant action.
  - Scheduling across dishes turns on which steps need attention and which you can walk away from.
- **ESP32 boards.** Prices checked 2026-11-20.
  - **Seeed reTerminal E1001** (7.5″, $69): the only unit with buttons, buzzer, RTC, battery and case. The panel maker rates partial refresh at 0.3 s.
  - **Soldered Inkplate 10** (9.7″, €189.95): 0.62 s fast refresh in 1-bit. Keys and a buzzer have to be added.
  - **TRMNL X** (10.3″, €211.95, preorder): ≤200 ms partial refresh and a magnet mount. It has a touch bar instead of buttons, and no buzzer.
  - **reTerminal E1003** (10.3″, €192.39, in stock): Seeed publishes only a 3 s full refresh.
  - **Wake time.** Waking from deep sleep, fetching and redrawing takes about 10 s, so cooking needs a stay-awake mode.
- **Other routes.** The ESP32 board stays the default.
  - **Boox Go 7 with a kiosk browser** gives a working web UI fastest, but whether its buttons reach a web page is untested. Volume keys never reach web content.
  - **A Kobo e-reader** gives a sealed body with buttons, but needs a custom client.
  - **A Pi with an IT8951 panel** draws too much power for battery use.
  - **Colour e-paper** (12–28 s per refresh) is out.
- **Software.**
  - **Build the backoffice.** None of Grocy, Mealie, Tandoor or KitchenOwl models step-to-step dependencies or an equipment-limited planner. Their pantry patterns are worth copying.
  - **Use our own JSON with stable step ids.** Cooklang's spec cannot reference a step's output.
  - **TRMNL's GPL-3.0 firmware already builds for the reTerminal E1001 and E1002.** It has no channel that says which button was pressed.

## Tickets specifiable now (proposed)

**Grilling**

1. **Terminal concept: Sheet, Card, Board, or a mix.** Evidence: the prototype and the UX research. Blocked by nothing.
2. **Panel size and hardware platform.** Blocked by 1 and by both hardware notes.
3. **Backoffice: adopt an existing tool, or build.** Blocked by the prior-art note.
4. **Recipe data model.** The step tree, plus per-step attention (walk-away or stay-with-it), equipment, done-cues ("until translucent") and sub-recipes. Blocked by 3.
5. **Keeping the pantry true with the least effort.** Options include:
   - ticking off the shopping list
   - an end-of-session "used the last of…"
   - assuming staples are in stock until flagged
   - auto-expiring fresh food
   - reading receipts
6. **Device–server protocol.** Server-rendered 1-bit frames, key events, timers, wake and buzzer. Blocked by 2.
7. **Where the server runs.** A home machine, a NAS, a Raspberry Pi, or a small cloud host.
8. **What happens to japanese-batch-kitchen, and where the private corpus lives.** JBK could become the private corpus repo, or its data could move into a new private store. Either way, the server and a fresh checkout need a way to get the corpus. The owner deferred this to charting.

**Already decided** (first line of *Decisions so far*): the repo is public under MIT, and recipe content and the owner's data stay out of it (ADR 0001, 2026-11-20).

**Prototype**

9. **The session conductor under equipment limits** (one pan, two pots, an air fryer). A logic prototype over the corpus that aims for dishes to finish together. Blocked by 4.

**Task**

10. **Buy the development hardware.** HITL, because it spends the owner's money. Blocked by 2.

## Fog (Not yet specified)

- Recipe import from a URL, pasted text or a photo, likely LLM-assisted, reviewed before it joins the corpus.
- The enclosure:
  - fridge-door mount and magnets
  - protection from splashes and grease
  - battery-life targets
  - a stand for the counter
- OTA updates, and what the terminal does when the server is unreachable.
- Sources beyond Aisle to Tokyo, and the owner's own recipes and photos.
- More than one cook in the household; shared lists.

## Proposed out of scope (confirm)

- Selling devices, or running evey as a service for others.
- A native phone app. The phone opens the backoffice, which is a web app.
- Voice control.

## Provisional ladder

Each milestone becomes firm at its boundary.

- **M0 Spine.**
  - The corpus is in the chosen data model.
  - The server renders a terminal screen to a 1-bit image at the panel's resolution.
  - The device shows it and sends key presses back.
  - One recipe is cooked end to end on the real device.
- **M1 Cook.**
  - Single-dish cook mode with timers, buzzer and wake.
  - Undo.
  - Finished dishes go into the fridge with eat-by dates.
- **M2 Pantry.**
  - Pantry and shopping list in the backoffice, grouped by shop with Catalan names.
  - "Can cook now" and "one item away" on the terminal.
  - Ingredients used up at the end of a session come off the pantry.
- **M3 Session.** The weekend planner, the conductor under equipment limits, and the multi-dish view.
- **M4 Import.** Recipe import, with review before a recipe joins the corpus.
- **M5 Fridge door.** The enclosure and the battery-life targets.
