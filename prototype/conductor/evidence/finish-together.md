# Follow-up: finishing together, and rounds at ×3

A second session on [The conductor within equipment limits](https://github.com/gariasf/evey/issues/23), 2026-11-21. It extends `conductor.js` and `batch.js`. The default policy's behaviour is unchanged: the "Dinner, all hot" walkthrough gives the same numbers as `dinner-all-hot.png`. Every figure below is an aggregate over the corpus or comes from invented fixtures (ADR 0001). The full table is in `batch-output.txt`.

## A floor for "finish together"

A meal can't do better than one cook allows. Each hot dish ends with a block of hands-on work: the final fry, the glaze, the plating. One cook does those blocks one after another, so the dish served first waits at least for every other dish's block. The floor is the sum of the blocks minus the largest. Over 200 eaten-now meals drawn from the corpus, the floor is **6 min median, 13 min p90**. `metrics().coldFloor` computes it, and the new "over floor" column reports each conductor's wait above it.

The kitchen's equipment barely matters here. With unlimited pans, pots and burners the waits are the same within a minute. The cook's hands are the bottleneck, not the hob.

## What each hold rule achieves (meals, 4 burners, 1 pan, noisy hands-on durations)

| Hold rule | Hot dish waits med/p90 | Over the floor med/p90 | Session over its lower bound med/p90 |
|---|---|---|---|
| none | 29.7 / 61.6 | 22.1 / 52.3 | 1.8 / 13.1 |
| forecast end (current default) | 21.7 / 45.6 | 15.1 / 33.6 | 1.6 / 13.4 |
| latest start | 18.2 / 44.0 | 11.6 / 31.8 | 12.5 / 30.9 |
| backward plan from serving | 23.1 / 41.1 | 16.0 / 32.6 | 4.0 / 19.9 |
| backward plan, replanned every press | 26.3 / 49.8 | 17.4 / 40.0 | 3.9 / 25.1 |
| … and the cook's pace learned from finished steps | 25.3 / 53.6 | 17.3 / 43.4 | 9.4 / 35.8 |
| **prep then fire** | **18.1 / 38.8** | **11.1 / 28.4** | **2.8 / 18.4** |

With exact estimates (no noise) the order is clearer: forecast end leaves 13 min median over the floor, the backward plan 8 and prep then fire 4–5, all at no cost to the session's length. The noise is what erodes the clever rules. Each is a plan built from estimated hands-on minutes, and a cook who runs slower or faster than the estimate breaks it. Neither replanning on every press nor learning the cook's pace recovered this. That matches Nakabe (2021), where cooks with the "optimal" plan were slower and the soup went cold.

**Prep then fire** works the way a line cook does. Each dish's hot finish (the heated step at serving and its vessel chain) waits until the prep left is shorter than the finish itself. Long finishes, such as a 40-minute simmer, start early; short ones, such as a 5-minute fry, start last, staggered so they end together. It holds up best because it commits the hot finish only after the uncertain prep is done. A stricter version that waits for all the prep gets the wait down to 14.1/31.3 (7.3/21.6 over the floor), but sessions run 7/33 min longer.

## Rounds at ×3

ADR 0006 says timers never scale. In 31 of the 39 recipes with a hands-on pan or fryer timer, ×3 puts more food in than one round holds (assuming a 500 g pan and a 300 g fryer). When a fry step repeats once per round, ×3 batch sessions run **12 min longer at the median and 52 min at p90**, and 224 of 300 sessions are affected. A conductor that doesn't know about rounds under-plans most ×3 sessions. The fixture cutlets show it: 0:52 with rounds against 0:42 without.

## Tried and dropped

- Giving priority to the whole subtree that unblocks a held chain, not only its direct inputs: no change.
- Shortest held step first when two hot vessels need the cook at once: no change. The case this targeted falls inside the timer's range.
- Starting preheats earlier: they already overlap prep, because the prep-first rule stops at a chain's first walk-away step.
