# Large mono e-paper boards the first sweep missed

Checked 2026-11-20. Every price and stock status was read on that date. Buyer location assumed: Spain (EU).

## How to read this file

- Each claim ends with a source key such as `[laskakit-live]`; the URLs are under [Sources](#sources). `[first-note]` is [`hardware-mcu-epaper-boards.md`](hardware-mcu-epaper-boards.md), whose candidates are not repeated here.
- **UNVERIFIED** means I could not confirm the claim from a primary source loaded on 2026-11-20. "computed" is my arithmetic on sourced inputs. "My reading" is interpretation, not a maker's statement.
- **Qualifies** means a mono panel of 7.5″ or more with a published fast or partial refresh time, from the device maker or from the panel maker for the exact panel (the rule the first note applied to the reTerminal E1001).

## Key findings

1. **Two candidates qualify, both new:** the LaskaKit Live-7.x-Pro (7.5″) and the Visionect Place & Play 13 (13.3″). Neither displaces a first-note pick on the whole brief (my reading): LaskaKit lacks the E1001's buzzer, RTC and wake key; Visionect has no inputs and closed firmware.
2. **Visionect publishes "750 ms (4-bit full screen) - 100 ms (1-bit partial)"** [vis-pp13-docs], faster than any device of 7.5″ or more in the first note (TRMNL X: ≤200 ms) [first-note], and ships a magnetic mount. It has no buttons or touch, closed firmware, a per-device licence and costs €899 excl. tax [vis-pp13-shop].
3. **LaskaKit's kit uses the reTerminal E1001's panel** (GDEY075T7, partial 0.3 s per the panel maker [gd-gdey075t7]) with a 6000 mAh battery and three buttons that cannot wake the board [laskakit-live] [laskakit-frame-gh]. It was out of stock at €122.74 incl. VAT [laskakit-live].
4. **Three of the four TRMNL targets are small:** Xteink X4 (4.26″), Xteink X3 (3.68″), Zectrix Note 4 (4.2″). **`trmnl_gen2` is a 7.5″ TRMNL OG on an ESP32-C5** that TRMNL's spec sheet does not list [trmnl-pio] [trmnl-board] [trmnl-og-spec].
5. **ESP32 boards for large parallel panels exist** (epdiy v7; EPDinky on an ESP32-P4), but neither publishes a refresh time, and stock was sold out or down to one [epdiy-tindie] [epdinky-tindie].

## 1. Comparison table

Same fields as the first note's tables 1a to 1c, transposed for two candidates.

| Field | LaskaKit Live-7.x-Pro, mono variant (LA180057A) | Visionect Place & Play 13 |
|---|---|---|
| Panel | 7.5″, 800×480, 4 grey, Good Display GDEY075T7 [laskakit-frame-gh]; UC8179 [gd-gdey075t7]; ≈124 ppi (computed). Same panel as the reTerminal E1001 [first-note] | 13.3″, 1600×1200, 16 grey, E Ink Carta, non-touch [vis-pp13-docs]; ≈150 ppi (computed) |
| Stated refresh (full / fast or partial) | LaskaKit: "fast (~3.5 s), partial refresh", no partial time [laskakit-frame-gh]. Panel maker: full 3 s, fast 1.5 s, partial 0.3 s at 25 °C [gd-gdey075t7] | "750 ms (4-bit full screen) - 100 ms (1-bit partial)" [vis-pp13-docs] |
| Official caveats | UP/PUSH/DOWN "cannot wake the ESP32-S3 from deep sleep"; wake with RESET or a timer. A solder jumper must be set for the panel type [laskakit-frame-gh] | "Indoor use only", 0–45 °C [vis-pp13-docs]. Running the server on-premise "may pose security and feature limitations" [vis-billing] |
| MCU / flash / PSRAM | ESP32-S3-WROOM-1U-N16R8: 16 MB flash, 8 MB PSRAM, U.FL antenna [laskakit-frame-gh]; antenna in the kit [laskakit-live] | Not published: UNVERIFIED |
| Battery / charger / sleep / wake | 6000 mAh LiPo in the kit [laskakit-live]; TP4054 charger (≈0.56 A) from USB-C, power switch, peripheral rail switched off before deep sleep [laskakit-frame-gh]. Sleep current UNVERIFIED | 10,800 mAh [vis-pp13-docs] or 10,000 mAh [vis-pp13-shop]; "Up to 12 months of autonomy"; Micro-USB 5 V 1 A, 10 h to charge [vis-pp13-docs] |
| RTC | None listed [laskakit-frame-gh] | Not published |
| Buttons, touch, sensors, buzzer | Three user buttons (UP, PUSH, DOWN) plus RESET; SHT40 sensor; no buzzer listed [laskakit-frame-gh] | None: non-touch, and neither page lists buttons [vis-pp13-docs] [vis-pp13-shop] |
| Expansion | μŠup I²C (Qwiic-compatible) and SPI connectors, microSD, 1×15 header [laskakit-frame-gh] | None listed. 2.4/5 GHz Wi-Fi, Bluetooth 5 [vis-pp13-docs] |
| Enclosure / size / weight / magnets | Board and panel ≈185×120×8 mm, 140 g [laskakit-frame-gh]. Case: aluminium +€44.59, PET +€10.97, or print the published 3D model [laskakit-live]. No magnets listed | Self-adhesive **magnetic mount** included; VESA 100; 950 g [vis-pp13-docs] [vis-pp13-shop]. Published size doubtful (see [Surprises and contradictions](#surprises-and-contradictions)) |
| Software | Schematics, Gerbers and STEP published; Arduino examples on GxEPD2; Živý Obraz firmware [laskakit-frame-gh] | Visionect Software Suite; "A license is needed for every device" [vis-pp13-docs]; on-premise allowed [vis-billing]; its HTTP backend pushes a PNG, JPG or GIF "directly into the frame buffer" [vis-components]. Custom firmware not mentioned: closed (my reading) |
| EU price and stock | **€122.74** incl. Czech VAT (€101.44 excl.), **out of stock** ("Momentálně nedostupné") [laskakit-live]. Board alone €81.80, out of stock [laskakit-frame] | **€899 excl. tax** [vis-pp13-shop]; stock not stated. Licence prices not published [vis-software] |

## 2. The two candidates

**LaskaKit Live-7.x-Pro.** A 7.5″ alternative to the reTerminal E1001 on the same panel, so the same 0.3 s partial figure applies, and it comes from the panel maker only [gd-gdey075t7]. Against the E1001 [first-note]: three times the battery (6000 against 2000 mAh), an external antenna and an EU shop; but no buzzer, no RTC and no button that wakes the board, all of which the E1001 has (wake key on GPIO3, buzzer on GPIO45, PCF8563). It was out of stock today, as was the E1001 at Antratek. At 7.5″ it serves the Card concept only ([#7](https://github.com/gariasf/evey/issues/7)); against Inkplate 10, TRMNL X and the E1003 it is the small-panel option.

**Visionect Place & Play 13.** The only new large candidate that is a finished product. Its 100 ms partial beats TRMNL X (≤200 ms) and Inkplate 10 (0.62 s), and Seeed publishes no partial time for the E1003 [first-note]. At ≈150 ppi it matches Inkplate 10 and falls short of TRMNL X and the E1003 (≈227 ppi) [first-note]. Like TRMNL X it mounts by magnet and carries a large battery. It loses on the rest of the brief: no buttons, touch or buzzer; firmware tied to Visionect's server under a per-device licence whose price is not published; and €899 excl. tax against TRMNL X's €211.95 preorder [first-note]. Keys would have to be a separate device talking to the server (my reading). Its HTTP backend takes ready-made images [vis-components], which suits server-rendered screens.

## 3. Dropped

| Candidate | Facts | Why dropped |
|---|---|---|
| Xteink X4 (`xteink_x4`) | ESP32-C3; panel EP426, 800×480 [trmnl-pio] [trmnl-board]. Sold as a "4.3"" pocket e-reader from $59 [xteink] | Below 7.5″ |
| Xteink X3 (`xteink_x3`) | ESP32-C3; panel EP368, 792×528 [trmnl-pio] [trmnl-board]. "3.7"" e-reader, $55 [xteink] | Below 7.5″ |
| Zectrix Note 4 (`zectrix_note4`) | ESP32-S3 N16R8, "4.2-inch", 400×300, "2,000+ mAh", $54.99, "AVAILABLE NOW" [zectrix-note4]; panel EP42C in the firmware [trmnl-board] | Below 7.5″ |
| TRMNL OG second generation (`trmnl_gen2`) | ESP32-C5 (board `esp32c5_n8r4`), BQ25616 charger, BQ27427 battery gauge, the TRMNL OG's 7.5″ 800×480 panel set (`EPD_75`), hostname "TRMNL-OG" [trmnl-pio] [trmnl-board] [trmnl-config]. The OG spec sheet lists only "TRMNL-OG-GEN1", on an ESP32-C3 [trmnl-og-spec] | Not announced or sold; same panel class as the TRMNL OG [first-note] |
| Seeed Sticky (`seeed_sticky`) | ESP32-S3; panel EP397, 800×480 (3.97″) [trmnl-pio] [trmnl-board] | Below 7.5″ |
| Seeed OpenDisplay 4.26″ Mono Kit | 800×480, nRF52840, "Bluetooth Low Energy only (no Wi-Fi)", partial in black and white with no time given, 2000 mAh, printed case [seeed-od426]. $39.90 [seeed-od426-shop] | Below 7.5″; no Wi-Fi |
| Seeed OpenDisplay 7.3″ Color Kit | Spectra 6: "A full Spectra 6 refresh takes about 15–20 seconds"; BLE only [seeed-od73] | Colour, slow |
| EKOS (Kickstarter) | ESP32-S3 N16R8; supported panels start with the GDEY075T7 [ekos-docs]; "7.5-inch e-paper display with integrated touchscreen panel" [ekos-site]. Campaign "successful": €19,054 from 82 backers; both rewards closed, estimated delivery December 2026, no late pledges [ekos-ks] | Cannot be bought today |
| LaskaKit ESPink v3.6 | ESP32-S3 N16R8, LiPo charging, 16 µA deep sleep (v3.5); panel switch settings include GDEY075T7 and GDEM102T91 (10.2″). 498 CZK, out of stock [laskakit-espink] [laskakit-espink-gh] | Bare board, no buttons listed. The GDEM102T91 is ≈113 ppi (computed) and 800 ms partial in GxEPD2 [first-note] |
| epdiy v7 | ESP32-S3 N16R8 and an RTC; drives the 13.3″ ED133UT2 and "All 9.7"" 1200×825 panels. $69, "Sold out since Nov 15, 2026", ships from Spain [epdiy-tindie] | No published refresh time; bare board |
| EPDinky | ESP32-P4 with an ESP32-C6 for Wi-Fi, TP4056 charger, RV-3028-C7 RTC; panels include ED097TC2 (1200×825), ES133TT3 (2200×1650), ED115OC1 (2760×2070). Runs FastEPD. $74.90, "Only 1 left in stock", ships from Spain [epdinky-tindie]. FastEPD's README states no timings [fastepd] | No published refresh time; bare board |
| Adafruit 7.5″ mono (6396) with eInk Breakout Friend | Bare UC8179 panel, $59.95, out of stock, no refresh claims [ada-6396]. Adafruit_EPD drives it with a 3000 ms refresh delay and no partial mode [ada-epd-750]; its fast mode is enabled only for SSD1680 panels [ada-epd-1680] | Bare panel; no partial refresh in Adafruit's library |
| Adafruit EYESPI breakouts, MagTag | Nothing of 5″ or more in Adafruit's eInk category except bare panels and Pimoroni's colour Inky boards [ada-eink]. MagTag: 2.9″, ESP32-S2, out of stock [ada-magtag] | Below 7.5″ |
| DFRobot | Largest e-ink is the 4.7″ DFR0835 (ESP32-S3, partial refresh, no time given), $55 [dfr-cat] [dfr-0835] | Below 7.5″ |
| Heltec Vision Master | Models T190, E213, E290 [heltec-vm]: E213 is 2.13″ [heltec-e213], E290 2.90″ [heltec-e290] | Below 7.5″ |
| Modos Paper Monitor and Flow (Crowd Supply) | Modos' open monitor controller, Glider, takes a USB-C DisplayPort or DVI video input [glider]; Flow is covered as a monitor in [alt-routes] | Monitors that need a computer |
| Pervasive Displays 12″ E2B98KS063 | 960×768, 103 DPI, fast (partial) update "Yes", time not stated, fast update 0–50 °C [pdi-12] | Panel only, low ppi, no time |

Re-checked, nothing new: Soldered lists no Inkplate after the 13SPECTRA [sol-docs]; Seeed's product matrix shows no mono product of 7.5″ or more beyond the first note's [seeed-matrix]; Elecrow's e-paper range still stops at 5.79″ [elecrow-epaper].

## 4. Options for the panel decision

For [Panel size and hardware platform](https://github.com/gariasf/evey/issues/15). Options, not a decision.

1. **Keep the first note's shortlist unchanged.** Neither new candidate beats it on the whole brief (my reading): the reTerminal E1001 for Card; TRMNL X, Inkplate 10 and the E1003 for Sheet or Board.
2. **Card on the E1001's panel with a bigger battery:** the LaskaKit Live-7.x-Pro, if 6000 mAh and an EU shop outweigh a built-in buzzer, RTC and wake key. It was out of stock today, as was the E1001 at Antratek.
3. **Sheet or Board with the fastest published partial refresh:** the Visionect Place & Play 13, if keys can live on a separate device and a closed, licensed platform at €899 excl. tax plus an unpublished licence fee is acceptable.
4. **A large parallel panel on an open board:** epdiy v7 or EPDinky with a 9.7″ to 13.3″ panel, only after measuring it: no refresh time is published and stock is thin.

## Surprises and contradictions

1. LaskaKit rates the GDEY075T7 "fast (~3.5 s)"; Good Display rates it 1.5 s fast and 0.3 s partial at 25 °C [laskakit-frame-gh] [gd-gdey075t7].
2. Visionect gives the battery as 10,800 mAh in its docs and 10,000 mAh on its product page [vis-pp13-docs] [vis-pp13-shop]. Its published size, 155.2×120.4×12.4 mm [vis-pp13-docs], is smaller than the active area of a 13.3″ 4:3 panel, about 270×203 mm (computed).
3. TRMNL's firmware builds for a second-generation OG (`trmnl_gen2`) [trmnl-pio] that its spec sheet does not list [trmnl-og-spec]. The Zectrix and new Sticky targets landed on 2026-11-19 [trmnl-zectrix].

## UNVERIFIED claims

- LaskaKit Live-7.x-Pro: deep-sleep current; a partial refresh time measured on this board (only the panel maker's 0.3 s exists); restock date; delivery to Spain, its cost, and which VAT applies (the shop's shipping data lists only Czech destinations).
- Visionect Place & Play 13: MCU, RTC, licence prices, stock, whether the firmware can be replaced, the real dimensions, and which battery figure is right.
- `trmnl_gen2`: whether and when TRMNL sells it.
- EKOS: retail price, and when it can be bought outside the campaign.
- epdiy v7: a battery charger (a reviewer mentions one, the seller does not). EPDinky: PSRAM size.
- Refresh times for epdiy v7, EPDinky and the Pervasive Displays 9.7″ and 12″ fast-update panels.

## Not covered

- Crowd Supply's e-paper category and project pages returned HTTP 403 (projects found through search instead). Diptyx (two 5.83″ panels) and Open Book Touch (4.26″) were seen only in search results; both are below 7.5″.
- Kickstarter was searched through a web search only; the one large mono hit was EKOS. Its page blocks automated reads, so its data came from the page source (see Source notes).
- Seeed's blog post on the OpenDisplay kits and Hackster news pages returned HTTP 403; Seeed's wiki and shop pages were used instead.
- Visionect's Joan 13 (the meeting-room sibling) and Place & Play 32 were not checked.
- The TRMNL targets `TRMNL_X_SENSORIAS3` and `TRMNL_X_SENSORIAC5`: FastEPD gives the C5 board a 1280×720 panel [fastepd-inl]; the maker was not found.

## Sources

All loaded 2026-11-20.

[first-note]: hardware-mcu-epaper-boards.md
[alt-routes]: hardware-alternative-routes.md
[laskakit-live]: https://www.laskakit.cz/laskakit-live-7-x-pro-e-paper-stavebnice-s-wifi-pro---zivy-obraz-/
[laskakit-frame]: https://www.laskakit.cz/laskakit-espink-frame-7-x-e-paper-board/
[laskakit-frame-gh]: https://github.com/LaskaKit/ESPink-Frame-7x
[laskakit-espink]: https://www.laskakit.cz/laskakit-espink-esp32-e-paper-pcb-antenna/
[laskakit-espink-gh]: https://github.com/LaskaKit/ESPink
[gd-gdey075t7]: https://www.good-display.com/product/396.html
[vis-pp13-docs]: https://docs.visionect.com/PlaceAndPlay/Devices/PP13.html
[vis-pp13-shop]: https://www.visionect.com/product/place-and-play-13/
[vis-billing]: https://docs.visionect.com/Plans&Billing/index.html
[vis-components]: https://docs.visionect.com/VisionectSoftwareSuite/Components.html
[vis-software]: https://www.visionect.com/software/
[trmnl-pio]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/platformio.ini
[trmnl-board]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/src/board_config.cpp#L30-L84
[trmnl-config]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/include/config.h
[trmnl-zectrix]: https://github.com/usetrmnl/trmnl-firmware/commit/1b68d7522eab9b3dd60b1f847ac7c164ea76f88c
[trmnl-og-spec]: https://trmnl.com/products/og/spec-sheet
[xteink]: https://www.xteink.com/
[zectrix-note4]: https://zectrix.com/en/note4-developer-kit.html
[seeed-od426]: https://wiki.seeedstudio.com/opendisplay_426_mono_kit/
[seeed-od426-shop]: https://www.seeedstudio.com/OpenDisplay-4-26-Mono-Kit-p-7032.html
[seeed-od73]: https://wiki.seeedstudio.com/opendisplay_73_color_kit/
[seeed-matrix]: https://wiki.seeedstudio.com/seeed_epaper_displays/
[ekos-ks]: https://www.kickstarter.com/projects/ekosboard/ekos-programmable-open-source-epaper-hub-in-solid-oak
[ekos-docs]: https://github.com/ekosboard/docs/blob/HEAD/docs/intro.md
[ekos-site]: https://ekosboard.com/
[epdiy-tindie]: https://www.tindie.com/products/fasani/epdiy-v7-816-bit-parallel-epaper-controller/
[epdinky-tindie]: https://www.tindie.com/products/fasani/epdinky-the-esp32-p4-eink-driver/
[fastepd]: https://github.com/bitbank2/FastEPD
[fastepd-inl]: https://github.com/bitbank2/FastEPD/blob/cee828c1f782bb8978f5993d5d52f9fdf517617b/src/FastEPD.inl#L262-L263
[ada-6396]: https://www.adafruit.com/product/6396
[ada-eink]: https://www.adafruit.com/category/150
[ada-epd-750]: https://github.com/adafruit/Adafruit_EPD/blob/10d269c7134efcaad56ce6d5f52b5b9a6487577b/src/panels/ThinkInk_750_Mono_AAAMFGN.h#L69
[ada-epd-1680]: https://github.com/adafruit/Adafruit_EPD/blob/10d269c7134efcaad56ce6d5f52b5b9a6487577b/src/drivers/Adafruit_SSD1680.h#L67-L69
[ada-magtag]: https://www.adafruit.com/product/4800
[dfr-cat]: https://www.dfrobot.com/category-222.html
[dfr-0835]: https://wiki.dfrobot.com/dfr0835/
[heltec-vm]: https://wiki.heltec.org/docs/devices/open-source-hardware/esp32-series/vision-master/
[heltec-e213]: https://wiki.heltec.org/docs/devices/open-source-hardware/esp32-series/vision-master/vison-master-e213/
[heltec-e290]: https://wiki.heltec.org/docs/devices/open-source-hardware/esp32-series/vision-master/vison-master-e290/
[glider]: https://github.com/Modos-Labs/Glider
[pdi-12]: https://www.pervasivedisplays.com/products/12-0-e-ink-displays/
[sol-docs]: https://docs.soldered.com/inkplate/
[elecrow-epaper]: https://elecrow.com/display/e-paper-hmi-display.html

Source notes:

- `[laskakit-live]`, `[laskakit-frame]`: EUR prices read after switching the shop's currency to EUR; the CZK list price of the kit is 2,998 Kč incl. VAT.
- `[ekos-ks]`: the page refuses automated readers. Campaign state, backers and amount pledged were read from its `stats.json`, and rewards, delivery date and late-pledge flag from the data embedded in the page, both fetched with curl.
- `[ekos-site]`: the page text sits in its script bundle, where the quoted line was read.
- `[vis-components]`: the HTTP backend description; whether the device renders anything itself is not stated there.
