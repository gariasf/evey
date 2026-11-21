# PROTOTYPE: the conductor within equipment limits

Throwaway. Lives on branch `prototype/conductor`, never merged. Answers [The conductor within equipment limits](https://github.com/gariasf/evey/issues/23); the answer is in that ticket's resolution comment.

- `conductor.js`: the pure module (no DOM). Prepares a session from ADR 0006-shaped recipes, runs it inside a kitchen's equipment counts, and reports metrics.
- `fixtures.js`: invented recipes and an invented kitchen (ADR 0001).
- `index.html`: double-click to drive a session with Next, Move and waits; six guided walkthroughs. `?fixtures` hides the local corpus; `?s=<tab>&n=<presses>` jumps into a walkthrough (used for the evidence screenshots).
- `convert.js`: turns the private japanese-batch-kitchen corpus into `corpus.local.js` (git-ignored), inferring equipment and attention from step text.
- `batch.js`: runs 300 batch and 200 meal sessions drawn from the corpus over four kitchens and eleven policies; prints aggregates only (`evidence/batch-output.txt`).
- `evidence/finish-together.md`: a follow-up on dishes eaten now (a floor that one cook sets, and four hold rules measured against it) and on the cost of frying in rounds at ×3.

```sh
node prototype/conductor/convert.js "<path to japanese-batch-kitchen>"
node prototype/conductor/batch.js
```
