# PROTOTYPE · device UI (throwaway)

**Question:** what should the evey kitchen device be? This prototype offers three structurally different answers. All three run the same 97 recipes and share one in-memory session, so you can flip between them halfway through cooking a dish.

| Key | Name | Idea | Controls | Sizes shown |
|---|---|---|---|---|
| A | **Sheet** | The recipe as a map. The full process grid stays on screen and fills in as you cook. The step you are on is inverted and repeated large underneath. | 4 soft keys under the glass; the wide one is always "next" | 9.7″, 13.3″ |
| B | **Card** | A cue card. One step per screen in the largest type that fits, readable from across the kitchen. The device decides what comes next. | One knob: turn to move, push for "done" | 7.5″, 4.7″ |
| C | **Board** | A kitchen display system, like a restaurant pass. Up to 4 dishes side by side, one lane each, showing what each dish needs next. | One bump key per lane, plus a menu key | 10.3″, 7.5″ |

Every variant covers the same flow:
- **Home:** what is in the fridge and when to eat it, what you can cook with what you have ("crafting"), and this weekend's plan.
- **Ate something:** take a portion off a stored dish.
- **Cook one dish** or **Start weekend session:** the session's conductor works out the next thing to do across all the dishes, starts long unattended waits first, and runs timers.
- **Stored:** at the end, the cooked dishes go into the fridge with an eat-by date, and you tick anything you used up.

## Run it

Double-click `index.html`. Use **← →** or the yellow bar at the bottom to switch variants.

- **Device keys:** click them, or use the keyboard shortcuts listed in the right-hand panel.
- **Lab controls along the top:**
  - **Size:** the panel sizes each variant offers.
  - **True size:** shows the device at its real physical size. Calibrate it with a bank card.
  - **Clock ×60:** watch a 10-minute simmer pass in 10 seconds.
  - **E-paper lag:** imitates the slow refresh and the full-refresh flash.
- **Right-hand panel:**
  - **Pantry toggles:** stand in for the backoffice. Toggle an ingredient and watch "can cook now" change.
  - **State:** shows what changed after each press.

URL options:
- `?variant=A|B|C`, `size=9.7` etc.
- `?go=k4,k4,t10`: replay inputs at load; `t10` fast-forwards 10 minutes.
- `?panel=1`: renders only the screen, at the panel's real pixel count, thresholded to 1-bit. This is what the device would receive.
- `?measure=1`: runs the grid-fit measurement described below.

**Data.** The recipes come from `data.js`. Recipes are Shota Horii's (Aisle to Tokyo).
- It is generated from japanese-batch-kitchen's private build: `node make-data.js <path to dist/batch-kitchen.html>`.
- Both `data.js` and `renders/` are git-ignored, because they hold real recipes (ADR 0001).
- Without the private corpus, the page has nothing to show.

**Harness** (`harness/`). It drives the page in headless Chrome. It needs Node 22 or later and Chrome; set `CHROME=` to point at a different browser.

| Command | What it does |
|---|---|
| `node harness/cdp.js harness/playthrough.js` | Plays a full weekend session in each variant, then writes `renders/mock-*.png` and any errors. |
| `node harness/cdp.js harness/measure.js` | Prints the grid-fit table. |
| `node harness/cdp.js harness/panels.js` | Writes `renders/panel-*.png`: 1-bit images at each panel's native resolution. |

## What it showed so far (2026-11-20)

**Grid legibility.** This is the largest type size at which the full process grid for each of the 97 recipes fits on screen. "Cooking" means the grid shares the screen with the 34 mm step banner. For reference, 3.5 mm is printed-cookbook size and 2.5 mm is phone body text.

| Panel | Overview: share ≥3.5 mm | Cooking: share ≥3.5 mm | Cooking: share ≥2.5 mm | Worst recipe (cooking) |
|---|---|---|---|---|
| 7.5″ 800×480 | 60% | 35% | 72% (2 don't fit at all) | Menchi katsu, Taco rice, Japanese curry |
| 9.7″ 1200×825 | 95% | 95% | 100% | Japanese curry, 2.7 mm |
| 10.3″ 1872×1404 | 96% | 99% | 100% | Japanese curry, 3.3 mm |
| 13.3″ 1600×1200 | 100% | 100% | 100% | Korokke, 4.7 mm |

What this means for screen size:
- **Sheet (A) needs 9.7″ or larger.** On a 7.5″ panel, the "map" view only works as a separate overview page, not alongside the step.
- **Card (B) is fine at 7.5″, and even at 4.7″.**
- **Board (C) needs 10.3″ for 4 lanes.**

**1-bit at native resolution.** See `renders/panel-*.png`. Text holds up at 800×480 (124 ppi) when it is large, as in the Card. The grid's small text wants 150 ppi or more (9.7″) and is crisp at 227 ppi (10.3″).

**Session logic** (all three variants). A five-dish weekend session takes 44 presses of the primary control, start to finish. Passive timers overlap: the curry simmers while the green beans and kinpira get done. Dishes go into the fridge with eat-by dates, and nanbanzuke is shown as "ready in 1 h".

## Known shortcuts (prototype only)

- **Walk-away vs stay-with-it** is guessed from the step text with a regex. The real recipe schema needs an explicit flag and equipment for each step (see `docs/research/ux-cooking-research.md`, finding 7).
- **The conductor is greedy:** it starts the longest ready wait first, then stays on the dish in hand. It ignores the one-pan and two-pot limits and doesn't aim for dishes to finish together.
- **"Can cook now"** treats every pantry staple as present and ignores quantities.
- **Not built:** persistence, a real device, the backoffice.
