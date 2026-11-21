# The server is TypeScript on Node, rendering with headless Chromium

evey's server is TypeScript run directly by Node 24, with Hono for HTTP and server-rendered backoffice pages. It renders the terminal's frames in a long-lived headless Chromium with text anti-aliasing turned off, so FreeType's monochrome hinting draws every glyph and no threshold step is needed. It ships as one container image that CI builds on every merge and the host pulls each night. The owner decided this on 2026-11-21 in [Server stack](https://github.com/gariasf/evey/issues/19), from [`server-1bit-rendering.md`](../research/server-1bit-rendering.md). The load-bearing facts were re-checked against their sources that day.

Layout is the hard part of a frame: the process grid's spanning boxes, wrapped cell text, and whether a recipe fits beside the step. The device-UI prototype already does all of it in HTML and CSS. [ADR 0004](0004-the-server-runs-at-home-in-a-container.md) makes the server a Linux container with at least 2 GB of RAM, and on Linux Chromium reads anti-aliasing from fontconfig, in headless mode too. With a fontconfig file that turns it off, the research frames had no grey pixel, and their glyphs matched Pillow's monochrome hinting by eye. A warm frame took about 85 ms on the owner's PC, against the panel's 435 ms partial refresh, and the browser peaked at about 0.4 GB.

## Considered options

- **TypeScript on Node with skia-canvas.** 3.5 ms a frame and about 100 MB, but the grid's layout and line-wrapping become our code, and its 1-bit text on Linux was never checked.
- **Python with Pillow.** The only route whose monochrome hinting is verified on every OS, with the smallest memory (26–38 MB) and the same pixels on Windows and Linux, since Pillow bundles FreeType. But layout becomes our code, and the server leaves the JavaScript of the prototype and japanese-batch-kitchen.
- **Satori with resvg.** CSS-like layout without a browser, but resvg cannot hint, and at 3 mm stems jump between 1 and 2 px.
- **A single-page app framework for the backoffice** (SvelteKit, React). The weekly data is plain forms. The step-tree editor ([ADR 0003](0003-the-backoffice-is-built-not-adopted.md)) may want a client framework, and it gets one when it is built.
- **Fastify with a template engine, or bare `node:http`.** Hono covers routing and HTML templates in one small dependency.
- **Our own CDP client** over Node's built-in WebSocket, as the prototype's harness has. No dependency, but browser crashes and restarts would be our code.
- **`better-sqlite3`.** Battle-tested, but a native addon that needs a prebuilt binary for each architecture. `node:sqlite` ships with Node.
- **Updating the host by hand, or building on the host from git.** A nightly pull asks nothing of the owner. Watchtower, the usual tool for it, was archived on 2025-12-17.

## Decisions

