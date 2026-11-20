# The server runs at home, in a container

evey's server runs on an always-on machine the owner already has at home, as one Linux container with a persistent data volume. The phone reaches the backoffice away from home only over Tailscale, and the server is never exposed to the public internet. The owner decided this on 2026-11-20 in [Where the server runs](https://github.com/gariasf/evey/issues/14). The machine is not named here ([ADR 0001](0001-the-repo-is-public-recipe-content-stays-out.md)).

A home server keeps the terminal working when the internet is down, because the terminal and the server share the home network. It has no monthly fee, and the corpus and the owner's data stay off third-party disks. Latency does not separate the options: the panel's partial refresh (435 ms on the reTerminal E1001, [`interactive-epaper-clients-esp32.md`](../research/interactive-epaper-clients-esp32.md)) outweighs a home network or a nearby cloud host.

## Considered options

- **A small cloud host.** Nothing to look after and reachable from anywhere. But the terminal goes dark whenever the home internet drops, it costs money every month, and the private store would sit on someone else's disk.
- **A Raspberry Pi Zero 2 W.** It idles at about 0.7 W ([`hardware-alternative-routes.md`](../research/hardware-alternative-routes.md)), but it has 512 MB of RAM and a Cortex-A53. InkyPi needs zram and earlyoom to run headless Chromium on it and still reports freezes. @napi-rs/canvas's arm64 builds need a Cortex-A57 or newer ([`server-1bit-rendering.md`](../research/server-1bit-rendering.md)). It would constrain [Server stack](https://github.com/gariasf/evey/issues/19) before that ticket is decided.
- **The owner's desktop PC.** It sleeps, and the terminal needs the server whenever it refreshes.
- **A public URL with a login.** It would mean maintaining TLS, authentication and patches for an internet-facing app, for one household.
- **Plain WireGuard.** It needs a forwarded port on the home router. Tailscale needs none. Its coordination server only exchanges keys and policies, and traffic between devices stays end-to-end encrypted (Tailscale, [How Tailscale works](https://tailscale.com/blog/how-tailscale-works)). The free Personal plan covers up to six users ([pricing](https://tailscale.com/pricing)).

## Decisions

- **The host contract is one Linux container**, arm64 or x86-64, with a persistent data volume. The server stack is free to choose anything that builds into such a container. Moving to another machine means copying the volume.
- **The host has at least 2 GB of RAM** and runs the container all the time. It restarts the container by itself after a reboot or a power cut, and takes unattended OS security updates.
- **Away from home, the backoffice is reached over Tailscale only.** Tailscale is set up once on the host and the phone and stays on in the background, so there is nothing to toggle.
- **On the home network, the terminal talks to the server directly**, not over Tailscale.
- **No hardware is bought for the server.** A machine that meets the contract already exists.

## Consequences

- **Backups are the private store's job.** This ADR only requires that the host can push a backup off the machine. What is backed up, how often and where is decided in [The private store: where the corpus and the owner's data live](https://github.com/gariasf/evey/issues/18).
- **The shopping list has to open with no signal.** A shop may have no coverage, so the backoffice shows the shopping list from the phone's last sync.
- **Development starts on the owner's PC.** The terminal's firmware reads the server's address from configuration and never hard-codes it, so [Key press to frame on the real board](https://github.com/gariasf/evey/issues/21) does not wait for the host. The [Milestone ladder: M0 onward](https://github.com/gariasf/evey/issues/24) decides when the server moves to the host.
- **How a new server version reaches the host** is for [Server stack](https://github.com/gariasf/evey/issues/19) and the ladder.
- **When the host is down**, the terminal keeps its last frame, and its timers and buzzer keep running ([ADR 0002](0002-terminal-concept-card-led-step-screen-on-three-keys.md)). What it shows meanwhile is for [Terminal–server protocol](https://github.com/gariasf/evey/issues/22).
