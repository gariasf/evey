# The terminal is a Card-led step screen on three keys

The terminal reads, decides, cooks and puts away; the phone chooses the plan, shops and edits. During a session it shows the step screen: the current step in large type with its quantities inline, the conductor's next one or two steps, and the timer strip. The process grid is one press away, and sits beside the step only on a panel of 9.7″ or more. Three physical keys and a buzzer are all it needs. The owner decided this on 2026-11-20 in [Terminal concept: Sheet, Card, Board, or a mix](https://github.com/gariasf/evey/issues/12), from the prototype in [What should the terminal be?](https://github.com/gariasf/evey/issues/7) and [`ux-cooking-research.md`](../research/ux-cooking-research.md).

## Considered options

- **Sheet: the full process grid beside the step, always.** It keeps japanese-batch-kitchen's central idea, but the grid only fits beside the step at 3.5 mm type for 35% of the corpus at 7.5″, against 95% at 9.7″. Requiring 9.7″ would rule out the only $69 board with keys, buzzer, battery and case (reTerminal E1001).
- **Card: one step per screen.** It reads from across the kitchen at 7.5″, but cooks look ahead, and one step per page was not preferred (research finding 2); hidden timers increased over-cooking (finding 3).
- **Board: one lane per recipe.** Four lanes need 10.3″, and the lanes hand scheduling back to the cook, which is the conductor's job.

## Decisions

- **Controls.** Move, Grid and **Next**, plus a buzzer. Next marks a step done and confirms; Grid toggles the process grid, and is "back" outside a session; Move cycles a highlight, and a long press undoes the last "done". Touch and a knob are never required.
- **Screens.** Home (leftovers, can cook now and one item away, the plan), session start, step screen, process grid, timer done, put away, and a leftover's detail. Nothing else: no settings and no recipe browsing.
- **Presses.** A session costs its steps plus two presses. Starting a walk-away step starts its timer; the buzzer stops by itself; a single recipe from can cook now is a session too. The terminal holds the session's state, including a short trail of what was last done, so the cook remembers nothing.
- **Optional confirmations.** A session's end creates one leftover per recipe, eat-by date from its keep time, whether or not put away is confirmed. Eating, finishing or freezing a leftover is at most one optional press; skipped, it ages out at its eat-by date.
- **Stale data.** E-paper looks the same stale or fresh, so the terminal shows what stays true: absolute dates ("cooked Sun · eat by Thu"), with "eat today" added only by that day's refresh; no portion counts on home; an "as of" stamp only when a frame is past its expected refresh. Running timers keep counting and the buzzer still sounds when the server is unreachable.

## Consequences

- **The panel floor is 7.5″.** A bigger panel is an upgrade, not a requirement; [Panel size and hardware platform](https://github.com/gariasf/evey/issues/15) chooses.
- **The process grid at 7.5″ is unjudged.** It was judged only from thresholded browser renders; a monochrome-hinted render on a real panel decides whether it is legible there ([`server-1bit-rendering.md`](../research/server-1bit-rendering.md)).
- **Timers must live where losing the server can't stop them.** [Terminal–server protocol](https://github.com/gariasf/evey/issues/22) decides how.
- **What put away and eat one record** is for [Pantry and leftovers: what evey knows without asking for discipline](https://github.com/gariasf/evey/issues/17), within the shape above.
