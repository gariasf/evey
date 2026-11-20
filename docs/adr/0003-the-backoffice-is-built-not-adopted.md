# The backoffice is built, not adopted

evey builds its own backoffice and its own recipe model, a step tree with stable step ids. It takes ideas from Grocy, Mealie, Tandoor and KitchenOwl, but none of their code and none of the tools themselves. The owner decided this on 2026-11-20 in [Backoffice: adopt an existing tool, or build](https://github.com/gariasf/evey/issues/13), from [`software-prior-art.md`](../research/software-prior-art.md), whose backoffice rows were source-checked again that day.

The two things evey exists for, the process grid and the conductor, both need step-to-step links. None of the four tools stores them, and none plans several recipes within equipment limits. Whatever the choice, those parts would sit outside an adopted tool.

## Considered options

- **Adopt Mealie or Grocy as the recipe backend, with the step tree stashed in it.** Mealie's `extras` and Grocy's multi-line userfields can each hold a serialised tree through their APIs. The tree would be an opaque string: neither app's UI, search or validation would understand it. evey would still build the step-tree editor, its validation and the planner. All it would gain is storage, plus a second service to run.
- **Adopt one as-is, without the step tree.** That loses the process grid and the conductor, which are the reason evey exists.
- **Run Grocy beside evey as the stock service.** Grocy's model is the only complete one, but an ingredient counts only when booked stock covers the scaled amount, so every purchase and every use must be entered. That is the weekly discipline evey avoids. It stays as a fallback (see Consequences).

## Decisions

- **What the backoffice edits first.** The weekly data: plans, shopping, pantry and leftovers. Small recipe edits come next: additions such as batch rating and keep time, and typo fixes. A full step-tree editor stays the backoffice's job but comes later. Until then, recipes join the corpus through import and review. The ladder sets the timing; [The private store: where the corpus and the owner's data live](https://github.com/gariasf/evey/issues/18) decides whether recipes are files or rows.
- **Ideas, not code.** No code is copied from Mealie or KitchenOwl (AGPL-3.0), or from Tandoor (AGPL-3.0 with the Commons Clause, which [ADR 0001](0001-the-repo-is-public-recipe-content-stays-out.md) forbids copying). Grocy is MIT. Its code may be adapted with a citation if it ever helps, but none is planned.
- **Can cook now takes an allowed-missing count**, copied from Tandoor's `makenow`. Can cook now is the query with 0 missing; one item away is the same query with 1.

## Consequences

- **Patterns passed on, not decided here.** Each is an input to the ticket that owns it:
  - [Pantry and leftovers: what evey knows without asking for discipline](https://github.com/gariasf/evey/issues/17): staples count as in stock (Tandoor's `ignore_shopping`); Grocy's third state, "short, but already on the shopping list"; Grocy's `due_score`, ranking recipes by how much soon-due stock they use; Grocy's produced product, where cooking a recipe books a leftover with a default date.
  - [Terminal–server protocol](https://github.com/gariasf/evey/issues/22): Grocy's `GET /system/db-changed-time`, a cheap "has anything changed" poll.
  - Recipe import, still in the map's fog: Mealie's import in separate LLM passes, with numbered references that are range-checked.
  - The planner and shopping list, later: CookCLI's `pantry plan`, which finds the ingredient that unlocks the most recipes.
- **Grocy remains a fallback for stock.** Revisit it only if the pantry decision chooses counted quantities or barcode scanning. Only stock would live there; its recipes cannot hold the tree.
- **The step-tree editor is the largest piece of the build**, and no tool offers one to borrow. The recipe data model ([Recipe data model](https://github.com/gariasf/evey/issues/16)) has to be editable on a phone in the end, even if early milestones only read it.
