# The repo is public under MIT; recipe content stays out

The repository is public on GitHub. Everything in it (`main` and every branch, issue and PR alike) is published under the MIT licence (`LICENSE`).

Recipe content is the exception: each recipe's ingredients, quantities, steps, notes and source links. The starting corpus is another author's work, transcribed for personal use in japanese-batch-kitchen. So the corpus lives in a private store, and evey loads it at runtime. The owner's own data (kitchen equipment, shops, pantry, leftovers, plans) lives there too.

The owner made both decisions on 2026-11-20, before the repo was created.

## Considered options

- **A private repo holding everything, corpus included.** It is the simplest: nothing would need separating. The owner chose to publish the code instead.
- **A public repo with the corpus in it.** That would publish transcriptions of another author's recipes, which japanese-batch-kitchen kept private.

## Consequences

- **No recipe content anywhere public:** not on a branch, an issue, a PR or an image.
  - Tests, examples and PR images use invented fixture recipes.
  - A screenshot of a real recipe stays local.
- **The prototype branch ignores its generated data.** Each checkout regenerates `data.js` and its renders from the private corpus.
- **Decided later:** where the private corpus lives, and how a fresh checkout or the server gets it, in [ADR 0008](0008-the-private-store-is-one-sqlite-file-backed-up-to-a-private-repo.md).
- **Nothing private on any branch, issue or PR.** That covers secrets and tokens, and also personal data.
- **Licences of others' code are respected.**
  - Adapted code cites its source and licence.
  - Code under a noncommercial or unclear licence is never copied.
