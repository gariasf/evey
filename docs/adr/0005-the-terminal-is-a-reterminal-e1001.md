# The terminal is a Seeed reTerminal E1001

The terminal is an ESP32 e-paper board: Seeed's reTerminal E1001, a 7.5″ 800×480 mono panel with three keys, a buzzer, a real-time clock, a 2000 mAh battery and a metal case in one unit. Its firmware is our own, under MIT, on Seeed_GFX2. The 10.3″ reTerminal E1003 is the upgrade path, taken only if the real panel fails one of two checks. The owner decided this on 2026-11-21 in [Panel size and hardware platform](https://github.com/gariasf/evey/issues/15), from [`hardware-mcu-epaper-boards.md`](../research/hardware-mcu-epaper-boards.md), [`hardware-alternative-routes.md`](../research/hardware-alternative-routes.md), [`epaper-boards-second-sweep.md`](../research/epaper-boards-second-sweep.md) and [`interactive-epaper-clients-esp32.md`](../research/interactive-epaper-clients-esp32.md). The load-bearing facts were re-checked against their sources on 2026-11-21 (the note's *Re-check* section).

[ADR 0002](0002-terminal-concept-card-led-step-screen-on-three-keys.md) asks for a 7.5″ panel or larger, three physical keys and a buzzer, and timers that keep running when the server is unreachable. The E1001 is the only board that has all of these built in. Its panel, Good Display's GDEY075T7, is rated at 0.3 s partial refresh by its maker; GxEPD2 uses 450 ms.

## Considered options

- **reTerminal E1003, 10.3″, from the start.** 227 ppi puts the process grid beside the step, and it has the same keys and buzzer. But it costs about twice as much (€192.39 at Antratek), and Seeed still publishes no partial refresh time, so its speed is unproven. ADR 0002 makes a bigger panel an upgrade, not a requirement.
- **TRMNL X, 10.3″.** The fastest published refresh (spec sheet: "200ms - 1.3s") and an embedded magnet. But it has a touch bar instead of keys and no buzzer, which breaks ADR 0002, its firmware is GPL-3.0, and as of 2026-11-19 both warehouses were waiting on new PCBs with no restock date.
- **Soldered Inkplate 10, 9.7″.** Open hardware with an RTC, but keys and a buzzer must be added, its 0.62 s partial figure appears only in 2021 launch coverage, and the cased version is listed as EOL by a reseller.
- **Other routes.** A Boox Go 7 with a kiosk browser is fastest to a web page, but its page-turn buttons may never reach the page. A Kobo needs a custom client and may be locked by firmware 5.x. A Raspberry Pi with a large panel cannot run on battery. Colour e-paper takes 12 s or more per refresh, and reflective LCD tablets need charging every one to three days.

## Decisions

- **Board: one reTerminal E1001.** ESP32-S3 with 8 MB of PSRAM; keys on GPIO 3, 4 and 5 (active-low, GPIO 3 wakes from deep sleep); buzzer on GPIO 45; PCF8563 RTC with a CR1220 backup cell that Seeed does not ship; about 14 µA in deep sleep.
- **Firmware: our own, MIT, on Seeed_GFX2** (MIT; drives the E1001 to E1004 with partial and fast refresh). Not a TRMNL fork, which would make the firmware GPL-3.0, and not ESPHome, whose runtime is GPL-3.0 and is built for dashboards rather than sessions. TRMNL's pull contract is borrowed as an idea, not as code. Seeed_GFX (without the 2) carries mixed MIT and BSD notices and Seeed_GxEPD2 is GPL-3.0; neither is used.
- **Power: battery first, charged over USB-C.** A session keeps Wi-Fi associated and stays awake, since a wake from deep sleep takes about 10 s; between sessions the terminal sleeps and refreshes on a timer. The target is a week per charge at about four sessions a week. It is measured, not a gate: if the board misses it, the fallback is a permanent cable or a larger battery, not another board.
- **Mounting: on the fridge door, which holds magnets.** Seeed sells no magnetic or wall mount for the E1001, so the case gets stick-on magnets or a printed bracket on its embedded nuts. Nothing on the fridge is modified.
- **Purchase.** One E1001 and one CR1220 cell. The preferred shop is BerryBase (Germany, €99.90 including VAT, 91 in stock on 2026-11-21) if shipping to Spain costs €10 or less; otherwise Seeed direct ($69, shipped from China with Spanish VAT and handling paid on delivery). No second unit and no E1003 for now.

## Consequences

- **[Key press to frame on the real board](https://github.com/gariasf/evey/issues/21) runs two checks that decide the upgrade.** (1) A fixture recipe's process grid, rendered with monochrome hinting at 800×480 and shown on the panel, is legible to the owner at counter distance, about 1 m. (2) A Next press reaches a new step screen in about 0.6 s or less over a partial refresh. If either fails, a ticket for the E1003 opens, and buying it is a roadmap decision. The E1003 uses the same key and buzzer pins; porting the firmware means changing the battery-enable pin (IO40 on the E1003, GPIO 21 on the E1001) and the panel driver.
- **#21 also measures the current drawn while a session stays awake**, which no one publishes, and checks it against the week-per-charge target.
- **[Buy the development hardware](https://github.com/gariasf/evey/issues/20) buys what is listed above** and confirms BerryBase's shipping to Spain at checkout. The purchase is the owner's.
- **[Terminal–server protocol](https://github.com/gariasf/evey/issues/22) designs for this board:** 800×480 1-bit frames, partial refresh, and timers and the buzzer on the terminal.
- **The enclosure** (splash protection, the magnet mount, a counter stand) stays under *Not yet specified* on the Foundations and ladder map.