- **Runtime: Node 24, running `.ts` files directly.** Type stripping is on by default and stable since 24.12, so there is no build step. Code uses only erasable syntax: no `enum`, no namespace with runtime code, no parameter properties, no decorators. `tsc --noEmit` only checks types. Node 24 is in maintenance LTS until 2028-04-30, and moving to Node 26 is a routine bump.
- **HTTP and backoffice: Hono**, on `@hono/node-server`. Backoffice pages are rendered on the server with `hono/jsx`, with light client JavaScript. A service worker keeps the shopping list readable with no signal (ADR 0004).
- **Frames: headless Chromium driven by `puppeteer-core`.**
  - The browser is Debian's `chromium-headless-shell`. `puppeteer-core` never downloads its own.
  - A committed `FONTCONFIG_FILE` sets `antialias` to false.
  - Headless Chromium takes hinting from its own `--font-render-hinting` switch, not from fontconfig, so the renderer passes that switch explicitly.
  - One browser stays up, restarted after a fixed number of frames or after a crash.
  - The renderer is one module: a screen goes in, a packed 1-bit bitmap at the panel's native resolution comes out. A 2D library can replace Chromium behind it without touching the rest.
  - How a frame travels to the terminal is for [Terminal–server protocol](https://github.com/gariasf/evey/issues/22).
- **Font: DejaVu Sans only**, the research fixture's hand-hinted font. Its licence is Bitstream Vera, DejaVu's changes are in the public domain, and its Arev glyphs carry the Arev licence. Fonts and pixel fonts are chosen after [Key press to frame on the real board](https://github.com/gariasf/evey/issues/21) judges text on the panel.
- **Store: `node:sqlite`**, the driver for the SQLite file of [ADR 0008](0008-the-private-store-is-one-sqlite-file-backed-up-to-a-private-repo.md). It is a release candidate in Node 24.15 and later, and synchronous, with prepared statements. Only the store module touches it, so swapping in `better-sqlite3` changes one module. Node 26 renames `DatabaseSync` to `Database`.
- **Dependencies.** Runtime: `hono`, `@hono/node-server`, `puppeteer-core` (Apache-2.0) and `pngjs` (MIT, no dependencies), which decodes Chromium's screenshots and writes the golden images. Development: `typescript` and `@biomejs/biome`. Tests use `node:test`. Adding another dependency is a roadmap decision.
- **One image for development, verify and the host:** `node:24-trixie-slim` with Debian's `chromium-headless-shell`, `sqlite3`, `git` and `openssh-client`.
  - It is multi-arch, amd64 and arm64.
  - The base is pinned by digest, so a Chromium upgrade arrives as a deliberate PR that refreshes the golden images.
  - `sqlite3`, `git` and `openssh-client` serve ADR 0008's nightly `.dump` and push. The deploy key is mounted from the host at runtime and never baked into the image.
- **Delivery.**
  - GitHub Actions builds the image on every merge to `main`, on free hosted runners (`ubuntu-24.04` and `ubuntu-24.04-arm`).
  - It pushes the image to GHCR, tagged `main` and with the commit. The image is public, since it holds no private data.
  - On the host, a systemd timer pulls and restarts the container at 04:00, when no session runs. Rolling back means pinning an earlier commit's tag.
- **The verify command is `npm run verify`.** It runs in the image through Docker, on the owner's PC and in CI on every pull request, so its pixels are the host's. It prints at most 30 lines and runs:
  1. `tsc --noEmit`
  2. Biome
  3. the `node:test` suites
  4. a 1-bit render of every terminal screen from fixture recipes at 800×480, diffed against committed golden PNGs, with diffs written to a gitignored folder
  5. a firmware build, once firmware exists
- **Repo layout.** One npm package at the root (`package.json`, `Dockerfile`, the verify script). `server/` holds the TypeScript: renderer, sessions, conductor, backoffice and the store module. `firmware/` holds the terminal's C++ on Seeed_GFX2. `fixtures/` holds the fixture recipes and the golden PNGs.

## Consequences

- **Frames are only right on Linux.** On Windows, Chromium's anti-aliasing does not come from fontconfig, so every render, local ones included, goes through the image. The owner's PC has Docker Desktop.
- **A golden-image change is a deliberate commit.** The before and after screens a PR must carry (`docs/agents/workflow.md`) come out of verify's render step.
- **`puppeteer-core` is guaranteed only with the browser it bundles.** Pinning the image by digest keeps Debian's Chromium and `puppeteer-core` moving together, in one PR.
- **[Key press to frame on the real board](https://github.com/gariasf/evey/issues/21) can use this renderer** for its legibility check, from a fixture recipe at 800×480.
- **The firmware's toolchain (PlatformIO or arduino-cli) is for [Terminal–server protocol](https://github.com/gariasf/evey/issues/22)**, which chooses the firmware base. Verify calls whichever it picks.
- **The [Milestone ladder: M0 onward](https://github.com/gariasf/evey/issues/24) places the setup.** M0 creates the verify command, the image and CI. The milestone that moves the server to the host adds the GHCR pull and its timer.
- **CLAUDE.md's Stack section no longer says "no dependency is added"**. It points here.
