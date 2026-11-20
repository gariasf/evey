# Workflow

How work moves through this repo. Read this before starting, closing, or reordering a ticket or milestone. The method is Praxis's, slimmed for a smaller project with hardware in it.

The owner decides what is worked on. Agents implement, commit, open PRs and merge them without asking (see Review), then take the next frontier ticket.

A PR waits for the owner in two cases:

- **A physical or visual check:** something on the real terminal, a screen to judge, or a check only the owner can run.
- **A roadmap decision:** milestone order or exit criteria, a new or superseded ADR, a new dependency or version bump, or money spent on hardware.

Any other choice the agent makes itself and states, with its reason, in the PR body. A decision that lives only in chat is not made. It lands as an ADR (`docs/adr/`), a comment on a map issue, or a ticket comment.

## The ladder

- **Milestones.** Work is ordered as GitHub milestones (`M0`, `M1`, …). Exactly one is **live**: the lowest-numbered open milestone.
- **Fog.** Only the live milestone has tickets. Later milestones are **fog**: one line each under *Not yet specified* on the ladder's map (label `wayfinder:map`).
  - Fog is charted into tickets when the milestone before it nears exit.
  - A ticket placed at a later milestone's charting carries the `fog` label and stays off the frontier.
- **Exit criteria.** A milestone's exit criteria are commands plus observable results, written on the milestone before its first ticket opens.
  - It closes when every criterion has been run and its output pasted on the milestone.
  - "Looks done" never closes a milestone.
- **Order.** The ladder's order and each milestone's one-line goal live on the Foundations and ladder map, under *Decisions so far*. Every reordering amends it with a decision comment: what moved, why, and what it displaces.
- **Standard exit clause.** Every milestone's exit also includes:
  - The verify command exits 0.
  - Each terminal screen the milestone changed is posted on the milestone, rendered at the panel's native resolution in 1-bit.
  - The research notes behind the next milestone's decisions have their load-bearing claims checked against primary sources.

## Tickets

- **Size.** A ticket is a **tracer bullet**: a thin slice, demoable or verifiable on its own, that fits one fresh session.
  - Write it at about 400 changed lines.
  - One that cannot fit splits along a seam.
- **Acceptance criteria are the ceiling.** Anything a reviewer wants beyond them becomes a note under *Not yet specified*, with the trigger that would revive it.
- **Verification seam.** Every ticket carries one, agreed before coding (`/tdd`).
- **One ticket per session.** Start from the ticket body, its linked ADRs and `GLOSSARY.md`. Chat history is not a source.
- **Start here.** Every ticket has this section: the files a session reads first, and what is already ruled out. The form is in `docs/agents/issue-tracker.md`.
- **Technique and product decisions** are blocked by a `wayfinder:research` ticket titled "State of the art: …". Examples: display hardware, the terminal–server protocol, a data format, adopting an existing tool.
  - It surveys primary sources: manufacturer documentation, datasheets, specs, source repositories and papers.
  - It ends in options, not a decision.
  - It stays compact in `docs/research/`: one comparison table and at most a paragraph per option.
  - Its rows are source-checked once, when its decision is taken (see Review).
- **Prototype tickets** (label `wayfinder:prototype`) are the unit of experiment: a question that needs running code or a physical mock-up.
  - It is answered on a prototype branch that is pushed and never merged, with no PR.
  - Its answer and evidence (screenshots, renders, measurements) go in the ticket's resolution comment.
  - What the answer calls for is built afterwards, under its own ticket.
- **Owner's hands.** Work that needs the physical terminal or the owner's hands is `ready-for-human`, or carries a precise checklist for the owner. Examples: buying parts, flashing a board for the first time, mounting it, judging a screen in the kitchen.

## PRs

- **One ticket per PR** (`Closes #N`). PRs that share a module name their merge order in their tickets.
- **One review, one fix commit.** The review is the agent's own, before the PR opens (see Review). Findings still open after the fix commit become tickets or fog notes.
- **Verify first.** The verify command (created in M0) exits 0 before the PR opens. Its output, 30 lines at most, is the Verification block.
- **Screens.** A PR that changes what the terminal shows carries before and after images of each affected screen, rendered at the panel's native resolution in 1-bit. The images use fixture recipes, never the private corpus (ADR 0001).
- **Description** follows `.github/pull_request_template.md`.
- **Commits.**
  - Commit subject 72 characters at most; the body says why, not what.
  - No commit names an AI co-author or carries a "Generated with Claude" line.
  - The squash merge commits the PR's title, with ` (#N)` appended, over its description.

## Review

CI owns mechanical checks. One semantic review follows, the agent's own, before the PR opens.

1. **Review.** When the build is done and local checks pass, run `/code-review` against the base branch on three axes:
   - **Standards:** this repo's conventions.
   - **Spec:** the ticket's acceptance criteria.
   - **Sources:** every reference the diff relies on or adds, such as a datasheet, spec, paper or other codebase. The reviewer opens each source and never vouches from memory, and checks that:
     - the source exists
     - it says what the diff claims
     - it is cited to the right place
     - the code implements it correctly
2. **Disposition each finding.**
   - *Fix:* correctness, safety, or a quick win inside the changed lines. All fixes go in one commit.
   - *Decline:* wrong, or beyond the criteria. Give a one-line reason.
   - *Defer:* true but outside the ticket. Leave a note under *Not yet specified* with its revival trigger.
3. **Open as a draft, mark ready when green.** Put the review's counts (`N found, N fixed, N declined, N deferred`) under Verification.
4. **Merge** when CI is green, the counts are in the PR, and no Decide item is unanswered: `gh pr merge <n> --squash --subject "<title> (#<n>)" --body-file <file>`.
   - A PR that needs the owner's physical or visual judgement waits for the owner.
   - So does a PR that carries a roadmap decision.

## Session start

1. **Orient.** Read this file and `CLAUDE.md`. Once the ticket is taken, read its body and comments, and the map its Parent names (`gh issue view <n> --comments`).
2. **Take the frontier.** List it with `gh issue list --milestone <live> --label ready-for-agent --state open --search no:assignee --json number,title --jq 'sort_by(.number)'`. Take the lowest number with no open blocker: `gh api repos/gariasf/evey/issues/<n> --jq .issue_dependencies_summary.blocked_by` returns 0.
3. **Claim it** (assign it to yourself) before any work.
4. **Run the verify command.** A red start is reported on the ticket before work begins.

## Context hygiene

- `CLAUDE.md` holds pointers; reference material sits behind them.
- Validation commands print 30 lines at most on success, and the failing detail on failure.
- Research results are cached in `docs/research/` and linked from tickets, so each is read once.
