# Sessions

Which skill starts which kind of session, and when.

- **The owner types these slash commands**, because the skills are user-invoked. Type `/` and pick `mattpocock-skills:<name>`.
- **The agent invokes these skills itself:** `tdd`, `diagnosing-bugs`, `research`, `prototype`, `domain-modeling`, `codebase-design` and `code-review`.
- **One ticket per session.** `/clear` between tickets.

| Situation | Start with | Output | Next |
|---|---|---|---|
| Build a ticket (most sessions) | `/implement #<n>`, or "Work the frontier per docs/agents/workflow.md Session start" | Local `/code-review`, then a draft PR, marked ready when CI is green | Agent merges |
| Decide a map ticket | `/wayfinder #<map>`, then name a ticket or take the first frontier one | Resolution comment, ticket closed, map updated, an ADR PR if the decision is hard to reverse | Next ticket, in a new session |
| Research ticket | "Resolve #<n>" (the agent uses `research`) | Cited note under `docs/research/`, resolution on the map | None |
| Question that needs running code or a mock-up | The prototype ticket's session; the agent uses `prototype` | A prototype branch, never merged, and the answer as the resolution comment | Resume grilling |
| New feature or next milestone | `/grill-with-docs <idea>`, then `/to-spec`, then `/to-tickets`, in one window | `GLOSSARY.md` and ADR PR, a spec issue, ticket issues | `/clear`, then build |
| Broken or slow | "diagnose: <symptom>" (the agent runs `diagnosing-bugs`) | A failing reproduction, a regression test at a real seam, a fix PR | Agent merges |
| Outside report or idea | `/triage` | A labelled issue with an agent brief | |
| Unsure | `/ask-matt <situation>` | The flow that fits | |

## Rules of thumb

- Build sessions start from a ticket and nothing else.
- Grilling and spec work (`/grill-with-docs`, `/to-spec`, `/to-tickets`) stay in their own sessions.
- Don't chart a milestone before the one ahead of it nears exit (`workflow.md`, The ladder).
- A session ends by naming the next sessions as the commands that start them (`/implement #<n>`, "Resolve #<n>"). It works these out from the frontier as it stands then, and says which can run side by side.
- Status at any time: "Status: frontier, open PRs, review state."
