# The private store is one SQLite file, backed up to a private repo

The private store is one SQLite database file on the server container's data volume. It holds everything [ADR 0001](0001-the-repo-is-public-recipe-content-stays-out.md) keeps out of the public repo: the corpus, the ingredient dictionary, the pantry, leftovers, plans and session state. Every night the server writes it out as a text dump and pushes the dump to a private GitHub repo when it has changed. The owner decided this on 2026-11-21 in [The private store: where the corpus and the owner's data live](https://github.com/gariasf/evey/issues/18). This closes the item ADR 0001 left open. Neither the backup repo nor the host is named here (ADR 0001).

The weekly data changes through small, frequent writes: a press on the terminal, a tick on the shopping list ([ADR 0007](https://github.com/gariasf/evey/pull/35)). Those suit rows in a database rather than files, and once the weekly data is in a database, keeping recipes there too leaves one store, one writer and one backup. The corpus is small (japanese-batch-kitchen's 97 recipes and its dictionary come to about 80 KB of source), so one embedded file is plenty and nothing calls for a database server.

## Considered options

- **JSON files on the data volume, no database.** They need no dependency, and they read and diff as they are. But every relation, query and migration would be our code, and a write that spans two files has no transaction.
- **Recipes as files, weekly data in a database.** Two stores means two backup paths, and a backoffice that writes to both.
- **Backups to the owner's PC or a NAS on the home network.** That keeps them at home, but not off-site, and the PC sleeps.
- **Backups to an encrypted bucket (restic to an S3-like service).** It is off-site and unreadable to the provider, but costs money each month and adds an account and a key to lose. [ADR 0004](0004-the-server-runs-at-home-in-a-container.md) counted a third-party disk against hosting the live store. A backup copy on a private GitHub repo is a smaller exposure, and japanese-batch-kitchen is already backed up that way.
- **A binary snapshot as the backup** (`.backup` or `VACUUM INTO`). It is an exact copy, but git cannot diff it, and the repo would grow by the whole file on every commit.
- **Our own JSON export as the backup**, one file per recipe and per table. It would be readable without SQLite, but its export and import code would have to change with every schema change.
- **Keeping japanese-batch-kitchen as the place recipes are authored**, re-imported into evey. That makes two writers, and [ADR 0003](0003-the-backoffice-is-built-not-adopted.md) gives recipe edits to the backoffice.

## Decisions

- **One SQLite file holds the whole private store**, on the data volume ADR 0004 gives the container. The server is its only writer. The backoffice's edits are writes the server makes. The driver is for [Server stack](https://github.com/gariasf/evey/issues/19).
- **There is one live store at a time.** It is on the owner's PC during early development and on the host once the [Milestone ladder: M0 onward](https://github.com/gariasf/evey/issues/24) moves the server there. The move copies the file once. Every other copy (development, tests, a laptop) is disposable: it is never pushed to the backup and never merged back. Stores are never synced.
- **The backup is a text dump** (the SQLite shell's [`.dump`](https://sqlite.org/cli.html#dump), "Converting An Entire Database To A Text File"), committed to a private GitHub repo.
  - The server dumps nightly at a fixed hour, and commits and pushes only when the dump differs from the last one.
  - Git keeps every version.
  - It pushes with a [deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) given write access. A deploy key grants access to a single repository, so the key reaches nothing else. It lives on the host, outside every repo.
  - A restore is the dump loaded into an empty database, then the usual migrations.
- **A failed backup shows in the backoffice, not on the terminal.** The backoffice shows the date of the last successful push and turns it into a warning once it is more than three days old. Nothing is asked of the owner while backups work.
- **A fresh checkout needs no private data.** Tests, CI and a new clone run on the fixture recipes in this repo. Development with real data clones the backup repo and restores the latest dump into a local, disposable database. The database's path comes from the environment and is never hard-coded.
- **Recipes change through one path: import with review.** A new recipe and a corrected one both arrive as a recipe file in the shape [Recipe data model](https://github.com/gariasf/evey/issues/16) defines. A correction replaces the recipe that has the same id, and the file is not kept as a second copy. Nobody edits the store's rows by hand.
- **japanese-batch-kitchen is imported once, then archived read-only.** Its ingredient dictionary's shop names and staples arrive in the same import as the owner's data. The import code lives in this repo, since it holds no recipe content.

## Consequences

- **The milestone that moves the server to the host has a restore drill as an exit criterion**: last night's dump is restored into a fresh container, and the backoffice shows the same recipes, pantry and leftovers. It is one drill, not a recurring chore.
- **Leftovers kept after they end** (ADR 0007) add a few rows a week, which is nothing for the dump.
- **Shopping-list ticks made with no signal** (ADR 0004) reach the store when the phone reconnects. How the phone queues and replays them is for the backoffice.
- **Photos and other binary files are outside this decision.** In SQLite or in git they would bloat the backup. The owner's photos are still in the map's fog, and they get their own decision when they arrive.
- **The ladder places the setup work**: creating the backup repo and its deploy key, the first nightly push, and archiving japanese-batch-kitchen once its import is checked.
