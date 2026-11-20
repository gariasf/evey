# ESP32-class boards with integrated e-paper for a battery kitchen terminal

Research date: **2026-11-20**. Every price and stock status below was read on that date. Buyer location assumed: Spain (EU).

## How to read this file

- Each claim ends with a source key such as `[sol-feat]`. In a rendered view the key is a link to the page; in the raw file the URLs are listed under [Sources](#sources).
- **UNVERIFIED** means I could not confirm the claim from a primary source that I loaded on 2026-11-20. "(from memory)" marks recollection that was not checked at all.
- "computed" is my arithmetic on sourced inputs. "My reading" is interpretation, not a manufacturer statement.
- Coverage limits: three delegated research passes (M5Stack/LilyGo/Elecrow, Waveshare/Good Display/Pimoroni, IT8951/epdiy/missed-candidate sweep) were cut off by a usage limit. I read the raw pages they had saved and filled the main gaps with targeted checks. The **sweep for candidates missing from the brief was not completed** (see [Not covered](#not-covered)).

## Key findings

1. Above 6", only three mono options have a published fast/partial refresh near the 0.5 s target: **TRMNL X** ("partial refresh <=200ms") [trmnl-x-shop], **Inkplate 10** (0.62 s) [sol-feat], and the **7.5" 800×480 UC8179 panel** (0.3 s per Good Display for GDEY075T7 [gd-gdey075t7], 0.4 s per Waveshare for its 7.5" V2 [ws-75]). The reTerminal E1001 uses that GDEY075T7 panel [seeed-arduino].
2. **M5Stack PaperS3 is end-of-life**: "This product is EOL (End of Life)." [m5-papers3-shop]
3. Seeed's reTerminal E line now has four models. **E1003** is new to the brief: 10.3" mono, 16 grey, touch, three buttons, buzzer [seeed-series].
4. **TRMNL X is sold out**; an order today is a preorder with stock "expected in both warehouses by mid December 2026" [trmnl-x-shop].
5. **Inkplate 6MOTION is not an ESP32 board**: the main MCU is an STM32H743 and the ESP32-C3 is only a Wi-Fi co-processor running ESP-AT [sol-6m] [sol-6m-esp]. It is also sold out [sol-6m-shop].
6. An ESP32 **can** drive IT8951 panels (10.3" included) over SPI; GxEPD2 and ESPHome both ship drivers. Details in [IT8951 on ESP32](#it8951-on-esp32).

## 1. Comparison tables

Main candidates, grouped large → medium → small. Three tables share the same row order.

### 1a. Panel, refresh, compute

| Device | Panel | Stated refresh (full / fast or partial) | Official caveats | MCU / flash / PSRAM |
|---|---|---|---|---|
| **Soldered Inkplate 10** | 9.7", 1200×825, 150 PPI, recycled ED097OC1/OC2/OC4 [sol-10-hw]; 8 grey levels (3-bit) [sol-10-modes] | 1.61 s / 0.62 s [sol-feat] | Fastest partial is 1-bit only; "Around 50 partial updates should still look good", then a full update [sol-10-partial]. ESPHome: no partial in 3-bit mode, partial "leaves burnin", `full_update_every` default 10 [esphome-inkplate]. Panel 0–50 °C [sol-10-hw] | ESP32 WROVER-E [sol-10-gpio]. Flash/PSRAM size UNVERIFIED |
| **Seeed reTerminal E1003** | 10.3", 1404×1872, 16 grey [seeed-series]; ED103TC2 + IT8951 over SPI [seeed-arduino]; ≈227 ppi (computed) | "3-Second Full Refresh" [seeed-e1003-shop]; table says 2–3 s; partial ✅ but **no partial time published** [seeed-series] | 16-grey is "the slowest refresh mode", use 1-bit "for fast UI updates" [seeed-arduino]. Seeed's GxEPD2 example always does a full GC16 refresh [seeed-gxepd2-cpp]. ESPHome verified only GC16 and DU on Seeed panels [esphome-it8951]. 0–40 °C [seeed-series] | ESP32-S3, 32 MB flash, 8 MB PSRAM [seeed-series] |
| **TRMNL X** | 10.3", 1872×1404, 227 PPI, 16 grey [trmnl-x-spec] | "Full refresh <= 1.2s, partial refresh <=200ms" [trmnl-x-shop]; spec sheet "200ms - 1.3s" [trmnl-x-spec] | None published for ghosting. 0–40 °C [trmnl-x-spec] | ESP32-S3, 16 MB flash, 8 MB PSRAM, plus ESP32-C5 as 5 GHz modem [trmnl-x-shop] |
| **Seeed reTerminal E1001** | 7.5", 800×480, 4 grey [seeed-series]; GDEY075T7 / UC8179 [seeed-arduino]; ≈124 ppi (computed) | Seeed: "2–5 s", partial ✅, no partial time [seeed-series]. Panel maker: full 3 s / fast 1.5 s / partial 0.3 s at 25 °C [gd-gdey075t7]. GxEPD2 constants: 1200 ms / 450 ms [gx-gdey075t7] | 4-grey is "roughly 4× slower than a 1-bit black-and-white update" [seeed-arduino]. GxEPD2 fast full update is for normal temperature range only [gx-gdey075t7]. 0–40 °C [seeed-series] | ESP32-S3, 32 MB flash, 8 MB PSRAM [seeed-series] |
| **Seeed reTerminal E1002** | 7.3", 800×480, E Ink Spectra 6 colour [seeed-series] | 15–20 s, partial ❌ [seeed-series]; another Seeed page says 25–40 s [seeed-arduino] | No partial refresh [seeed-series] | Same as E1001 [seeed-series] |
| **TRMNL OG** | 7.5", 800×480, 128 PPI, 4 grey [trmnl-og-spec] | "~2 seconds" [trmnl-og-spec]; "fast refresh" exists [trmnl-og-shop] | `maximum_compatibility` "turns off fast refresh" [trmnl-byos] | ESP32-C3, 400 KB RAM, 4 MB flash [trmnl-og-spec] |
| **Seeed TRMNL 7.5" (OG) DIY Kit** | 7.5", 800×480 mono [seeed-kit] | "partial refresh (0.34s) and full refresh (3.5s)" [seeed-kit] | None published | XIAO ESP32-S3 Plus [seeed-kit] |
| **Soldered Inkplate 6MOTION** | 6.0", 1024×758, 212 PPI, 16 grey [sol-6m] | 500 ms B&W, 800 ms grey / 91 ms partial [sol-6m] | Same ~50-partials advice; partial is "much faster and cleaner" in 1-bit [sol-6m-partial] | **STM32H743** (2 MB flash, 1 MB SRAM, 32 MB DRAM) + ESP32-C3 co-processor [sol-6m] |
| **Soldered Inkplate 6FLICK** | 6.0", 1024×758, 8 grey, ED060XC3 [sol-6f] | 1.26 s (3-bit) / 225 ms (1-bit) [sol-6f]; feature table 1.55 s / 0.23 s [sol-feat] | Recycled panel, cosmetic marks possible [sol-6f] | ESP32-WROVER [sol-6f] |
| **Soldered Inkplate 5V2** | 5.2", 720×1280 [sol-5v2]; ≈282 ppi (computed) | 0.99 s / 0.22 s [sol-5v2]; feature table 1.13 s / 0.26 s [sol-feat] | — | ESP32 [sol-5v2] |
| **M5Stack PaperS3** (EOL) | 4.7", 960×540, 16 grey, ET047TC1 [m5-papers3]; 235 ppi [m5-papers3-shop] | **Not stated** by M5 → UNVERIFIED | 0–40 °C [m5-papers3] | ESP32-S3R8, 16 MB flash, 8 MB PSRAM [m5-papers3] |
| **LilyGo T5 E-Paper S3 Pro** | 4.7", 960×540, 16 grey, ED047TC1 [lilygo-wiki] | Partial refresh supported from H752-01; **no times stated** [lilygo-wiki] | — | ESP32-S3-WROOM-1, 16 MB flash, 8 MB PSRAM [lilygo-wiki] |
| **Elecrow CrowPanel 5.79"** | 5.79", 272×792, B/W, SSD1683 ×2 [elecrow-579-wiki]; ≈145 ppi (computed) | "Partial refresh (saves more power)"; **no times stated** [elecrow-579-wiki] | 0–50 °C [elecrow-579-wiki] | ESP32-S3-WROOM-1-N8R8: 8 MB flash, 8 MB PSRAM [elecrow-579-wiki] |

### 1b. Power and I/O

| Device | Battery / charger / sleep / wake | RTC | Buttons, touch, sensors, buzzer | Expansion |
|---|---|---|---|---|
| **Inkplate 10** | 2-pin 2 mm JST, MCP73831 charger [sol-10-batt]; 22 µA deep sleep [sol-10]; wake by timer, WAKE button (GPIO36), RTC alarm [sol-10-sleep]; 3000 mAh only in the enclosure kit [sol-10-batt] | Yes, with battery holder [sol-10]; chip not named on pages read | WAKE button only. Touchpads exist only on older e-radionica boards [sol-touchpads]. No buzzer or sensors [sol-feat] | Free: IO26, expander 1 P1-3…P1-7, expander 2 P0-0…P1-7 (PCAL6416A) [sol-10-gpio]; easyC/Qwiic, microSD [sol-10] |
| **reTerminal E1003** | 3000 mAh built in, USB-C 5 V/1 A [seeed-series]; "~14 µA" deep sleep; EXT1 wake on KEY0 (GPIO3) and timer [seeed-lowpower] | PCF8563 at 0x51; CR1220 cell **not shipped** [seeed-lowpower] | 3 buttons (GPIO3/4/5), buzzer GPIO45, SHT4x [seeed-periph]; capacitive touch (GT911 [seeed-series]), PDM mic [seeed-e1003] | 6-pin header: 3V3, GND, GPIO47, GPIO6, I²C GPIO20/19 [seeed-e1003]; microSD [seeed-series] |
| **TRMNL X** | 6000 or 12000 mAh, USB-C via magnetic dock, TI gas gauge [trmnl-x-shop]. Sleep current UNVERIFIED (spec field reads "5h / 10h") [trmnl-x-spec] | Not listed → UNVERIFIED | Capacitive touch bar: left = previous, centre = menu, right = next [trmnl-touch]; accelerometer, temperature sensor; no buttons ("Hard reset via magnetic dock"), no status LED [trmnl-x-spec]. No buzzer listed | Pogo-pin dock with OTG 5 V output [trmnl-x-shop]. Header/Qwiic UNVERIFIED |
| **reTerminal E1001** | 2000 mAh built in [seeed-series]; "~14 µA"; EXT1 wake on KEY0 (GPIO3) and timer [seeed-lowpower] | PCF8563, CR1220 not shipped [seeed-lowpower] | 3 buttons (GPIO3/4/5), buzzer GPIO45, SHT4x [seeed-periph]; mic [seeed-e1001] | 8-pin header: 3V3, GND, GPIO46, GPIO2, GPIO17, GPIO18, I²C GPIO20/19 [seeed-e1001]; microSD [seeed-series] |
| **reTerminal E1002** | Same as E1001 [seeed-series] | Same [seeed-lowpower] | Same [seeed-periph] | 8-pin header [seeed-series] |
| **TRMNL OG** | 1800 or 2500 mAh [trmnl-og-spec]; "about 100uA on average" asleep with button wake; wake by button or timer [trmnl-fw] | Not listed | 1 button [trmnl-og-spec]; no buzzer listed | UNVERIFIED |
| **Seeed TRMNL DIY Kit** | 2000 mAh included, JST on driver board [seeed-kit] | Not stated | Driver-board family has 1 reset + 3 user buttons [seeed-drivers]; for this exact board UNVERIFIED | XIAO pins; UNVERIFIED |
| **Inkplate 6MOTION** | MCP73831, 22 µA; 1200 mAh in kit [sol-6m]; wake by WAKE button or RTC [sol-6m-sleep] | Yes [sol-6m] | 3 buttons [sol-6m-buttons], rotary encoder, APDS-9960, IMU, SHTC3, 2 RGB LEDs [sol-6m]. No buzzer listed | "30+ GPIO", easyC, microSD [sol-6m] |
| **Inkplate 6FLICK** | Charger onboard, 23 µA [sol-6f] | Yes [sol-6f] | 2-point touch, frontlight (64 steps) [sol-6f]. No buttons/buzzer listed | GPIO, I²C, SPI, easyC, microSD [sol-6f] |
| **Inkplate 5V2** | Charger onboard, 18 µA; 1200 mAh in kit [sol-5v2] | PCF85063A [sol-feat] | None listed | easyC, microSD [sol-5v2] |
| **M5Stack PaperS3** | 1800 mAh built in, LGS4056H charger; 9.28 µA low-power mode, 154.02 mA operating [m5-papers3] | BM8563, "sleep and wake-up" [m5-papers3] | 1 power button, GT911 touch, BMI270, passive buzzer [m5-papers3] | HC1.25 4-pin port: GND, 3V3, G1, G2; microSD [m5-papers3] |
| **LilyGo T5 S3 Pro** | 1500 mAh, BQ25896 + BQ27220, MagSafe + USB-C charging [lilygo-wiki]. Sleep: README shows only a meter photo reading 00.872 on the mA range (my reading: ≈0.87 mA) [lilygo-pro-gh] | PCF85063 [lilygo-wiki] | RST, BOOT, IO48, PWR buttons; GT911 touch; LoRa SX1262; GPS [lilygo-wiki]. No buzzer listed | 2× QWIIC, TF card, PCA9535 expander [lilygo-wiki] |
| **CrowPanel 5.79"** | SH1.0 2-pin socket "With the battery charging circuit" [elecrow-579-wiki]. Whether a battery is included and the sleep current are UNVERIFIED | None listed | MENU (IO2), EXIT (IO1), rotary switch up/down/press (IO6/IO4/IO5) [elecrow-579-wiki]. No buzzer listed | GPIO IO3, 9, 15, 17, 19, 21; UART; TF slot [elecrow-579-wiki] |

### 1c. Mechanics, software, price

Prices checked 2026-11-20. "Shop USD" prices exclude EU VAT and import charges unless stated.

| Device | Enclosure / size / weight / magnets | Software | Price and stock |
|---|---|---|---|
| **Inkplate 10** | Board 224.3×163×10 mm; with enclosure 240×179.5×13.5 mm [sol-10]; print-ready STL and CAD files published [sol-10-faq]; shop listing weight 402 g board, 565 g kit [sol-10-shop]. No magnets | Arduino, MicroPython [sol-10]; ESP-IDF, LVGL, ESPHome [sol-10-shop]; `image.draw(url)` handles JPG, BMP, PNG [sol-10-web]; HTTPS certificate support [sol-10-https]; ESPHome model `inkplate_10` [esphome-inkplate]. OTA UNVERIFIED | **€189.95** board + panel, "8 units in stock". **€219.95** with enclosure + battery, **sold out** [sol-10-shop]. Prices include VAT [sol-tos]; ships from Croatia [sol-10-shop] |
| **reTerminal E1003** | Metal enclosure, 224×187×18.6 mm [seeed-series]; 3D-printed stand in box [seeed-e1003]. Weight not stated. No magnets | Seeedash (default), ESPHome ≥ 2026.7.0, Arduino, TRMNL [seeed-series]; TRMNL firmware target `TRMNL_X_E1003` [trmnl-pio]. PNG from URL in Seeed's Arduino docs UNVERIFIED | Seeed **$143.91** (list $159.90), duties at checkout [seeed-e1003-shop]. Antratek (NL) **€192.39 incl. VAT**, in stock [ant-e1003] |
| **TRMNL X** | 233×193×12 mm; 365 g / 450 g; kickstand, wall mount, **embedded magnet**; IP65 pending [trmnl-x-spec] | Open-source firmware (GPLv3), OTA, own-server mode (BYOS) [trmnl-x-spec]; server returns a PNG/JPEG URL, ≤ 750,000 bytes [trmnl-byos] | **€211.95** (shop in EUR for Spain), **sold out → preorder**, restock mid-December 2026 [trmnl-x-shop]. VAT inclusion UNVERIFIED ("Sales tax and shipping calculated at checkout"). $229 list; ships from USA or Berlin; CE "Pending" [trmnl-x-spec] |
| **reTerminal E1001** | Metal enclosure, 176×120×53 mm with stand, 17 mm without [seeed-series]; STEP model published [seeed-e1001]. Weight not stated. No magnets | Seeedash, ESPHome, Arduino, TRMNL, Zephyr [seeed-series]; TRMNL firmware target `seeed_reTerminal_E1001` [trmnl-pio] | Seeed **$69.00** [seeed-e1001-shop]. Antratek **€95.59 incl. VAT**, **out of stock** [ant-e1001] |
| **reTerminal E1002** | Same case as E1001 [seeed-series] | Same; TRMNL in mono mode [seeed-series] | MSRP $99.00 [seeed-series]. Antratek **€120.94 incl. VAT**, in stock [ant-e1002] |
| **TRMNL OG** | 171×116×10 mm; 120 g / 165 g; desk stand, hook recess [trmnl-og-spec]. No magnet listed | Same firmware and BYOS; 800×480 PNG/JPEG/1-bit BMP ≤ 90,000 bytes [trmnl-byos] | **€128.95**, "In stock, ready to ship", "Free shipping in the USA and Europe" [trmnl-og-shop]. VAT inclusion UNVERIFIED. $139 list [trmnl-og-spec] |
| **Seeed TRMNL DIY Kit** | **No enclosure**; printable designs linked [seeed-kit] | TRMNL, ESPHome, Arduino [seeed-kit] | **$42.66** (list $44.90) [seeed-kit-shop]. EU price UNVERIFIED |
| **Inkplate 6MOTION** | Kit enclosure 161×116×15 mm [sol-6m] | Arduino only [sol-6m]; JPG/BMP/PNG from URL [sol-6m-web] | **€179.95** board; **both variants sold out**, restock "approximately 6 weeks" [sol-6m-shop] |
| **Inkplate 6FLICK** | 150.4×107.8×11.5 mm; 173.3×116.8×14.5 mm with case [sol-6f] | Arduino, MicroPython [sol-6f] | **€209.95** with enclosure + battery, 169 in stock; board-only sold out [sol-6f-shop] |
| **Inkplate 5V2** | Kit has case + 1200 mAh [sol-5v2] | Arduino, MicroPython [sol-5v2]; ESPHome `inkplate_5_v2` [esphome-inkplate] | **€99.95** with enclosure + battery, 32 in stock; board-only sold out [sol-5v2-shop] |
| **M5Stack PaperS3** | Cased, 121.5×67.7×7.7 mm, 89.0 g, "Back magnetic attachment" [m5-papers3] | UiFlow2, Arduino (M5Unified/M5GFX), ESP-IDF, PlatformIO; needs epdiy ≥ 2.0.0 [m5-papers3]. Not supported by ESPHome's it8951 driver [esphome-it8951] | **$59.00, EOL** [m5-papers3-shop]. EU remainders seen only in search snippets (Tinytronics €56.75 "Discontinued"; DigiKey FR 60.62 € incl. VAT, 0 in stock) → UNVERIFIED |
| **LilyGo T5 S3 Pro** | 129×69×11 mm, 2× M4 holes [lilygo-wiki]; shell drawings in repo [lilygo-pro-gh]. MagSafe is for charging; fridge-holding force UNVERIFIED | Arduino / PlatformIO examples incl. LVGL [lilygo-wiki]; FastEPD [lilygo-pro-gh]; TRMNL target `TRMNL_X_LILYGO_T5PRO` [trmnl-pio] | **$81.36** (no GPS) / **$84.21** (GPS) from China; Germany warehouse variant $88.71 **unavailable** [lilygo-pro-shop]. Lite (no LoRa/GPS) **$71.31** [lilygo-lite-shop]. EU reseller price UNVERIFIED |
| **CrowPanel 5.79"** | "white acrylic shell" [elecrow-579-shop]. Dimensions, weight UNVERIFIED | Arduino, ESP-IDF, MicroPython [elecrow-579-wiki] | **$31.90**, "In stock" [elecrow-579-shop]. EU distributor UNVERIFIED |

### 1d. Other candidates, short form

| Candidate | Facts | Verdict |
|---|---|---|
| Soldered Inkplate 6 | 6", 800×600, 8 grey, 1.26 s / 0.26 s, ESP32-WROVER, 25 µA, PCF85063A [sol-6]. €109.95 board, 1 in stock; kit sold out [sol-6-shop] | Usable; lower resolution than 6FLICK |
| Soldered Inkplate 4TEMPERA | 3.8", 600×600, touch, frontlight, buzzer, APDS-9960, 1200 mAh, case included [sol-4t]; 0.86 s / 0.18 s [sol-feat]. €159.95 with glass panel, 85 in stock [sol-4t-shop] | Below the 4.7" floor |
| Soldered Inkplate 13SPECTRA | 13.3", 1600×1200, 6 colours, no partial, "~19s", ESP32-S3 [sol-feat]. €279.95, sold out [sol-13-shop]. Newest Inkplate per Soldered docs [sol-10] | Drop: colour, slow |
| Inkplate 6PLUS, 5 (v1), 6COLOR | Appear in a feature table that covers "some retired" models [sol-feat]; 6PLUS and 5 are absent from the docs model list [sol-10] | Treat as retired (my reading) |
| Seeed reTerminal E1004 | 13.3" Spectra 6, 1200×1600, no partial, ~20 s, 5000 mAh, $279.90 [seeed-series] | Drop: colour, slow |
| Seeed XIAO 7.5" ePaper Panel | XIAO ESP32-C3, 800×480, 2000 mAh, PLA case with stand, 178×131×19 mm, 218 g; only Boot/Reset buttons [seeed-xiao75]. $67.50 [seeed-xiao75-shop] | Weak: no user buttons |
| Seeed EE03 + 10.3" panel | XIAO ESP32-S3 Plus, T-CON, JST battery connector, charging IC, 3 user buttons [seeed-ee03]. $32.90 [seeed-ee03-shop] + panel $76.50 [seeed-103panel-shop] | DIY route to E1003-class display; no case |
| Waveshare 7.5" e-Paper (V2) + e-Paper ESP32 Driver Board | 800×480, 4 grey; full 4 s, fast 1.5 s, partial 0.4 s, 4-grey 2.1 s; 170.2×111.2 mm; $56.99 [ws-75]. Driver board $14.99 [ws-esp32]; no battery or charger mentioned on its page | DIY; add charger, RTC, case |
| Good Display ESP32-M075 + GDEY075T7 | 7.5" board with "battery connector with charging circuit", optional 4000 mAh [gd-m075]; panel 3 s / 1.5 s / 0.3 s [gd-gdey075t7]; ESL-style enclosure exists [gd-enclosure]. Prices UNVERIFIED | DIY; price unknown |
| Waveshare 10.3" / 13.3" IT8951 HAT | 1872×1404, $202.99, "about 0.3s for partial refresh" [ws-103]; 13.3" 1600×1200, $407.99 [ws-133] | Works with ESP32 via GxEPD2 (10.3"); costly, no battery circuit |
| Waveshare ESP32 boards with built-in e-paper | Repos exist for ESP32-S3-ePaper-1.54, -1.54G, -3.97, ESP32-C6-ePaper-1.54, ESP32-S3-LR1121-ePaper-2.9, ESP32-S3-PhotoPainter (7.3" colour), ESP32-S3-ePaper-13.3E6 (colour) [ws-github]. Specs and prices UNVERIFIED | No mono board ≥ 4.7" found |
| LilyGo T5 4.7" S3 ("T5 e-Paper") | ESP32-S3-WROOM-1-N16R8, 540×960, GT911 touch, PCF8563, JST-GH battery connector, buttons RST/IO0/IO21, 121×67×12 mm [lilygo-wiki]. $38.99–$39.99 from China; Germany variant unavailable [lilygo-t5-shop]. Charger, sleep current, refresh times UNVERIFIED | Cheap 4.7"; unproven speed |
| Larger LilyGo e-paper | None above 4.7" in the lilygo.cc search results saved today | None found; not exhaustive |
| Elecrow CrowPanel 4.2" / 2.13" | 4.2": 400×300, SSD1683, same MCU and inputs as 5.79", 12 free GPIO, white acrylic case [elecrow-42-wiki] [elecrow-42-shop]. $26.90 in stock [elecrow-42-shop]; 2.13" $11.90 [elecrow-213-shop] | Below the size floor. No CrowPanel e-paper ≥ 7.5" found |
| M5Paper V1.1 | $85.00, flagged unavailable in M5's shop search; older M5Paper and COMM Edition are titled "[EOL]" [m5-paper11-shop]. IT8951-based, supported by ESPHome [esphome-it8951] | Do not plan around it |
| M5Stack PaperMono (C153) | 3.97", 480×800, 4 grey, touch, frontlight, ESP32-S3R8, 1150 mAh, buzzer, RTC, 2 user buttons. M5GFX times: quality 4.71 s, text 0.45 s, fast 0.34 s, fastest 0.07 s. "After approximately 10 partial fast refreshes" do a full one [m5-papermono]. $65.00, Lite $55.00 [m5-papermono-shop] [m5-papermono-lite-shop] | New, well equipped, but below the size floor |
| Pimoroni Inky Frame 4.0" / 5.7" / 7.3" | Raspberry Pi Pico W / Pico 2 W, colour panels, five buttons, PCF85063A RTC, button and RTC wake [pim-docs]. £58.25 / £66.50 / £78.75 [pim-40] [pim-57] [pim-73]. Refresh time UNVERIFIED | Drop: colour only, not ESP32 |

## IT8951 on ESP32

**Yes, over SPI.** Evidence:

- **GxEPD2** lists IT8951 panels "on Waveshare e-Paper IT8951 Driver HAT": 6" ED060SCT and ED060KC1, 7.8" ED078KC2, 10.3" ES103TC1 [gx-readme]. The 10.3" class sets `full_refresh_time = 850` ms, `partial_refresh_time = 300` ms, `hasFastPartialUpdate = true` [gx-it103]; the 7.8" class 650 / 300 ms [gx-it78]. SPI runs at "24MHz for write, 10MHz for read", and "the IT8951 Driver HAT is panel specific" [gx-readme]. No 13.3" IT8951 panel is in that README list.
- **Seeed's E1003** is exactly this architecture in a product: ESP32-S3 + IT8951 + ED103TC2, 10 MHz SPI in Seeed's example, 1-bit framebuffer of 328,536 bytes in PSRAM [seeed-arduino] [seeed-gxepd2-h]. Seeed had to write its own driver class because upstream is "tuned for the Waveshare ES103TC1" [seeed-gxepd2-h].
- **ESPHome `it8951`** offers a generic `IT8951` model plus `m5stack-m5paper`, `Seeed-reTerminal-E1003`, `Seeed-EE03`. With `grayscale: false` it uses fast DU partial updates between full cleans, forced full refresh every 30 updates by default [esphome-it8951].
- **Good Display DEJA-TC103** is an IT8951 TCON board for 10.3" and 13.3" panels with "ESP32/Arduino example code" [gd-tc103].
- **Speed estimate (computed, not a vendor figure):** a full 1-bit frame is 328,536 bytes, about 0.26 s at 10 MHz or 0.11 s at 24 MHz before protocol overhead, plus the waveform time. A 4-bit frame is four times that. Full-screen 1-bit updates around 0.4–0.6 s look feasible; small regions are faster.
- **Alternatives without IT8951:** GxEPD2 also drives large SPI panels with fast partial update: GDEM102T91 10.2" 960×640 (5500 / 800 ms) [gx-gdem102], GDEM1085T51 10.85" 1360×480 (3500 / 700 ms) [gx-gdem1085], GDEH116T91 11.6" 960×640 (6200 / 700 ms) [gx-gdeh116], GDEM133T91 13.3" 960×680 (4500 / 600 ms) [gx-gdem133]. All are low resolution for their size.
- **Parallel drive (epdiy / FastEPD):** FastEPD supports "the EPDiy V7 PCB, M5Stack PaperS3, LilyGo T5 S3 4.7 Pro, Inkplate 6PLUS, Inkplate 5 gen 2, and Inkplate 10" [fastepd]. TRMNL X is driven this way (`PARALLEL_EPD` with FastEPD) [trmnl-pio]. Whether an assembled epdiy v7 board can be bought, and its panel list, are UNVERIFIED.

## 2. Ranked recommendation by size class

Test applied: a published fast or partial refresh of roughly 0.5 s or better in 1-bit mode, plus the practical fit to a battery, button-driven terminal.

One caveat applies to every device (my reading): a design that deep-sleeps between presses cannot feel snappy. TRMNL measures a full wake → Wi-Fi → fetch → draw cycle at about 10.5 s [trmnl-fw]. A cooking session needs a stay-awake mode with Wi-Fi associated, prefetched next/previous frames and 1-bit partial updates. All three top picks allow custom firmware.

### Small (≤ 6")

1. **Inkplate 6MOTION** — fastest by a wide margin (91 ms partial) and the only board that already carries three buttons, a rotary encoder and an APDS-9960 [sol-6m]. Against it: STM32 main MCU with Arduino-only support, no buzzer listed, sold out for about six weeks [sol-6m-shop].
2. **Inkplate 6FLICK kit** — 225 ms in 1-bit, ESP32, case and battery, in stock at €209.95 [sol-6f] [sol-6f-shop]. Touch and frontlight instead of buttons; buttons and buzzer must be added.
3. **Inkplate 5V2 kit** — 0.22–0.26 s partial, case and battery, €99.95 in stock [sol-5v2] [sol-feat] [sol-5v2-shop]. Cheapest complete device that meets the speed target; smallest screen.

Not recommended: **PaperS3** (EOL, no published refresh times, although magnet, buzzer and RTC fit the brief well), **LilyGo T5 S3 Pro** (no published times; you pay for LoRa and GPS; EU warehouse empty), **CrowPanel 5.79"** (best input set per dollar, but a 272-pixel-high strip with no RTC, no buzzer and no published times).

### Medium (7–8")

1. **Seeed reTerminal E1001** — the only medium device with three buttons, buzzer, RTC, battery, charger and case in one unit, on an ESP32-S3 with 8 MB PSRAM [seeed-series] [seeed-periph]. Its panel is rated 0.3 s partial by the maker [gd-gdey075t7] and 450 ms in GxEPD2 [gx-gdey075t7]. Caveats: Seeed itself only quotes "2–5 s"; about 124 ppi; no magnets; Antratek was out of stock.
2. **Seeed TRMNL 7.5" (OG) DIY Kit** — Seeed states 0.34 s partial for this panel; ESP32-S3; battery included; $42.66 [seeed-kit] [seeed-kit-shop]. You print the case, so magnets and button cut-outs are yours to design. No buzzer or RTC stated.
3. **TRMNL OG** — finished, in stock, €128.95 [trmnl-og-shop]. One button, ESP32-C3 with 400 KB RAM, "~2 seconds" refresh [trmnl-og-spec]. Fine as a dashboard, thin for interaction.

Not usable for interactive UI: **reTerminal E1002** (colour, no partial, 15–20 s) [seeed-series]; **Pimoroni Inky Frame 7.3"** (colour, not ESP32).

### Large (9.7"+)

1. **TRMNL X** — fastest published figures (≤ 200 ms partial, ≤ 1.2 s full), 227 PPI, 6000 mAh, **embedded magnet mount**, and a firmware model that already fetches a server-rendered PNG; left and right taps mean previous and next [trmnl-x-shop] [trmnl-x-spec] [trmnl-touch]. Against it: capacitive touch bar instead of buttons, no buzzer or RTC listed, preorder until mid-December 2026, CE shown as pending on a January 2026 spec sheet.
2. **Soldered Inkplate 10** — published 0.62 s fast refresh, ESP32, 22 µA sleep, RTC, EU stock with VAT included, open hardware with enclosure files [sol-feat] [sol-10] [sol-10-faq]. Against it: buttons and buzzer must be added, 150 PPI, recycled panel, slightly over the 0.5 s target, enclosure kit sold out.
3. **Seeed reTerminal E1003** — best equipped out of the box and in EU stock at €192.39 incl. VAT [ant-e1003]. Against it: Seeed publishes only a 3 s full refresh and no partial time, and its own GxEPD2 example never does a fast partial update [seeed-gxepd2-cpp]. Fast DU updates exist in ESPHome's driver [esphome-it8951]. Treat speed as unproven until measured.

Not usable: **Inkplate 13SPECTRA** and **reTerminal E1004** (colour, about 19–20 s, no partial).

## 3. Add-ons for the top two (reTerminal E1001, Inkplate 10)

### reTerminal E1001

- **Already on board:** three active-low buttons on GPIO3 (right, green), GPIO4 (middle), GPIO5 (left), and a buzzer on GPIO45 driven with `tone()` in Seeed's examples [seeed-periph]. Next, back and one timer key need no hardware.
- **Free pins:** header J2 exposes 3V3, GND, GPIO46, GPIO2 (ADC), GPIO17, GPIO18 and I²C on GPIO20 (SCL) / GPIO19 (SDA) [seeed-e1001].
- **Extra buttons:** up to four on GPIO2, 17, 18, 46. Only GPIO0–21 can wake the ESP32-S3 from deep sleep [seeed-lowpower], so GPIO46 cannot. GPIO46 is also a boot strapping pin: UNVERIFIED (from memory); check before wiring a button to it.
- **Rotary encoder:** A/B on GPIO17/18 and the push switch on GPIO2, or an I²C encoder breakout on the header's I²C pins (my reading).
- **APDS-9960:** I²C on GPIO19/20 with 3V3 and GND from the header, interrupt to GPIO2. The bus already carries the SHT4x and the PCF8563 at 0x51 [seeed-periph] [seeed-lowpower]. The sensor's address (0x39) is UNVERIFIED (from memory).
- **RTC:** fit a CR1220 cell; it is not shipped [seeed-lowpower].
- **Mounting:** no magnets. The back cover is held by four screws [seeed-lowpower] and a STEP model of the enclosure is published [seeed-e1001], so a printed back-pack with magnets and the extra controls is practical (my suggestion).

### Inkplate 10

- **Free pins:** one native GPIO (IO26) plus expander 1 P1-3…P1-7 and all sixteen pins of expander 2 [sol-10-gpio]; an easyC/Qwiic I²C connector [sol-10]; WAKE button on GPIO36 [sol-10-sleep].
- **4–5 buttons:** wire them to expander pins. Jumper JP4 "enables the interrupt pin on the PCAL6416A" [sol-10-jumpers], and the pin table ties JP4 to IO34, an RTC-capable input [sol-10-gpio]. That should let any expander button wake the board (my reading; no worked example in the docs, so UNVERIFIED in practice). The Arduino function names for expander pins are UNVERIFIED.
- **Rotary encoder:** only one native pin is free, so use an I²C/Qwiic encoder breakout on the easyC connector (my reading).
- **Piezo buzzer:** a passive piezo on IO26 with PWM, or an active buzzer switched from an expander pin.
- **APDS-9960:** a Qwiic/easyC breakout on the I²C connector with its interrupt on an expander pin. Soldered documents this sensor for the 6MOTION and 4TEMPERA where it is built in [sol-6m] [sol-4t]; library support on Inkplate 10 is UNVERIFIED.
- **Enclosure and magnets:** print-ready STL files and editable CAD sources are in the hardware repo [sol-10-faq]; add button cut-outs and magnet pockets there.
- **Battery:** 2-pin 2 mm JST. Check polarity first: "Battery polarity can vary!" [sol-10-batt].

### Battery capacity versus runtime (estimate)

Scenario: 50 wakes per day and one 2-hour active session per week. These are my estimates from the inputs below, not vendor figures.

Inputs:

- Sleep: about 14 µA (E1001) [seeed-lowpower], 22 µA (Inkplate 10) [sol-10]. That is 0.3–0.5 mAh per day (computed).
- One wake with Wi-Fi fetch and redraw: 0.186 mAh, measured by TRMNL on its ESP32-C3 device [trmnl-fw]. For ESP32/ESP32-S3 boards with larger panels I assume 0.19–0.40 mAh.
- Active session: no published average for either board. M5 quotes 154 mA for a running ESP32-S3 e-paper device [m5-papers3], which I use as the always-on upper bound; with Wi-Fi power save between presses I assume 5–30 mA.

| Case | Per wake | Session average | Daily use (computed) |
|---|---|---|---|
| A, efficient | 0.19 mAh | 5 mA | ≈ 11 mAh |
| B, typical | 0.30 mAh | 30 mA | ≈ 24 mAh |
| C, pessimistic | 0.40 mAh | 150 mA | ≈ 63 mAh |

Days per charge at 80 % usable capacity (computed, self-discharge ignored):

| Battery | Case A | Case B | Case C |
|---|---|---|---|
| 1200 mAh | 84 | 40 | 15 |
| 2000 mAh (E1001) | 140 | 66 | 25 |
| 3000 mAh (Inkplate 10 kit, E1003) | 210 | 100 | 38 |
| 6000 mAh (TRMNL X) | 420 | 199 | 76 |

Takeaways:

- The 50 daily wakes dominate (about 10–20 mAh per day); sleep current barely matters at these levels.
- Skipping the download when the frame is unchanged cuts the per-wake cost. TRMNL's firmware does this by reusing a cached file when the server repeats the filename [trmnl-byos].
- Vendor claims suggest stock firmware is far less frugal than this model. Seeed quotes 3 months on 2000 mAh at a 6-hour interval for the E1001 [seeed-e1001-shop], which works out to roughly 22 mAh per day for four refreshes (computed). Treat my table as optimistic until measured on the real device.

## Surprises and contradictions

1. **PaperS3 is EOL** on M5Stack's own shop [m5-papers3-shop], and ESPHome's docs call it "Newer (but EOL)" [esphome-it8951]. M5's newer e-paper device is the 3.97" PaperMono [m5-papermono].
2. **Seeed added the E1003 and E1004.** The E1003 drives its panel through an IT8951 T-CON over SPI, not a parallel bus [seeed-arduino].
3. **Seeed understates the E1001.** Its table says "2–5 s" [seeed-series] while the panel maker rates partial refresh at 0.3 s [gd-gdey075t7].
4. **Seeed's own E1003 example cannot do a fast update**: every `refresh()` path calls the full GC16 routine and `hasFastPartialUpdate` is false [seeed-gxepd2-h] [seeed-gxepd2-cpp].
5. **TRMNL X has no physical buttons** and is preorder-only until mid-December [trmnl-x-spec] [trmnl-x-shop]. It is, however, the only large candidate with a built-in magnet mount.
6. **Inkplate 6MOTION is an STM32 board**, which rules out ESPHome and MicroPython [sol-6m].
7. **Current Inkplates have no touchpads.** Soldered removed them at the rebrand; only old e-radionica boards have three [sol-touchpads]. Inkplate 10 therefore has a single WAKE button.
8. **Soldered stock is thin**: Inkplate 10 enclosure kit, both 6MOTION variants and the 13SPECTRA were sold out; Inkplate 10 board had 8 units [sol-10-shop] [sol-6m-shop] [sol-13-shop].
9. **Waveshare's 7.5" V2 partial and fast modes depend on purchase date**: "For versions sold after September 2023, use the 7.5V2 program" [ws-75-wiki]. The same page warns that partial-only refreshing causes damage "which cannot be repaired" and recommends a refresh interval of "at least 180s", which conflicts with an interactive UI.
10. **Elecrow's range stops at 5.79"**; the store's e-paper category listed three sizes (2.13", 4.2", 5.79") [elecrow-579-shop] [elecrow-42-shop] [elecrow-213-shop].
11. **Pimoroni Inky Frame is colour-only** and uses a Pico, so it misses two core requirements [pim-docs].
12. **LilyGo's "sleep" figure is a photo** of a meter showing about 0.87 mA [lilygo-pro-gh], two orders of magnitude above the Seeed, Soldered and M5 figures.
13. **Soldered contradicts itself** on two refresh figures: 6FLICK full refresh 1.26 s vs 1.55 s, 5V2 0.99 / 0.22 s vs 1.13 / 0.26 s [sol-6f] [sol-5v2] [sol-feat]. Seeed does the same for colour panels (15–20 s vs 25–40 s) [seeed-series] [seeed-arduino].
14. **TRMNL's thin-client firmware already runs on rival hardware**: build targets exist for reTerminal E1001/E1002/E1003/E1004, PaperS3, LilyGo T5 Pro and CrowPanel 4.2" [trmnl-pio].

## UNVERIFIED claims

- Inkplate 10: flash and PSRAM size; RTC chip part number; OTA support; expander-interrupt wake in practice; expander pin function names; APDS-9960 library support.
- reTerminal E1003: any partial or DU refresh time; weight; drawing a PNG from a URL with Seeed's Arduino libraries.
- reTerminal E1001: a Seeed-published partial refresh time (the 0.3 s and 450 ms figures are for the panel, not the device); weight; whether GPIO46 is safe for a button.
- TRMNL X and OG: whether the EUR shop price includes VAT; X sleep current, RTC, buzzer, expansion header or Qwiic port; current CE status.
- M5Stack PaperS3: refresh times; any in-stock EU price (search snippets only).
- LilyGo T5 S3 Pro: refresh times; deep-sleep current in numbers; EU reseller price; whether the magnet holds the device on a fridge. T5 4.7" S3: charger, sleep current, refresh times.
- Elecrow CrowPanel: refresh times, sleep current, whether a battery is included, dimensions, weight, EU distributor, status of the 1.54", 2.9" and 3.7" models.
- Seeed TRMNL DIY Kit: buttons on the bundled driver board; EU price.
- Waveshare: battery or charger on the e-Paper ESP32 Driver Board; specs and prices of the ESP32-S3-ePaper boards. Good Display: all prices.
- Pimoroni Inky Frame: refresh time; real stock status (the shop API flag read false for all three).
- epdiy v7: availability of an assembled board, supported large panels, battery and RTC.
- E Ink waveform timings for IT8951 modes (DU 260 ms, A2 120 ms, GC16 450 ms) and Waveshare's "<1s" full refresh for its IT8951 HATs come from a parallel research note citing Waveshare documents; I did not re-read those documents.
- APDS-9960 I²C address 0x39 and its standby current (from memory).
- The battery table is an estimate, not a measurement.

## Not covered

- **Sweep for missed candidates was not done.** Not checked: LaskaKit ESPink, DFRobot, Adafruit, Heltec, Crowd Supply and Kickstarter projects.
- Leads seen in primary sources but not researched: Seeed "Sticky: 3.97'' Monochrome ePaper Display" [seeed-e1003-shop]; Seeed "OpenDisplay 4.26" & 7.3" DIY Kit" [seeed-matrix]; TRMNL firmware targets `xteink_x4`, `xteink_x3`, `zectrix_note4`, and `trmnl_gen2` on an ESP32-C5 board [trmnl-pio].
- Pages that failed to load: soldered.com collection JSON (HTTP 429); eu.robotshop.com (403); shop.trmnl.com shipping policy (404); Seeed EE05 product page (429, not retried); RS and buyepaper.com (Cloudflare challenge in saved copies). EU reseller pages for PaperS3 and LilyGo were seen only as search snippets.

## Sources

All loaded 2026-11-20. Some were read from raw copies saved earlier the same day.

[sol-feat]: https://docs.soldered.com/inkplate/features/
[sol-10]: https://docs.soldered.com/inkplate/10/overview/
[sol-10-partial]: https://docs.soldered.com/inkplate/10/basics/partial-update/
[sol-10-modes]: https://docs.soldered.com/inkplate/10/basics/basic-display-modes/
[sol-10-gpio]: https://docs.soldered.com/inkplate/10/hardware/free-gpio/
[sol-10-batt]: https://docs.soldered.com/inkplate/10/hardware/battery/
[sol-10-sleep]: https://docs.soldered.com/inkplate/10/low-power/deep-sleep/
[sol-10-hw]: https://docs.soldered.com/inkplate/10/hardware/design/
[sol-10-jumpers]: https://docs.soldered.com/inkplate/10/hardware/jumpers/
[sol-10-web]: https://docs.soldered.com/inkplate/10/wifi/image-from-web/
[sol-10-https]: https://docs.soldered.com/inkplate/10/wifi/https_certificate/
[sol-10-faq]: https://docs.soldered.com/inkplate/10/faq-troubleshooting/
[sol-touchpads]: https://docs.soldered.com/inkplate/touchpads/overview/
[sol-10-shop]: https://soldered.com/products/inkplate-10
[sol-tos]: https://soldered.com/policies/terms-of-service
[sol-6m]: https://docs.soldered.com/inkplate/6motion/overview/
[sol-6m-partial]: https://docs.soldered.com/inkplate/6motion/basics/partial-update/
[sol-6m-esp]: https://docs.soldered.com/inkplate/6motion/hardware/esp32/
[sol-6m-sleep]: https://docs.soldered.com/inkplate/6motion/low-power/deep-sleep/
[sol-6m-buttons]: https://docs.soldered.com/inkplate/6motion/peripherals/buttons/
[sol-6m-web]: https://docs.soldered.com/inkplate/6motion/wifi/image-from-web/
[sol-6m-shop]: https://soldered.com/products/inkplate-6-motion
[sol-6f]: https://docs.soldered.com/inkplate/6flick/overview/
[sol-6f-shop]: https://soldered.com/products/inkplate-6flick
[sol-6]: https://docs.soldered.com/inkplate/6/overview/
[sol-6-shop]: https://soldered.com/products/inkplate-6
[sol-5v2]: https://docs.soldered.com/inkplate/5v2/overview/
[sol-5v2-shop]: https://soldered.com/products/inkplate-5-gen2
[sol-4t]: https://docs.soldered.com/inkplate/4tempera/overview/
[sol-4t-shop]: https://soldered.com/products/inkplate-4-tempera
[sol-13-shop]: https://soldered.com/products/inkplate-13spectra
[esphome-inkplate]: https://esphome.io/components/display/inkplate/
[esphome-it8951]: https://esphome.io/components/display/it8951/
[seeed-series]: https://wiki.seeedstudio.com/reterminal_e10xx_main_page/
[seeed-matrix]: https://wiki.seeedstudio.com/seeed_epaper_displays/
[seeed-e1001]: https://wiki.seeedstudio.com/getting_started_with_reterminal_e1001/
[seeed-e1003]: https://wiki.seeedstudio.com/getting_started_with_reterminal_e1003/
[seeed-arduino]: https://wiki.seeedstudio.com/reterminal_e10xx_with_arduino/
[seeed-periph]: https://wiki.seeedstudio.com/reterminal_e10xx_with_arduino_peripherals/
[seeed-lowpower]: https://wiki.seeedstudio.com/reterminal_e10xx_with_arduino_peripherals_2/
[seeed-e1001-shop]: https://www.seeedstudio.com/reTerminal-E1001-p-6534.html
[seeed-e1003-shop]: https://www.seeedstudio.com/reTerminal-E1003-p-6731.html
[seeed-gxepd2-h]: https://github.com/Seeed-Projects/Seeed_GxEPD2/blob/HEAD/examples/GxEPD2_reTerminal_E1003/GxEPD2_ED103TC2_1872x1404.h
[seeed-gxepd2-cpp]: https://github.com/Seeed-Projects/Seeed_GxEPD2/blob/HEAD/examples/GxEPD2_reTerminal_E1003/GxEPD2_ED103TC2_1872x1404.cpp
[seeed-drivers]: https://wiki.seeedstudio.com/xiao_epaper_display_board_overview/
[seeed-ee03]: https://wiki.seeedstudio.com/getting_started_with_ee03/
[seeed-ee03-shop]: https://www.seeedstudio.com/XIAO-ePaper-Display-Board-ESP32-S3-EE03-p-6638.html
[seeed-103panel-shop]: https://www.seeedstudio.com/10-3inch-Monochrome-eInk-ePaper-Display-with-1404x1872-Pixels-p-6568.html
[seeed-xiao75]: https://wiki.seeedstudio.com/xiao_075inch_epaper_panel/
[seeed-xiao75-shop]: https://www.seeedstudio.com/XIAO-7-5-ePaper-Panel-p-6416.html
[seeed-kit]: https://wiki.seeedstudio.com/trmnl_7inch5_diy_kit_main_page/
[seeed-kit-shop]: https://www.seeedstudio.com/TRMNL-7-5-Inch-OG-DIY-Kit-p-6481.html
[ant-e1001]: https://www.antratek.com/reterminal-e1001-monochrome-epaper-display
[ant-e1002]: https://www.antratek.com/reterminal-e1002-full-color-epaper-display
[ant-e1003]: https://www.antratek.com/reterminal-e1003-monochrome-epaper-display
[trmnl-x-spec]: https://trmnl.com/products/x/spec-sheet
[trmnl-og-spec]: https://trmnl.com/products/og/spec-sheet
[trmnl-x-shop]: https://shop.trmnl.com/products/trmnl-x
[trmnl-og-shop]: https://shop.trmnl.com/products/trmnl
[trmnl-byos]: https://docs.trmnl.com/go/diy/byos
[trmnl-fw]: https://github.com/usetrmnl/trmnl-firmware
[trmnl-pio]: https://github.com/usetrmnl/trmnl-firmware/blob/HEAD/platformio.ini
[trmnl-touch]: https://github.com/usetrmnl/trmnl-firmware/blob/HEAD/src/touchbar_actions.cpp
[m5-papers3]: https://docs.m5stack.com/en/core/PaperS3
[m5-papers3-shop]: https://shop.m5stack.com/products/m5papers3-esp32s3-development-kit
[m5-papermono]: https://docs.m5stack.com/en/products/sku/C153
[m5-papermono-shop]: https://shop.m5stack.com/products/m5papermono-with-lora-nfc-800x480-3-97-eink-display
[m5-papermono-lite-shop]: https://shop.m5stack.com/products/papermono-lite-dev-kit-800x480-3-97-e-ink-display
[m5-paper11-shop]: https://shop.m5stack.com/products/m5paper-esp32-development-kit-v1-1-960x540-4-7-eink-display-235-ppi
[lilygo-wiki]: https://wiki.lilygo.cc/
[lilygo-pro-gh]: https://github.com/Xinyuan-LilyGO/T5S3-4.7-e-paper-PRO
[lilygo-pro-shop]: https://lilygo.cc/products/t5-e-paper-s3-pro
[lilygo-lite-shop]: https://lilygo.cc/products/t5-e-paper-s3-pro-lite
[lilygo-t5-shop]: https://lilygo.cc/products/t5-4-7-inch-e-paper-v2-3
[elecrow-579-wiki]: https://wiki.elecrow.com/CrowPanel_ESP32_E-paper_5.79-inch_HMI_Display.html
[elecrow-42-wiki]: https://wiki.elecrow.com/CrowPanel_ESP32_E-paper_4.2-inch_HMI_Display.html
[elecrow-579-shop]: https://www.elecrow.com/crowpanel-esp32-5-79-e-paper-hmi-display-with-272-792-resolution-black-white-color-driven-by-spi-interface.html
[elecrow-42-shop]: https://www.elecrow.com/crowpanel-esp32-4-2-e-paper-hmi-display-with-400-300-resolution-black-white-color-driven-by-spi-interface.html
[elecrow-213-shop]: https://www.elecrow.com/crowpanel-esp32-2-13-e-paper-hmi-display-with-122-250-resolution-black-white-color-driven-by-spi-interface.html
[ws-75]: https://www.waveshare.com/7.5inch-e-paper-hat.htm
[ws-75-wiki]: https://www.waveshare.com/wiki/7.5inch_e-Paper_HAT_Manual
[ws-esp32]: https://www.waveshare.com/e-paper-esp32-driver-board.htm
[ws-103]: https://www.waveshare.com/10.3inch-e-paper-hat.htm
[ws-133]: https://www.waveshare.com/13.3inch-e-paper-hat.htm
[ws-github]: https://github.com/waveshareteam
[gd-gdey075t7]: https://www.good-display.com/product/396.html
[gd-m075]: https://www.good-display.com/product/764.html
[gd-tc103]: https://www.good-display.com/product/472.html
[gd-enclosure]: https://www.good-display.com/product/353.html
[gx-readme]: https://github.com/ZinggJM/GxEPD2
[gx-gdey075t7]: https://github.com/ZinggJM/GxEPD2/blob/master/src/gdey/GxEPD2_750_GDEY075T7.h
[gx-it103]: https://github.com/ZinggJM/GxEPD2/blob/master/src/it8951/GxEPD2_it103_1872x1404.h
[gx-it78]: https://github.com/ZinggJM/GxEPD2/blob/master/src/it8951/GxEPD2_it78_1872x1404.h
[gx-gdem102]: https://github.com/ZinggJM/GxEPD2/blob/master/src/gdem/GxEPD2_1020_GDEM102T91.h
[gx-gdem1085]: https://github.com/ZinggJM/GxEPD2/blob/master/src/gdem/GxEPD2_1085_GDEM1085T51.h
[gx-gdeh116]: https://github.com/ZinggJM/GxEPD2/blob/master/src/epd/GxEPD2_1160_T91.h
[gx-gdem133]: https://github.com/ZinggJM/GxEPD2/blob/master/src/gdem/GxEPD2_1330_GDEM133T91.h
[fastepd]: https://github.com/bitbank2/FastEPD
[pim-docs]: https://github.com/pimoroni/inky-frame
[pim-73]: https://shop.pimoroni.com/products/inky-frame-7-3
[pim-57]: https://shop.pimoroni.com/products/inky-frame-5-7
[pim-40]: https://shop.pimoroni.com/products/inky-frame-4

Source notes:

- `[lilygo-wiki]`: facts come from the wiki pages titled "T5-4.7 E-Paper S3 Pro" and "T5-4.7-S3"; the saved copies did not record the exact page URLs.
- `[m5-papermono]`: URL inferred from M5's SKU URL pattern; the saved copy did not record its URL.
- `[gd-m075]`, `[gd-enclosure]`: product numbers taken from saved file names (two others, 396 and 472, were confirmed against independent references).
- `[gx-gdem1085]`, `[gx-gdeh116]`, `[gx-it78]`: folder paths assumed by analogy with the three paths confirmed in the repository tree.
- `[pim-docs]`: exact file path of the `inky_frame` module documentation not recorded.
- LilyGo, M5Stack and Pimoroni prices were read from each shop's own search API responses, not from rendered product pages (except PaperS3, whose product page was loaded).
- Soldered prices were cross-checked against the shop's product JSON (`https://soldered.com/products/inkplate-10.js`).
