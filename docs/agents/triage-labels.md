# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |
| (none)                     | `fog`                | Placed at a later milestone's charting   |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

`fog` belongs to this repo and is not one of the five roles.

- **What it marks.** A ticket the owner has placed at a later milestone's charting and taken off the triage queue. The map's fog line, or the placing decision on the ticket, says where it waits.
- **Charting.** Charting a milestone starts from `gh issue list --label fog --state open`.
- **Joining the live milestone.** A `fog` ticket that joins the live milestone swaps the label for `ready-for-agent`.
