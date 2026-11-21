# The pantry is on hand or not, and leftovers age out

evey's pantry records whether each ingredient is on hand, never how much, and learns it from what the owner already does: ticking the shopping list and cooking a session. A session's end makes the leftovers, and each one leaves at its eat-by date unless a press removes it sooner. Nothing has to be logged for the terminal to stay useful. The owner decided this on 2026-11-21 in [Pantry and leftovers: what evey knows without asking for discipline](https://github.com/gariasf/evey/issues/17), from [`pantry-leftover-tracking.md`](../research/pantry-leftover-tracking.md), whose load-bearing rows were source-checked that day.

People stop tracking food mainly because every entry costs effort, and a missed entry makes running totals wrong, which hastens the stop. So every input here is optional, and every value an unpressed input would leave wrong expires on its own: a fresh ingredient after its shelf life, a leftover at its eat-by date, a freezer leftover after months.

## Considered options

- **Counted quantities, booked for every purchase and every use** (Grocy's model). Only this model knows how much is left, but it costs input every week, a skipped booking leaves the counts wrong, and getting back on track takes a full recount. In the household studies, entering and removing items is what lost participants.
- **Portions eaten down, one press each.** Of the leftover options, this is the only one whose skipped input shows something false: "6 portions" all week. [ADR 0002](0002-terminal-concept-card-led-step-screen-on-three-keys.md) already keeps counts off the home screen.
- **Fresh food assumed in stock until flagged out, as staples are.** No input is needed, but can cook now would offer dishes whose fresh ingredients were eaten days ago.
- **Receipts, barcodes, a fridge camera, timer tags on containers.**
  - Receipts cost a photo per shop, plus fixing the lines evey cannot match.
  - Barcodes name a product and record nothing about its use.
  - The camera and the tags cost hardware money, and a fridge camera that needed no input was often forgotten.

## Decisions

### The pantry

- **On hand or not.** No quantities anywhere. Can cook now compares presence, with [ADR 0003](0003-the-backoffice-is-built-not-adopted.md)'s allowed-missing count unchanged.
- **Two kinds of ingredient.**
  - A **staple** is in stock until it is flagged out.
  - A **fresh** ingredient is in stock only once something puts it in, and leaves after its shelf life.

  A new ingredient starts as fresh: wrongly fresh hides a dish, while wrongly staple offers one that cannot be cooked. The staple flag and the shelf life are owner data on the ingredient, in the private store, beside the ingredient identity that [Recipe data model](https://github.com/gariasf/evey/issues/16) defines.
- **What puts food in.** Ticking a fresh ingredient on the shopping list puts it in, dated that day; ticking a staple brings it back. An optional "have it" toggle on the phone covers food bought off the list. evey never assumes the list was bought.
- **What takes food out.**
  - When a session ends, every fresh ingredient its recipes used leaves the pantry; staples stay.
  - The put-away screen lists the staples the session used, none ticked, and ticking one flags it out. The phone can flag out any staple at any time.
  - A flagged-out staple goes onto the shopping list, and can cook now counts it as missing, so its dishes show as one item away. There is no third state for "short, but already on the list".
- **Shelf life.** One default of 5 days, overridden per ingredient in the backoffice. Ingredients have no category. FoodKeeper (CC0) is a reference for setting overrides, not a data dependency.

### Leftovers

- **Made by a session's end.** A session makes one leftover per recipe that no other recipe in the session consumes, so a sub-recipe makes none. The eat-by date is the day cooked plus the recipe's keep time in whole days. A recipe with no keep time gets 3 days, inside FSIS's 3 to 4 days; the UK FSA says 48 hours.
- **Presses.** Each is one optional press, as [ADR 0002](0002-terminal-concept-card-led-step-screen-on-three-keys.md) requires.
  - A fridge leftover offers **finished** and **froze it**.
  - A freezer leftover offers **thawed** and **finished**.
  - There is no "eat one" and no portion count anywhere: an "eat one" press would record nothing the terminal shows.
- **Froze it adds, it does not move.** "Froze it" adds a freezer leftover dated that day and leaves the fridge leftover until its eat-by date or "finished", because a batch is often only partly frozen. It is offered on put-away and on the leftover's detail screen.
- **Freezer leftovers.** A freezer leftover ages out 3 months after it was frozen: FSIS's quality figure, since frozen food stays safe indefinitely. "Thawed" turns it back into a fridge leftover with an eat-by date of the thaw day plus 2 days. That 2-day figure is the owner's choice, not a sourced one.
- **Added by hand.** The backoffice can add a leftover from a recipe or as free text, for cooking done without a session or extra sauce kept back. It never prompts for one.
- **History.** A leftover that ends is kept with its reason: finished, aged out or thawed. The terminal never shows ended leftovers.
- **Defaults.** The 3-day fallback, the 3-month freezer age and the 2-day thaw are owner-side defaults, changeable in the backoffice. So is the 5-day shelf life.

## Consequences

- **The test case.** Six portions of a curry with a 4-day keep time are cooked on Sunday, and nothing is pressed all week. On Thursday, home shows "Curry · cooked Sun · eat by Thu · eat today", plus "Curry · frozen Sun" if any was frozen.
  - Can cook now counts every staple not flagged out, and the fresh food ticked at the weekend that the session did not use and whose shelf life has not run out.
  - Without a keep time, the curry would have left on Thursday as aged out.
- **Errors are bounded.**
  - A leftover finished early shows until its eat-by date.
  - A staple that ran out midweek counts until it is flagged out.
  - A surviving half cabbage is hidden until it is toggled back.

  The leftover's error ends on its own at its eat-by date, and the cabbage's errs toward hiding a dish. Only the staple's offers something that is not there, until it is flagged out.
- **ADR 0002's "eat one" is not offered.** That ADR left what it records to this decision. Every other press stays within its "at most one optional press".
- **Grocy stays unused.** [ADR 0003](0003-the-backoffice-is-built-not-adopted.md) kept it as a fallback stock service in case counted quantities or barcode scanning were chosen. Neither was.
- **What the recipe model must carry.** A keep time in whole days. Servings are not needed for the pantry or for leftovers.
- **Presses outside a session wake the terminal.** That takes about 10 seconds, so the terminal records a press locally and syncs it, with no round trip before feedback. The mechanism is for [Terminal–server protocol](https://github.com/gariasf/evey/issues/22).
- **Not decided here.**
  - Grocy's `due_score`, which ranks recipes by the stock about to leave: an input to ordering can cook now, later.
  - Receipts, which come back if food bought off the list turns out to be the main gap in can cook now.
