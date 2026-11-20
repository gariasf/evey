# Interactive e-paper clients on ESP32

Checked 2026-11-20. Facts come from Espressif's datasheets, the ESP-IDF Programming Guide read from its source at a pinned commit, library and firmware repositories read at the pinned commits linked below, measurements published by those projects' own authors, and the FSF's licence texts and GPL FAQ. "Computed" marks my arithmetic on sourced inputs and "my reading" marks interpretation. Anything not confirmed is marked UNVERIFIED and collected at the end. The licence lines say what the texts say; they are not legal advice.

**How strong the evidence is.** Strong for Espressif's current figures, the protocol clients' defaults and every licence: all read from source. Medium for latency: Espressif publishes throughput and the power-save receive delay, but no request round-trip time, and no PNG decode figure was found for the ESP32-S3. Thin for board-level current: none was found published for a board that stays awake with Wi-Fi. [Key press to frame on the real board][t21] settles those.

This note builds on [software-prior-art.md §4][prior] (TRMNL's contract, ESPHome `online_image`, the Inkplate examples, OpenEPaperLink) and [hardware-mcu-epaper-boards.md][hw] (boards, refresh times, the battery estimate), and does not repeat them.

## Key findings

1. **Staying associated costs the ESP32 little.** With Wi-Fi associated, an ESP32-S3 averages 0.93–2.45 mA in auto light sleep and 19.5–40.1 mA in modem sleep, measured by Espressif in a shielded box [idf-cur-s3]. A two-hour session then costs about 2–5 mAh or 39–80 mAh (computed). The candidate boards carry 2,000 mAh or more [hw].
2. **The panel, not the network, sets the latency.** A 1-bit 800×480 frame is 48,000 bytes: about 19 ms at the 20 Mbit/s TCP rate Espressif measured over the air in its lab (computed) [idf-wifi-perf]. A partial refresh on the reTerminal E1001's panel takes 435 ms [gx-gdey075t7]. Power save adds up to one DTIM interval when a reply comes more than 50 ms after the request [idf-wifi-perf] [idf-wifi-kconfig].
3. **TRMNL X already makes a round trip per tap.** A left or right tap asks `/api/display` for the previous or next frame, and the firmware stays awake until 20 s pass without a touch [tr-touch-h] [tr-bl]. It is the nearest prior art to a session, and it lasts 20 seconds, not two hours.
4. **MIT firmware is possible on every candidate board.** Seeed_GFX2 (MIT) drives the reTerminal E1001 to E1004 with partial and fast refresh [sgfx2] [sgfx2-lic]. FastEPD (Apache-2.0) drives the Inkplate 10 and TRMNL X, and TRMNL's own E1003 build uses it [fastepd] [fastepd-h] [tr-pio]. GxEPD2, Seeed_GxEPD2, bb_epaper and ESPHome's C++ runtime are GPL-3.0 [gx-lic] [sgx-lic] [bbep-lic] [esphome-lic].
5. **A fork of TRMNL's firmware would put GPL-3.0 files in this repo.** GPLv3 licenses a modified work "as a whole" under the GPL [gpl3], and ADR 0001 says everything in the repo is published under MIT [adr1]. Building on it needs that ADR amended, or the firmware kept in another repo (my reading).
6. **The full-refresh cadence is unsettled.** Soldered's own Inkplate sources give 5–10, 10, about 50 and 60–80 partial updates between full refreshes [ink-drv] [prior] [hw]. ESPHome defaults to 1 (always full) on the E1001, 10 on the Inkplate and 30 on the IT8951 [eh-epaper] [eh-inkplate] [eh-it8951].

## 1. Staying awake with Wi-Fi associated

Espressif's averages are at 160 MHz, measured in a shielded box [idf-lp-wifi] [idf-cur-s3-ls]. The guide does not name its test hardware; a terminal board adds its PSRAM, regulators and panel driver (my reading).

- **Modem sleep, minimum** (`WIFI_PS_MIN_MODEM`, ESP-IDF's default [idf-wifi-perf], and Arduino-ESP32's except on the S2 [ard-wifi]). The radio sleeps between DTIM beacons and the CPU keeps running [idf-lp-wifi].
  - ESP32-S3: 40.1 / 38.7 / 38.2 mA at DTIM 1 / 3 / 10, or 20.7 / 19.9 / 19.5 mA with dynamic frequency scaling [idf-cur-s3].
  - ESP32: 31.12 / 28.81 / 29.66 mA, or 22.65 / 21.89 / 20.01 mA with scaling [idf-cur-esp32].
- **Auto light sleep with Wi-Fi kept alive.** The CPU pauses between beacons. The chip wakes "before the arrival of DTIM frames" and "when actively sending packets" [idf-lp-wifi].
  - ESP32-S3: 2.45 / 1.33 / 0.93 mA at DTIM 1 / 3 / 10, with peaks of 120 mA [idf-cur-s3-ls].
  - ESP32: 3.34 / 2.33 / 2.19 mA [idf-cur-esp32].
  - It needs `CONFIG_PM_ENABLE`, off by default, and FreeRTOS tickless idle [idf-pm] [idf-pm-kconfig].
- **Power save off** (`WIFI_PS_NONE`). Espressif publishes no average. The radio then listens all the time (my reading). Receiving is rated at 88–91 mA on the ESP32-S3 and 95–100 mA on the ESP32, the ESP32's figure also covering "Rx and listening" [ds-s3] [ds-esp32]. That makes at least 176 mAh on the ESP32-S3 and 190–200 mAh on the ESP32 per two-hour session (computed).
- **Board level is not published.** In light sleep, Espressif adds 140 µA for 8 MB of octal PSRAM at 3.3 V, or 200 µA at 1.8 V [ds-s3]. The hardware note assumed 5–30 mA for a session [hw-battery]. Espressif's figures put auto light sleep below that range and modem sleep with frequency scaling inside it.
- **Reference.** TRMNL's deep-sleep cycle costs 0.186 mAh and takes about 10.5 s per wake on its ESP32-C3 model [tr-readme]. For the 44 presses of [#7][t7]'s five-recipe session, that is about 8 mAh (computed), at 10 s a press.

Latency from a key press, by stage:

- **Key to CPU.** In modem sleep the CPU runs; enabling power management adds 0.2–40 µs of interrupt latency [idf-pm]. In auto light sleep GPIO interrupts are not generated, so each key must be a wake source; any GPIO can be one [idf-pm] [idf-sleep]. ESP-IDF's sleep code assumes 382 µs to leave light sleep on the ESP32-S3 when it runs from IRAM (`CONFIG_PM_SLP_IRAM_OPT`), and 8,628 µs when it does not (212 and 476 µs on the ESP32) [idf-sleep-c].
- **Request out.** Immediate in both modes: sending wakes the radio [idf-lp-wifi].
- **Reply in.** Once awake, the station stays awake for at least 50 ms (`CONFIG_ESP_WIFI_SLP_DEFAULT_MIN_ACTIVE_TIME`, settable from 8 to 60 ms), and each packet sent or received restarts that time [idf-wifi-kconfig].
  - The access point holds packets for a sleeping station [idf-lp-wifi], so a later reply waits for the next beacon the station listens to: "the delay in receiving Wi-Fi data may be the same as the DTIM cycle", or the listen interval in maximum modem sleep [idf-wifi-perf].
  - At a beacon interval of 100 TU, ESP-IDF's own soft-AP default [idf-wifi-types], that wait is up to 0.1 s at DTIM 1 and 0.3 s at DTIM 3 (computed).
  - Anything the server pushes unprompted waits the same way. Turning power save off removes the wait and costs the current above [idf-wifi-perf].
- **Risk.** TRMNL's firmware skips its timed light sleep while Wi-Fi is on, for its ESP32-C5 board only: "Light sleep with the WiFi radio running hangs the ESP32-C5" [tr-display]. No such report was found for the ESP32 or the ESP32-S3.

## 2. Request patterns

- **HTTP keep-alive.** `esp_http_client` keeps the connection open for further requests on the same handle, unless the server sends `Connection: close` [idf-http]. Arduino's `HTTPClient` keeps alive by default (`setReuse`, `_reuse = true`) [ard-http].
- **WebSocket.** `esp_websocket_client` (Apache-2.0) reconnects by itself after 10 s, pings every 10 s and aborts after 120 s without a pong; all three are settable [ws-h] [ws-c]. A 10 s ping wakes the radio to transmit every 10 s while idle (my reading). On Arduino, arduinoWebSockets (LGPL-2.1 [arduinows-lic]) retries every 500 ms by default [arduinows].
- **MQTT.** `esp-mqtt` (Apache-2.0 [mqtt-lic]) sends a keep-alive every 120 s and reconnects after 10 s [mqtt-h] [mqtt-cfg], and needs a broker. Arduino's PubSubClient (MIT [pubsub-lic]) keeps alive every 15 s and caps packets at 256 bytes by default. Its `setBufferSize` takes a 16-bit size, so at most 65,535 bytes: less than a 1200×825 frame [pubsub].
- **Long polling.** No ESP-specific source was read. It is an HTTP request the server holds open, so it uses the keep-alive client above and pays the same push delay (my reading).
- **Reconnection.** After a beacon timeout the station sends five probe requests, and disconnects if the access point still does not answer. "It is the application's responsibility to reconnect": call `esp_wifi_connect()`, close every socket and re-create them [idf-wifi-sta].
- **Latency.** Espressif publishes no request round-trip time; #21 measures it.

## 3. Frames

- **Size and transfer** (computed). A 1-bit frame is 48,000 bytes at 800×480, 123,750 at 1200×825 and 328,536 at 1872×1404. Espressif measured 20 Mbit/s of TCP receive over the air in its lab for both chips, and 65–73 Mbit/s in a shielded box [idf-wifi-perf]. At 20 Mbit/s the raw frames take about 19, 50 and 131 ms, before HTTP and TLS overhead.
- **PNG decode.** TRMNL decodes with PNGdec (Apache-2.0), which needs 48 KB of free RAM [tr-pio] [pngdec-lic] [pngdec].
  - Its author measured 3,610 µs for a 240×200 8-bit image on an ESP32 at 240 MHz, without colour conversion [pngdec-perf].
  - That image holds 48,000 raw bytes, as a 1-bit 800×480 frame does (computed). The three frames should then decode in roughly 4, 9 and 25 ms (computed; real frames compress differently).
  - No ESP32-S3 figure is published.
- **Refresh.** Board figures are in the hardware note [hw].
  - GxEPD2's driver for the E1001's panel records 435 ms for a partial refresh, 1,171 ms for a fast full one, and 129 ms to power the panel on [gx-gdey075t7].
  - The Inkplate driver can leave the panel supply on between updates, to save the supply's start-up time at the next update [ink-drv].
- **Partial regions.**
  - GxEPD2 windows need x and width in multiples of 8, "an addressing limitation of the e-paper controllers" [gx-bw].
  - FastEPD updates a band of rows [fastepd-h].
  - The Inkplate driver updates only the changed pixels of the whole frame, in 1-bit mode only [ink-drv].
  - ESPHome's IT8951 driver refreshes "only the bounding box" of what was drawn when `auto_clear_enabled` is off [eh-it8951].
- **Ghosting and the full-refresh cadence.**
  - GxEPD2: "all differential refresh waveforms are a compromise (ghosting, big font use)" [gx-readme].
  - The Inkplate 10 driver forces a full update after 10 partials by default, while its own comment calls that limit disabled by default and advises a full update "every 60-80 partial updates" [ink-drv]. Soldered's example says 5–10 [prior], its docs about 50 [hw].
  - ESPHome's `full_update_every` defaults to 1 on the E1001, whose example uses 30 [eh-epaper]. It defaults to 10 on the Inkplate, whose partial mode "leaves burnin" [eh-inkplate], and to 30 on the IT8951 [eh-it8951].

## 4. Timers and the buzzer when Wi-Fi drops

- **Timers keep running in auto light sleep.** The chip wakes "before the nearest event (task being unblocked, or timer elapses)" [idf-pm].
- **The buzzer.** TRMNL's E1001 build puts the buzzer on GPIO45 at 2,700 Hz [tr-pio], driven by LEDC PWM [tr-buzzer]. LEDC keeps sounding through light sleep only in `LEDC_SLEEP_MODE_KEEP_ALIVE` with a light-sleep-compatible clock [idf-ledc].
- **So** a terminal that holds each running timer's end time can count down and ring offline, and one that only receives frames cannot. Showing the countdown offline means drawing at least the timer area on the terminal (my reading).
- **Back online,** the clients above retry after 10 s by default, or 500 ms for arduinoWebSockets [ws-c] [mqtt-cfg] [arduinows].

## 5. Firmware bases and their licences

What each provides, its licence, and what building on it means here (my reading of the texts below):

- **TRMNL firmware** (GPL-3.0 [tr-lic]). Arduino on ESP-IDF [tr-pio], with captive-portal provisioning, OTA, fast refresh and button handling [prior], and the TRMNL X touch bar [tr-touch-h]. It draws with bb_epaper (GPL-3.0 [bbep-lic]) or FastEPD, and decodes with PNGdec and JPEGDEC [tr-pio]. A fork stays GPL-3.0 as a whole [gpl3], so it cannot sit in this repo under ADR 0001 as written [adr1].
- **ESPHome** (C++ runtime GPLv3; Python and everything else MIT [esphome-lic]). Configured in YAML. It has a captive-portal fallback after a minute without Wi-Fi [eh-portal], Improv over serial [eh-improv], OTA [eh-ota], GPIO keys with debounce filters [eh-gpio], deep sleep with a wake pin [eh-sleep], and drivers with partial refresh for the E1001, E1003 and Inkplate 10 (section 3). Our YAML can be MIT, but any firmware built from it contains GPLv3 code.
- **GxEPD2** (GPL-3.0 [gx-lic]) and **Seeed_GxEPD2** (GPL-3.0 [sgx-lic]). SPI panel drivers with partial windows [gx-bw]: no provisioning, OTA or key handling. Our source can stay MIT, but a binary handed to anyone is GPL-3.0 as a whole [gpl-faq-lib].
- **Seeed_GFX** (MIT, BSD and FreeBSD notices [sgfx-lic]) and its successor **Seeed_GFX2** 1.0.0 (MIT [sgfx2-lic]). Arduino libraries [sgfx2-lib] with profiles for the reTerminal E1001 to E1004, "Full and partial refresh, fast refresh", and an optional UI layer with "input handling" [sgfx2]. No provisioning or OTA. Permissive throughout.
- **FastEPD** (Apache-2.0 [fastepd-lic]). Parallel and IT8951 panels, the Inkplate 10 and TRMNL X among them, with full and row-band partial updates [fastepd] [fastepd-h]: a panel driver only. Compatible with MIT.
- **epdiy** (LGPL-3.0 firmware, CC BY-SA 4.0 board, MIT utilities [epdiy]). A parallel panel driver for ESP-IDF and Arduino that updates partial screen regions [epdiy], for its own boards and the LilyGo T5 S3 Pro; it has no Inkplate board definition [epdiy-boards]. MIT source can link it, with the LGPL duties below on binaries.
- **Inkplate library** (LGPL-3.0 [ink-lic]). The Inkplate 10 driver with 1-bit partial updates [ink-drv], and web image helpers [prior]. Its network helpers join Wi-Fi with credentials passed in code, download over HTTP(S) and read NTP time [ink-net]; there is no provisioning portal or OTA in it. Same LGPL duties.
- **Bare ESP-IDF** (Apache-2.0 [idf-lic]). Wi-Fi and power management, `network_provisioning` (moved to the component registry in v6.0 [idf-prov]), HTTPS OTA [idf-ota], GPIO wake for keys [idf-sleep], and the HTTP, WebSocket and MQTT clients above. No path in its tree mentions e-paper [idf-tree], so the panel driver comes from one of the libraries above. Compatible with MIT. The Arduino-ESP32 core on top of it is LGPL-2.1 [ard-lic].

What the licence texts say:

- **GPL libraries.** When a program links a GPL library, "the software modules that link with the library may be under various GPL compatible licenses, but the work as a whole must be licensed under the GPL" [gpl-faq-lib]. A module added to a GPL program may be released "under a license which is more lax than the GPL but compatible with the GPL" [gpl-faq-module].
- **Compatibility.** The FSF lists Expat ("the MIT License") and FreeBSD as compatible with the GPL, and Apache 2.0 and LGPLv3 as compatible with GPLv3 [fsf-list].
- **Only conveying binds.** "You may make, run and propagate covered works that you do not convey, without conditions" [gpl3]. A modified work is licensed "as a whole" (§5c), but works side by side in an "aggregate" keep their own licences [gpl3].
- **Separate programs.** The FAQ calls sockets a mechanism "normally used between two separate programs" [gpl-faq-agg]. A GPL firmware talking HTTP to an MIT server leaves the server MIT (my reading).
- **LGPL.** A statically linked application must be provided "in an object (not necessarily source) format, so that a user has the opportunity to modify the library and relink the application" [gpl-faq-lgpl]. LGPLv3 §4 adds notices and copies of the licences [lgpl3]. Publishing the MIT source meets the relinking part (my reading).

## Options for the protocol's shape

Latency and power are computed from the sourced inputs above, for a 1-bit frame; complexity is my reading. The E1001 is the worked board because the most is published about its panel. Power is Espressif's ESP32-S3 figure over a two-hour session.

| Option | Key press to frame (E1001) | Power while awake (2 h, Espressif's figures) | Firmware complexity | Licence consequences |
|---|---|---|---|---|
| Reference: wake from deep sleep per press, as TRMNL does | About 10.5 s [tr-readme] | 0.186 mAh a press, measured on TRMNL's board; 8 mAh for 44 presses | Exists | GPL-3.0 if forked |
| A. Round trip per key press | 0.46 s plus the LAN round trip and server time. Powering the panel on adds 0.13 s; a reply that misses the 50 ms window adds up to 0.3 s at DTIM 3 | Reply latency matters, so DTIM 1: 4.9 mAh in auto light sleep, 41–80 mAh in modem sleep | Lowest: TRMNL's contract plus the key pressed | Any base; the quick start, a TRMNL fork, is GPL-3.0 |
| B. Prefetched frames | 0.44–0.57 s, from memory | Replies leave the critical path, so the radio can wake every 10 beacons (Espressif's DTIM 10 case): about 1.9 mAh, plus 2–3 frames fetched per press | Medium: a cache keyed by session state, its invalidation, a PSRAM budget | Custom firmware; MIT possible |
| C. Rendering on the terminal | Panel time plus local drawing (UNVERIFIED) | Wi-Fi only to sync; light sleep with it off is 0.38–0.44 mA with 8 MB of PSRAM [ds-s3] | Highest: fonts, layout and a second renderer held to the same 1-bit checks | Adds a graphics stack: LVGL [lvgl-lic] or Seeed_GFX2 (MIT); GxEPD2 or bb_epaper make it GPL-3.0 |
| D. Hybrid: B plus timers and buzzer on the terminal | As B; timers count and ring with Wi-Fi down | As B | Medium-high: B plus a small renderer for the timer area | As B, plus a font renderer |

**A. Round trip per key press.** The terminal sends the key it read. The server's conductor picks what comes next, and the server answers with the frame, as raw 1-bit, as PNG, or as only the changed rectangle. This is TRMNL's pull contract plus key identity [prior], and TRMNL X already runs it for 20 s after a tap [tr-touch-h]. Latency is the panel's plus about 23 ms of transfer and decode at 800×480, or about 155 ms at 1872×1404, plus the LAN round trip and the render. A reply later than 50 ms after the request waits up to one DTIM interval, unless the terminal turns power save off for the exchange [idf-wifi-perf]. On the same arithmetic the Inkplate 10 lands near 0.7–1.0 s and TRMNL X near 0.4–0.7 s, from their published refresh times [hw]. Wi-Fi must stay associated all session, and a drop freezes the last frame. Timer alarms need either a push channel, which pays the DTIM delay, or option D.

**B. Prefetched frames.** Each response also carries the frames for the likely next presses, such as next and back. A press then costs only the decode and the refresh. The 8 MB of PSRAM on the Seeed boards and TRMNL X [hw] holds about 170 frames at 800×480 or 25 at 1872×1404 (computed), so memory is not the limit. The costs are a cache keyed by the session's state, invalidation when the conductor or a timer changes the plan, and two to three times the bytes per press (my reading). Since no reply is awaited at press time, the station can wake only every few beacons with maximum modem sleep and a long listen interval [idf-wifi-perf]. Espressif's DTIM 10 case averages 0.93 mA [idf-cur-s3], though ESPHome warns that its highest power-saving mode brings "frequent disconnections from the router" [eh-wifi]. After a Wi-Fi drop, the terminal can still step through the cached frames.

**C. Rendering on the terminal.** The server sends the session as data (steps, quantities, timers), and the terminal lays out and draws every frame. Presses never wait on the network, Wi-Fi can be off between syncs, and everything works offline. The price is the largest firmware: fonts, text layout and local-language shelf names in C or C++. It also needs a second renderer whose output passes the same 1-bit, native-resolution checks as the server's (`CLAUDE.md`). Drawing time on the terminal is UNVERIFIED.

**D. Hybrid.** Frames come from the server as in B, and the terminal draws only the timer area and owns the buzzer. Timers then keep counting and ringing when Wi-Fi drops (section 4). It needs a digit renderer, each timer's end time in every response, and B's cache invalidation.

The licence consequences hardly depend on the shape (my reading). B, C and D need custom firmware anyway, and it can be MIT on Seeed_GFX2 or FastEPD with PNGdec and ESP-IDF. A on a TRMNL fork is the shortest path and makes the firmware GPL-3.0.

## What #21 should measure

On the chosen board, with fixture frames:

1. Key press to drawn frame, split into stages: key edge, request out, first byte in, last byte in, decode done, refresh done. For a full frame and a partial region, raw and PNG.
2. The same in modem sleep, in auto light sleep and with power save off. Use DTIM 1 and 3 where the access point lets you set it, with the server replying before and after 50 ms.
3. Board current over a two-hour session in each of those modes, with the panel idle between presses, and the charge one press costs.
4. Partial and full refresh times on the real panel, with the panel supply left on and switched off between updates.
5. Ghosting after 5, 10, 30 and 60 partial refreshes, judged at the fridge, to set the full-refresh cadence.
6. PNG size and decode time of fixture frames on the board's chip.
7. Wi-Fi loss: time to notice and to reconnect, while a local timer keeps counting and the buzzer rings.
8. Whether auto light sleep with Wi-Fi stays up for two hours, and the time from deep sleep to the first frame.

## UNVERIFIED

- Board-level current of any candidate board awake with Wi-Fi associated. Every current above is Espressif's, not a board's.
- Request round-trip time on a LAN with `esp_http_client` or Arduino's `HTTPClient`.
- PNG decode time on the ESP32-S3, and for 1-bit frames at the three sizes. The figures above scale one ESP32 benchmark.
- How small real 1-bit frames get as PNG.
- Refresh times with Seeed_GFX2 on the E1001 and E1003; its README claims partial and fast refresh without times. The E1003's partial time is still unpublished [hw].
- Whether a stock Arduino-ESP32 build can use auto light sleep. `CONFIG_PM_ENABLE` defaults to off [idf-pm-kconfig], and the Arduino library builder's configs do not set it [ard-lib], but the shipped `sdkconfig` was not checked.
- Auto light sleep with Wi-Fi held for hours on the ESP32-S3 boards. The only hang report found is TRMNL's, on an ESP32-C5.
- Long polling on ESP-IDF and Arduino: no primary source was read.
- TLS handshake time on the ESP32 and ESP32-S3, for HTTPS or a secure WebSocket after a reconnect: not researched.
- The access point's beacon interval. The delays above assume 100 TU.
- Drawing time for option C, and LVGL's fit for 1-bit e-paper; only its licence was read.
- The Inkplate 10's PSRAM size [hw].

<!-- Sources -->

[t21]: https://github.com/gariasf/evey/issues/21
[t7]: https://github.com/gariasf/evey/issues/7
[prior]: ./software-prior-art.md#4-thin-client-e-paper-prior-art
[hw]: ./hardware-mcu-epaper-boards.md
[hw-battery]: ./hardware-mcu-epaper-boards.md#battery-capacity-versus-runtime-estimate
[adr1]: ../adr/0001-the-repo-is-public-recipe-content-stays-out.md

[ds-s3]: https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf
[ds-esp32]: https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf
[idf-lp-wifi]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-guides/low-power-mode/low-power-mode-wifi.rst
[idf-cur-s3]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-guides/sleep-current/esp32s3_summary.inc
[idf-cur-s3-ls]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-guides/sleep-current/esp32s3_light_sleep.inc
[idf-cur-esp32]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-guides/sleep-current/esp32_summary.inc
[idf-wifi-perf]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-guides/wifi-driver/wifi-performance-and-power-save.rst
[idf-wifi-sta]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-guides/wifi-driver/station-scenarios.rst
[idf-wifi-kconfig]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/components/esp_wifi/Kconfig
[idf-wifi-types]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/components/esp_wifi/include/esp_wifi_types_generic.h
[idf-sleep]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-reference/system/sleep_modes.rst
[idf-sleep-c]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/components/esp_sleep/sleep_modes.c
[idf-pm]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-reference/system/power_management.rst
[idf-pm-kconfig]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/components/esp_pm/Kconfig
[idf-ledc]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-reference/peripherals/ledc.rst
[idf-http]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-reference/protocols/esp_http_client.rst
[idf-ota]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/api-reference/system/esp_https_ota.rst
[idf-prov]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/docs/en/migration-guides/release-6.x/6.0/provisioning.rst
[idf-lic]: https://github.com/espressif/esp-idf/blob/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81/LICENSE
[idf-tree]: https://github.com/espressif/esp-idf/tree/ad20ded62a2d67a26e501fdc1905f43ba7ad6c81
[ws-h]: https://github.com/espressif/esp-protocols/blob/08d93b7a5cecd89645283a73de4491c6bbea415a/components/esp_websocket_client/include/esp_websocket_client.h
[ws-c]: https://github.com/espressif/esp-protocols/blob/08d93b7a5cecd89645283a73de4491c6bbea415a/components/esp_websocket_client/esp_websocket_client.c
[mqtt-h]: https://github.com/espressif/esp-mqtt/blob/fe392196a6cf34a8748ca7eb22a255cca09a2961/include/mqtt_client.h
[mqtt-cfg]: https://github.com/espressif/esp-mqtt/blob/fe392196a6cf34a8748ca7eb22a255cca09a2961/lib/include/mqtt_config.h
[mqtt-lic]: https://github.com/espressif/esp-mqtt/blob/fe392196a6cf34a8748ca7eb22a255cca09a2961/LICENSE
[ard-http]: https://github.com/espressif/arduino-esp32/blob/bc8ab15634eb0402d39e1e259a5a4a29be3e6e1c/libraries/HTTPClient/src/HTTPClient.h
[ard-wifi]: https://github.com/espressif/arduino-esp32/blob/bc8ab15634eb0402d39e1e259a5a4a29be3e6e1c/libraries/WiFi/src/WiFiGeneric.cpp
[ard-lic]: https://github.com/espressif/arduino-esp32/blob/bc8ab15634eb0402d39e1e259a5a4a29be3e6e1c/LICENSE.md
[ard-lib]: https://github.com/espressif/esp32-arduino-lib-builder/tree/c26041da7e672c6984babbd76de855474283631c/configs
[arduinows]: https://github.com/Links2004/arduinoWebSockets/blob/1c77130ce7aa299a20a4d72b75cd371c6f711fad/src/WebSocketsClient.cpp
[arduinows-lic]: https://github.com/Links2004/arduinoWebSockets/blob/1c77130ce7aa299a20a4d72b75cd371c6f711fad/LICENSE
[pubsub]: https://github.com/knolleary/pubsubclient/blob/4eb0dc703522f687bbe4629b8252b0d71e6771f2/src/PubSubClient.h
[pubsub-lic]: https://github.com/knolleary/pubsubclient/blob/4eb0dc703522f687bbe4629b8252b0d71e6771f2/LICENSE.txt

[tr-readme]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/README.md
[tr-lic]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/LICENSE
[tr-pio]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/platformio.ini
[tr-bl]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/src/bl.cpp
[tr-touch-h]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/include/touchbar_actions.h
[tr-display]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/src/display.cpp
[tr-buzzer]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/src/misc/buzzer/pwm_buzzer.cpp
[bbep-lic]: https://github.com/bitbank2/bb_epaper/blob/5c14786ff188799e74744a5e6c51b0efdabc1539/LICENSE
[pngdec]: https://github.com/bitbank2/PNGdec/blob/7ef2a0924d01e521352ea000fe20926d0cc99c85/README.md
[pngdec-perf]: https://github.com/bitbank2/PNGdec/blob/7ef2a0924d01e521352ea000fe20926d0cc99c85/perf_small.png
[pngdec-lic]: https://github.com/bitbank2/PNGdec/blob/7ef2a0924d01e521352ea000fe20926d0cc99c85/LICENSE
[fastepd]: https://github.com/bitbank2/FastEPD/blob/cee828c1f782bb8978f5993d5d52f9fdf517617b/README.md
[fastepd-h]: https://github.com/bitbank2/FastEPD/blob/cee828c1f782bb8978f5993d5d52f9fdf517617b/src/FastEPD.h
[fastepd-lic]: https://github.com/bitbank2/FastEPD/blob/cee828c1f782bb8978f5993d5d52f9fdf517617b/LICENSE
[gx-readme]: https://github.com/ZinggJM/GxEPD2/blob/de82887e77a78528ea386e68bba2cb0291d2c319/README.md
[gx-bw]: https://github.com/ZinggJM/GxEPD2/blob/de82887e77a78528ea386e68bba2cb0291d2c319/src/GxEPD2_BW.h
[gx-gdey075t7]: https://github.com/ZinggJM/GxEPD2/blob/de82887e77a78528ea386e68bba2cb0291d2c319/src/gdey/GxEPD2_750_GDEY075T7.h
[gx-lic]: https://github.com/ZinggJM/GxEPD2/blob/de82887e77a78528ea386e68bba2cb0291d2c319/LICENSE
[sgx-lic]: https://github.com/Seeed-Projects/Seeed_GxEPD2/blob/1100ea37c16b910fd79152f4250c13d802b9c20b/LICENSE
[sgfx-lic]: https://github.com/Seeed-Studio/Seeed_GFX/blob/0dfdd7135425be82b5bb4b4b58d74dd51ab29a59/license.txt
[sgfx2]: https://github.com/Seeed-Studio/Seeed_GFX2/blob/c891be8dd26ffd9d720f40d4445d135a4fc41dcf/README.md
[sgfx2-lic]: https://github.com/Seeed-Studio/Seeed_GFX2/blob/c891be8dd26ffd9d720f40d4445d135a4fc41dcf/LICENSE
[sgfx2-lib]: https://github.com/Seeed-Studio/Seeed_GFX2/blob/c891be8dd26ffd9d720f40d4445d135a4fc41dcf/library.json
[epdiy]: https://github.com/vroland/epdiy/blob/42c16127dc5d4bca15e830624f22666ad914575f/README.md
[epdiy-boards]: https://github.com/vroland/epdiy/tree/42c16127dc5d4bca15e830624f22666ad914575f/src/board
[ink-drv]: https://github.com/SolderedElectronics/Inkplate-Arduino-library/blob/3c15d3275bb3b5c0d4b0ea8d79d87a8380a94554/src/boards/Inkplate10/Inkplate10Driver.cpp
[ink-net]: https://github.com/SolderedElectronics/Inkplate-Arduino-library/blob/3c15d3275bb3b5c0d4b0ea8d79d87a8380a94554/src/system/NetworkController/NetworkController.h
[ink-lic]: https://github.com/SolderedElectronics/Inkplate-Arduino-library/blob/3c15d3275bb3b5c0d4b0ea8d79d87a8380a94554/LICENSE
[lvgl-lic]: https://github.com/lvgl/lvgl/blob/21e12253117d4aba82789e3c6b35231ab933c86e/LICENCE.txt

[esphome-lic]: https://github.com/esphome/esphome/blob/c8a894a2bf6f82c7bf030cec12d786fc39aa41e2/LICENSE
[eh-epaper]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/display/epaper_spi.mdx
[eh-inkplate]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/display/inkplate.mdx
[eh-it8951]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/display/it8951.mdx
[eh-wifi]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/wifi.mdx
[eh-portal]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/captive_portal.mdx
[eh-improv]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/improv_serial.mdx
[eh-ota]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/ota/esphome.mdx
[eh-gpio]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/binary_sensor/gpio.mdx
[eh-sleep]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/deep_sleep.mdx

[gpl-faq-lib]: https://www.gnu.org/licenses/gpl-faq.html#IfLibraryIsGPL
[gpl-faq-module]: https://www.gnu.org/licenses/gpl-faq.html#GPLModuleLicense
[gpl-faq-agg]: https://www.gnu.org/licenses/gpl-faq.html#MereAggregation
[gpl-faq-lgpl]: https://www.gnu.org/licenses/gpl-faq.html#LGPLStaticVsDynamic
[fsf-list]: https://www.gnu.org/licenses/license-list.html
[gpl3]: https://www.gnu.org/licenses/gpl-3.0.html
[lgpl3]: https://www.gnu.org/licenses/lgpl-3.0.html
