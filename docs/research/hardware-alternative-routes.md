# Hardware alternatives to the ESP32 e-paper board: four routes compared

Checked 2026-11-20. Prices were read on that date unless a page-data date is given.

**In short.** None of the four routes beats an ESP32 e-paper board on the whole brief (always visible, long battery life, lives on a fridge door). A repurposed Kobo wins on kitchen-proofing with no fabrication. An Android e-ink reader with a kiosk browser wins on time to a working device. A Raspberry Pi with a large panel only makes sense on mains power. Reflective LCD does not fit this product.

**How sources are marked**

- A plain link means I loaded that page (or its raw file) and read the fact there.
- "(search excerpt)" means the fact comes from a search engine's excerpt of the named page, because the page itself would not load. These are weaker and are repeated in the UNVERIFIED list when they carry weight.
- **UNVERIFIED** means not confirmed from a primary source.
- "(derived)" means my arithmetic from cited numbers.

**Depth is uneven.** Route 1 was researched in full. Routes 2 to 4 were finished with a small number of targeted checks, so more of their claims are marked UNVERIFIED.

## 1. Decision table

| Criterion | Route 1: Raspberry Pi + IT8951 e-paper | Route 2: repurposed e-reader | Route 3: Android e-ink + kiosk browser | Route 4: reflective LCD | ESP32 e-paper board (baseline) |
|---|---|---|---|---|---|
| Cost | About €250–265 for panel and Pi (10.3" panel €229–244, Pi Zero 2 W about €19), before battery, SD card and enclosure | €160–210 asking for a used Kobo Libra 2; €239.99 for a new Libra Colour | About €280: Boox Go 7 €269.99 (search excerpt) plus kiosk licence €8.90 plus tax | $25–27 for a 4.2" module board (search excerpt); €250–370 for a Hannspree Lumo tablet (search excerpt); Daylight DC-1 price not confirmed | to fill in |
| Time to a working device | Weeks. The panel plugs in, but you write the frame client and build power and an enclosure | A weekend for a display-only image loop on firmware 4.x. Longer for a button-driven client | Hours, plus a button test | Tablet: hours. Module: the same firmware work as the baseline | to fill in |
| UI responsiveness | Panel update 120 ms (black/white fast mode), 260 ms, or 450 ms (16 greys), plus data transfer. A full 16-grey frame on 10.3" took about 3 s end to end in Waveshare's own demo | E-reader partial refresh. Not measured here | Fastest of the e-paper routes: vendor fast-refresh modes and a real browser engine. Ghosting in the fast modes | LCD speed (60 Hz), no ghosting | to fill in |
| Battery / always-on | Worst. About 0.7 W idle with Wi-Fi and no suspend: under 2 days on a 37 Wh pack (derived) | Good if it sleeps between updates, since the image stays on screen. Wi-Fi blocks standby. No measured figure | Unknown. No measurement found. 2,300 mAh with Android awake | Tablets: 15–67 hours (DC-1, maker's figures). Memory LCD module: 250 µW static | to fill in |
| Kitchen ruggedness | Bare glass and flex cable, rated 0–50 °C and 35–65% humidity. Needs a sealed enclosure | Best. IPX8 (Libra Colour, search excerpt), sealed body, real buttons | "Water-repellent", no IP rating | DC-1 "not currently waterproof". Module boards are bare | to fill in |
| Hackability and longevity | Highest: plain Linux. Official driver untouched since January 2024. Pi Zero 2 W in production "until at least January 2030" | Good on firmware 4.x. The main launcher does not run on firmware 5.x | App level only, on vendor Android 13. Depends on the kiosk app and vendor firmware | Tablets as Route 3. ESP32 module fully open | to fill in |
| Fabrication | Most: enclosure, battery, buttons wired to GPIO | None (a magnetic case) | None (a magnetic mount) | Tablet: none. Module: enclosure | to fill in |

## 2. Best concrete option per route

| Route | Pick | Price | Main risk |
|---|---|---|---|
| 1 | Waveshare 10.3" e-Paper HAT (SKU 18434, 1872 × 1404, 16 greys) on a Raspberry Pi Zero 2 W | Panel €229.00 at [Welectron](https://www.welectron.com/Waveshare-18434-103inch-e-Paper-HAT_1) ("ca. 3 months") or €243.67 at [Eckstein](https://eckstein-shop.de/WaveShare103inche-Papere-InkDisplayHATForRaspberryPi2C1872C39714042CBlack2FWhite2C16GreyScales2CUSB2FSPI2FI80EN) ("ca. 3 weeks"). Pi €18.90 at [BerryBase](https://www.berrybase.de/en/raspberry-pi-zero-2-w), "Currently not available" | Power. It cannot run always-on from a battery, and the Pi has no suspend. Second: a fragile bare panel that you must seal yourself |
| 2 | Kobo Libra 2, used, on firmware 4.x. Alternative: new Kobo Libra Colour | Used asking prices €160, €165, €209 on Wallapop (indicative). New Libra Colour €239,99, list €269,99, at the [Kobo Spain store](https://ereader.kobo.com/es-es/pages/compare-ereaders) | No ready-made button-driven client: you write it. On a new unit, firmware 5.x may block the launcher. On a used unit, battery and seals are unknown |
| 3 | Onyx Boox Go 7 with Fully Kiosk Browser | Go 7 €269.99 at the [Boox EU shop](https://euroshop.boox.com/products/boox-go-7) (search excerpt; the shop blocked direct loads). Licence "8.90 EUR ... per device plus tax" ([Fully](https://www.fully-kiosk.com/docs/en/legal/fully-plus-license)) | The page-turn buttons do not reach a web page as key events. They depend on the kiosk app's JavaScript bridge, and that combination is untested. Always-on battery life is unknown. No IP rating |
| 4 | Waveshare ESP32-S3-RLCD-4.2 (4.2" reflective LCD board with battery holder). Runner-up if mains-powered: Daylight DC-1 | $24.99–26.99 (search excerpt). EU price not checked. DC-1 price not confirmed | 300 × 400 pixels on 4.2" is too small for recipe text at fridge distance. It is a bare board |

## 3. Verdict

An ESP32 e-paper board stays the right default. Choose another route only under these conditions.

**Route 3 (Boox Go 7) beats it if** you want a working device this week, want the UI to be an ordinary web app in a real browser engine, and accept all three of: about €280, charging every few days (my expectation, not measured), and splash resistance without an IP rating. Run one test before buying into it: confirm that a page-turn button press arrives in your page through Fully's `volumeUp` / `volumeDown` events. If it does not, you need a small custom WebView wrapper app, and the route loses its speed advantage.

**Route 2 (Kobo) beats it if** surviving the kitchen matters more than anything else. You get a sealed, waterproof body with real buttons, a 300 ppi screen and a battery for €160–240, with no enclosure work. The working dashboard projects on Kobo use the same design as the baseline: fetch a server-rendered image, draw it, sleep. So your server does not change. It loses if the unit runs firmware 5.x and you cannot launch your own code, and it loses if you need instant reaction while the device is asleep.

**Route 1 (Pi + large panel) beats it only if** the device is mains-powered and you want a 10.3" to 13.3" panel with 16 greys and updates of 120–450 ms. On battery it loses clearly. Note also that Good Display ships ESP32 example code for the same controller chip, so a large fast panel does not strictly require a Pi (see Route 1, "Good Display").

**Route 4 (reflective LCD) does not beat it for this product.** The tablets need charging every one to three days (from the maker's 15–67 hour figures for the DC-1) and are not waterproof. The only parts that can stay on for weeks from a battery are 4"-class modules, too small for recipes. A reflective LCD module is worth a look only as a second small display for running timers, where one update per second on e-paper is awkward.

**Colour e-paper (Spectra 6) is out for interaction** in any route: 12–28 seconds per refresh as documented, 20–35 seconds in practice.

## Route 1: Raspberry Pi + large e-paper panel

### Waveshare IT8951 panels

All four kits include the panel and an IT8951 driver board that plugs onto the Pi header (package lists on the product pages below).

| Panel (Waveshare SKU) | Resolution | Grey levels | Full refresh as documented | Waveshare price | EU price and stock |
|---|---|---|---|---|---|
| 7.8" (16766) | 1872 × 1404 | "2-16 (1-4 bit)" | "450ms" | $146.99 ([Waveshare](https://www.waveshare.com/7.8inch-e-paper-hat.htm)) | €159,00 incl. 19% VAT, "10+ On stock" ([Welectron](https://www.welectron.com/Waveshare-16766-78inch-e-Paper-HAT_1)). €161.69, "Special order", page data 2026-10-14 ([RobotShop EU](https://eu.robotshop.com/products/waveshare-1872x1404-78-inch-e-ink-display-hat-raspberry-pi)) |
| 9.7" (15195) | 1200 × 825 | "2-16 (1-4 bit)" | "<1s" | $162.99 ([Waveshare](https://www.waveshare.com/9.7inch-e-paper-hat.htm)) | €199,00, "On stock (short supply)" ([Welectron](https://www.welectron.com/Waveshare-15195-97inch-e-Paper-HAT_1)) |
| 10.3" (18434) | 1872 × 1404 | "2-16 (1-4 bit)" | "<1s" | $202.99 ([Waveshare](https://www.waveshare.com/10.3inch-e-paper-hat.htm)) | €229,00, "Orderable", "ca. 3 months" ([Welectron](https://www.welectron.com/Waveshare-18434-103inch-e-Paper-HAT_1)). €243,67, "ca. 3 weeks" ([Eckstein](https://eckstein-shop.de/WaveShare103inche-Papere-InkDisplayHATForRaspberryPi2C1872C39714042CBlack2FWhite2C16GreyScales2CUSB2FSPI2FI80EN)). €223.29, "Special order", page data 2026-10-14 ([RobotShop EU](https://eu.robotshop.com/de/products/waveshare-103-e-paper-e-ink-display-hat-raspberry-pi-18721404-schwarz-wei-16-graustufen-usb-spi-i80)) |
| 10.3" flexible, "(D)" (16712) | not re-checked | not re-checked | not re-checked | not checked | €279,00, "On stock (short supply)" ([Welectron](https://www.welectron.com/Waveshare-16712-103inch-e-Paper-HAT-D_1)) |
| 13.3" (15853) | 1600 × 1200 | "2-16 (1-4 bit)" | "<1s" | $407.99 ([Waveshare](https://www.waveshare.com/13.3inch-e-paper-hat.htm)) | €448.79, "Available on backorder", page data 2026-10-16 ([RobotShop EU](https://eu.robotshop.com/products/waveshare-133-inch-e-paper-display-hat-raspberry-pi-1600x1200-black-white)) |

Notes on the table:

- Waveshare's product pages show no stock status. The RobotShop pages do not say whether tax is included. The Eckstein page also showed "This item is not available in your delivery country" without saying which country it assumed, so delivery to Spain is unconfirmed.
- Each product page carries the footnote "It usually takes about 0.3s for partial refresh" (for example [7.8"](https://www.waveshare.com/7.8inch-e-paper-hat.htm)).
- Power: "Total refresh power: 1.2W(typ.)" and "Total standby power: 0.1W(typ.)" for the 10.3" ([wiki](https://www.waveshare.com/wiki/10.3inch_e-Paper_HAT)); 0.6 W and 0.3 W for the 9.7" ([wiki](https://www.waveshare.com/wiki/9.7inch_e-Paper_HAT)).
- Environment, from the [10.3" wiki](https://www.waveshare.com/wiki/10.3inch_e-Paper_HAT): operating temperature "0 ~ 50 ℃", "Humidity range: 35%~65%RH", "the glass panel and FPC are fragile", "update the display screen at least every 24 hours". A kitchen can exceed that humidity range.

### Refresh time per waveform mode

A waveform mode is the drive pattern the controller uses for an update. Faster modes show fewer grey levels and leave more ghosting.

Waveshare's wiki documents only three modes: INIT, GC16 and A2. Its mode-number table points to an E Ink document for the rest ([wiki](https://www.waveshare.com/wiki/10.3inch_e-Paper_HAT)). That document, hosted by Waveshare, gives "Typical update time at 25 C 85 Hz (ms)" ([E Ink waveform specification](https://files.waveshare.com/upload/c/c4/E-paper-mode-declaration.pdf), Table 1):

| Mode | What it does | Typical update time | Ghosting |
|---|---|---|---|
| INIT | Clears the display to white | 2000 ms | n/a |
| DU | Any grey to black or white only. "Very fast, non-flashy" | 260 ms | Low |
| GC16 | Full quality, 16 grey levels | 450 ms | Very low |
| GL16 | Text on white, reduced flash, 16 levels | 450 ms | Medium |
| A2 | Black and white only, "fast page flipping at reduced contrast" | 120 ms | Medium |
| DU4 | Four grey tones, fast | 290 ms | Medium |

Three limits apply:

- These are panel update times only. Sending the frame over SPI comes on top. Waveshare reports that its earlier demo "cost 10s to update a picture on 10.3inch e-Paper (D) in GC16 Mode, with the new version, it is reduced to 3s" ([wiki](https://www.waveshare.com/wiki/10.3inch_e-Paper_HAT)).
- The fastest case, frames already stored in the controller, tops out at "about 7fps" ([wiki](https://www.waveshare.com/wiki/10.3inch_e-Paper_HAT)).
- A2 mode works "only ... for 1bpp mode", that is, pure black and white ([13.3" wiki](https://www.waveshare.com/wiki/13.3inch_e-Paper_HAT)). The same document says each waveform "is specifically adjusted for a particular display module lot", so real timings vary by panel.

### Good Display

- GDEP103TC2: 10.3", "1404 (V)×1872 (H)", 227 PPI, E Ink Carta 1000, 16 grey levels, "Full refresh for 0.45s, Partical refresh for 0.22s, Fast Partical refresh for 0.12s". No price on the page ([Good Display](https://www.good-display.com/product/682.html)).
- DEJA-TC103: an "IT8951 TTL parallel TCON board" with USB-C and SPI, for that 10.3" panel and a 13.3" one. It ships "ESP32/Arduino example code" and the page does not mention the Raspberry Pi. No price on the page ([Good Display](https://www.good-display.com/product/472.html)). A price of about $79 appears only in a search excerpt of Good Display's storefront, which blocked loading: UNVERIFIED.
- This matters for the comparison: the same controller chip can be driven from an ESP32, so the large-panel advantage of Route 1 is not tied to a Pi.

### Raspberry Pi power draw

| Board | Official "typical bare-board active current consumption" | Measured idle |
|---|---|---|
| Zero 2 W | 350mA ([Raspberry Pi docs](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#power-supply)) | "HDMI off, LED off: 100 mA (0.6 W)"; "HDMI off, LEDs off, onboard WiFi: 120 mA (0.7 W)" ([Pi Dramble](https://www.pidramble.com/wiki/benchmarks/power-consumption), USB power meter, idle 1 minute) |
| Pi 4 Model B | 600mA (same docs) | Official table: idle average 0.6 A, measured June 2019 with monitor, keyboard, mouse and Ethernet attached (same docs). 540 mA (2.7 W) ([Pi Dramble](https://www.pidramble.com/wiki/benchmarks/power-consumption)) |
| Pi 5 | 800mA (same docs) | "My 1.8W idle result came from the official 5A PSU and a Kill-A-Watt", "as much as 3W idle" with another supply ([Jeff Geerling](https://www.jeffgeerling.com/blog/2023/answering-some-questions-about-raspberry-pi-5/)) |

- No suspend. In the kernel issue "suspend to ram", a Raspberry Pi engineer wrote "Is it possible? Yes, probably." and "Chances of it happening? Zero." Another called it "a huge amount of work we simply don't want to do" ([raspberrypi/linux #1281](https://github.com/raspberrypi/linux/issues/1281), closed).
- The Pi 5 can power off to "approximately 3 mA" and wake on a clock alarm, but that is a full reboot each time ([docs, real-time clock](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#real-time-clock-rtc)). By default a shut-down Pi 5 still "consumes around 1 W to 1.4 W" ([docs](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#power-supply)).
- What this implies (derived): a Zero 2 W at 0.7 W plus the panel board at 0.1 W standby is about 0.8 W, or 19 Wh a day. A 10,000 mAh, 3.7 V pack holds 37 Wh, so under two days before conversion losses. An always-on Pi is a mains device. Booting for each update would save power, but then every button press waits for a boot. Boot time was not measured: UNVERIFIED.
- Add-on battery boards exist. The PiSugar 3 lists a clock and "Timing boot" as supported ([PiSugar wiki](https://github.com/PiSugar/PiSugar/wiki/PiSugar-3-Series)). Its 1200 mAh capacity comes from a search excerpt only: UNVERIFIED.
- Supply: the Zero 2 W was out of stock at both EU shops checked. €18.90, "Currently not available" ([BerryBase](https://www.berrybase.de/en/raspberry-pi-zero-2-w)); 18.00 EUR, "Out of stock" ([Olimex](https://www.olimex.com/Products/RaspberryPi/RPi-ZERO-2W/)). It "will remain in production until at least January 2030" ([Raspberry Pi](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/)).

### Software maturity

Repository figures are from the GitHub API on 2026-11-20.

| Project | What it is | State |
|---|---|---|
| [waveshareteam/IT8951-ePaper](https://github.com/waveshareteam/IT8951-ePaper) | Official C library and demos for Pi and STM32 | Last commit 2024-01-23, "Add LGPIO library to speed up the refresh of Pi5". 57 stars. No licence detected. The wiki recommends the lg library on Pi 5 because "BCM library currently does not support Pi5" ([wiki](https://www.waveshare.com/wiki/7.8inch_e-Paper_HAT)) |
| [GregDMeyer/IT8951](https://github.com/GregDMeyer/IT8951) | Python driver. `draw_full(mode)` and `draw_partial(mode)`, which sends only the changed rectangle; all eight waveform modes named | MIT. 175 stars. Last commit 2023-11-08. "Developed using the 6-inch e-Paper HAT ... hopefully will work for other (related) hardware too" |
| [pbert519/it8951](https://github.com/pbert519/it8951) | Rust driver ([crate](https://crates.io/crates/it8951) 0.5.1, updated 2026-06-05) | Active. "Known to be working" on the 7.8" and 10.3". 16-grey only. The 1-bit mode, which Waveshare says the fast A2 mode needs, is still on its to-do list |
| [robweber/omni-epd](https://github.com/robweber/omni-epd) | Python abstraction that wraps the driver above for the 6", 7.8", 9.7", 10.3" | Release v0.4.2, 2024-11-15 |
| [julbouln/tinydrm_it8951](https://github.com/julbouln/tinydrm_it8951) | Kernel display driver, which would make the panel a normal Linux screen | "Tested on raspberry pi zero w with kernel 4.19, only 6" panel is supported". Last commit 2021-10-18 |
| [joukos/PaperTTY](https://github.com/joukos/PaperTTY) | Mirrors a terminal or a VNC desktop to the panel by polling and sending changed regions | 1049 stars. Last commit 2023-12-24. Its author calls the VNC method "not actually very efficient" |
| [blahgeek/rabbitink](https://github.com/blahgeek/rabbitink) | Uses an IT8951 panel over USB as a low-latency monitor | Claims "about 140 ms" latency. "Linux with X11 is the main supported platform". Verified by its author on the 6" HD and 13.3" panels |
| [aceinnolab/Inkycal](https://github.com/aceinnolab/Inkycal) | Dashboard software | Active (commit 2026-11-19). Lists the 9.7", 10.3" and 7.8" panels as [supported models](https://github.com/aceinnolab/Inkycal/blob/main/inkycal/display/supported_models.py) |
| [fatihak/InkyPi](https://github.com/fatihak/InkyPi) | The most-starred Pi e-paper dashboard (4285 stars, commit 2026-11-04) | "Displays based on the IT8951 controller are not supported" |

Is a Chromium kiosk on the panel practical? Not as an off-the-shelf setup. There is no maintained driver that presents the panel as a Linux display, so a browser cannot simply draw to it. Three workable patterns remain:

1. Render on the server and have the Pi push frames with partial updates. This is the baseline architecture with a bigger panel and a hungrier computer.
2. Render with headless Chromium on the Pi and push the screenshot. InkyPi does this for its own displays: it installs `chromium-headless-shell` and takes screenshots at the panel size ([requirements](https://github.com/fatihak/InkyPi/blob/main/install/debian-requirements.txt), [image_utils.py](https://github.com/fatihak/InkyPi/blob/main/src/utils/image_utils.py)). Speed on a 512 MB Zero 2 W: UNVERIFIED.
3. Mirror an X11 desktop with rabbitink over USB. Not shown on a Pi: UNVERIFIED.

### Large colour panels (E Ink Spectra 6)

| Panel | Resolution | Documented refresh | Price | Source |
|---|---|---|---|---|
| Pimoroni Inky Impression 7.3" | 800 x 480 | "28 seconds" for units "made from April 2026 onwards", which use a new panel with "a slightly longer core refresh time" | £66.25 | [Pimoroni](https://shop.pimoroni.com/products/inky-impression) |
| Pimoroni Inky Impression 13.3" | 1600 x 1200 | "12 seconds" core time | £191.25 | same page |
| Good Display GDEP073E01, 7.3" | 800x480 | Full refresh "15~22" s | not shown | [Good Display](https://www.good-display.com/product/533.html) |

- Pimoroni adds: "You can expect a complete 'real world' refresh cycle to take between 20 and 35 seconds", and the core time applies at 25–50 °C, with cooler temperatures taking longer ([Pimoroni](https://shop.pimoroni.com/products/inky-impression)). The Pimoroni prices are as listed in the shop's product data; the VAT basis was not checked.
- E Ink's own page gives "Operating temperature: 0-50 degrees Celsius" and no refresh time ([E Ink](https://www.eink.com/brand/detail/Spectra6)).
- Waveshare's Spectra 6 pages returned HTTP 403. Their figures (12 s for 7.3", 19 s for 13.3") are search excerpts only: UNVERIFIED.
- Conclusion: usable for a leftovers board that changes a few times a day. Not usable for stepping through a recipe or showing a timer.

## Route 2: Repurposed e-readers

### Kobo hardware

| Model | Screen | Page-turn buttons | Water | Price |
|---|---|---|---|---|
| Libra Colour (current) | 7" E Ink Kaleido 3, 1264x1680, 300 PPI black-and-white and 150 PPI colour ([Kobo product page](https://es.kobobooks.com/products/kobo-libra-colour), search excerpt) | Yes (same excerpt; KOReader's device file sets `hasKeys = yes`, [device.lua](https://github.com/koreader/koreader/blob/master/frontend/device/kobo/device.lua)) | "IPX8 - up to 60 mins in 2 metres of water" (same excerpt) | €239,99 next to €269,99, under the banner "Ahorra hasta 30 €" ([Kobo Spain](https://ereader.kobo.com/es-es/pages/compare-ereaders)) |
| Clara Colour (current) | 6" Kaleido 3 ([Kobo Spain](https://ereader.kobo.com/es-es/pages/compare-ereaders)) | No (no `hasKeys` in [device.lua](https://github.com/koreader/koreader/blob/master/frontend/device/kobo/device.lua)) | "Resistente al agua" | €169,99 next to €189,99 |
| Clara BW (current) | 6" E Ink Carta 1300 (same page) | No | "Resistente al agua" | €169,99 |
| Elipsa 2E, Sage | Listed on the same page; not checked | not checked | not checked | not checked |
| Libra 2 (discontinued, used) | 300 dpi per [device.lua](https://github.com/koreader/koreader/blob/master/frontend/device/kobo/device.lua). 7", 1264 × 1680: UNVERIFIED | Yes (`hasKeys = yes`) | IPX8: UNVERIFIED | Asking €160, €165, €209 on Wallapop |
| Libra H2O (discontinued, used) | UNVERIFIED | UNVERIFIED | UNVERIFIED | Asking €166, €190, €200 on Wallapop |

- Kobo's product pages returned HTTP 429, so the Libra Colour specifications are from a search excerpt of the official page. The prices are from the Spain store's comparison page, which loaded.
- Used prices are asking prices from a Wallapop search response saved on 2026-11-20, not sale prices. Example listings, with links built from the listing identifiers and not opened: [Libra 2](https://es.wallapop.com/item/kobo-libra-2-blanco-1326090426), [Libra H2O](https://es.wallapop.com/item/kobo-libra-h2o-blanco-1305718823). Used Libra Colour units were listed at €175–285 in the same response, so the used discount is small.

### State of custom software on Kobo

- **KOReader.** Latest release v2026.07.1 ([releases](https://github.com/koreader/koreader/releases/latest)). "The full Kobo lineup is currently supported, starting from the Touch" ([wiki](https://github.com/koreader/koreader/wiki/Installation-on-Kobo-devices)). The device file has entries for the Libra Colour, Clara BW and Clara Colour ([device.lua](https://github.com/koreader/koreader/blob/master/frontend/device/kobo/device.lua)).
- **Buttons are readable by custom code.** The same file maps Linux input codes to the page-turn keys: `[193] = "RPgBack"`, `[194] = "RPgFwd"`.
- **Wi-Fi blocks standby.** A code comment in that file says "we won't ever standby with Wi-Fi on".
- **Plato.** Lists the Libra Colour, Clara Colour, Clara BW, Libra 2 and Libra H₂O as supported, and says "Any 4.X.Y firmware, with X ≥ 6, will do" ([repo](https://github.com/baskerville/plato)). It says nothing about firmware 5.
- **NickelMenu**, the usual way to launch custom programs from Kobo's own interface. "NickelMenu requires firmware 4.6+ to work, and has been fully tested on 4.20.14622 - 4.31.19086", and "NickelMenu is not currently compatible with firmware 5.x". It can run system commands, open the built-in browser, toggle Wi-Fi and power, and has a failsafe that "will never result in an unbootable Kobo" ([NickelMenu](https://pgaskin.net/NickelMenu/)).
- **KFMon**, the other launcher: "applying an official FW update will disable" it, so it must be reinstalled ([KOReader wiki](https://github.com/koreader/koreader/wiki/Installation-on-Kobo-devices)).
- **FBInk**, "a small tool & library to print text & images to an eInk Linux framebuffer". "Kobo support covers the full Kobo lineup", Kindle support "covers the full Kindle lineup, starting from the K2", with bindings for Rust, Go, LuaJIT and Python ([repo](https://github.com/NiLuJe/FBInk)).
- **Firmware 5.x is the open risk.** It exists, as the NickelMenu statement shows. Which models ship with it, and whether KOReader has a working launcher there, I could only see in search excerpts of community threads: UNVERIFIED (leads in the last section).
- **Secure boot or other lock-downs on recent models:** nothing found either way. UNVERIFIED.
- **Built-in browser** (engine, JavaScript and CSS support): no primary source found. UNVERIFIED. Do not plan on running the app in it.

### Kobo as a dashboard

- [usetrmnl/trmnl-kobo](https://github.com/usetrmnl/trmnl-kobo) (125 stars, MIT) turns a Kobo into a client for server-rendered screens. Each cycle it fetches an image with curl and draws it with FBInk.
  - Wi-Fi: switched on for each cycle and off afterwards.
  - Sleep: "In between request the Kobo will be put to sleep, and will wake up for the next update", using a patched `rtcwake`.
  - Input: "a swipe on screen will wake the device up and force a refresh". No button handling.
  - Needs NickelMenu, so not firmware 5.x. Users report it working on the Libra 2 and a "Kobo Libra 2 Color" (the README's wording). No battery figures given.
- [Mavireck/Kobo-Dashboard](https://github.com/Mavireck/Kobo-Dashboard) (39 stars) draws a clock, calendar and weather with Python and FBInk, started through KFMon. "I only tested it on a Kobo Aura H20 first edition." "You should start it with wifi on." Nothing on sleep.

### Kindle

Jailbreak coverage by firmware, from the data behind the [Kindle Modding jailbreak wizard](https://kindlemodding.org/jailbreak-wizard.html) as saved on 2026-11-20. Model codes are the site's own. My reading, not checked against the site's model key: PW is Paperwhite, KT the basic Kindle, KOA the Oasis, KS the Scribe, CS the Colorsoft.

| Jailbreak | Firmware range | Models | Conditions |
|---|---|---|---|
| WinterBreak2 | 5.6.1.1 to 5.16.3, plus 5.16.5 | PW through KT5, KS | No registration needed |
| WinterBreak | 5.6.1.1 to 5.18.0.2 | Nearly all, including KT6, PW6, KS2, CS | Registration required |
| SpiderCat | 5.16.3 to 5.19.5 | PW4, KT4, KOA3, PW5, KT5, KT6, PW6, CS, KS, KS2 | No registration needed |
| Shadow | 5.19.4 to 5.19.6 | KS, KS2, CS, PW6, KT6 | No registration needed |
| Véra | 5.17.1 to 5.20.2 | PW5, KT5, KT6, PW6, CS, KS, KS2 | No registration needed |

- Véra "is a jailbreak released on 10/08/26 by Ava and sparklerfish", and after it "Updates have been automatically blocked for you" ([Véra page](https://kindlemodding.org/jailbreaking/Vera)).
- So in late 2026 the models in the Véra row can be jailbroken on firmware up to 5.20.2. Whether 5.20.2 is the newest firmware Amazon ships, I did not check: UNVERIFIED.
- A kiosk web dashboard in the Kindle's own browser: no primary evidence found. UNVERIFIED.
- The realistic pattern is again the image loop. [pascalw/kindle-dash](https://github.com/pascalw/kindle-dash) (1.4k stars) "periodically fetches an image to be displayed on the screen and suspends the device to RAM (which is very power efficient) until the next screen update", and "does not render the dashboard itself". It needs a jailbroken Kindle with SSH and was "tested only on a Kindle 4 NT".
- Whether any current Kindle has page-turn buttons was not checked (UNVERIFIED). Kobo, where buttons are confirmed, is the safer fit for a button-driven device.

## Route 3: Android e-ink tablets with a web app in kiosk mode

### Devices

| Device | Screen | Buttons | Water | Other | EU price |
|---|---|---|---|---|---|
| Boox Go 7 | 7", "Carta 1300 display with a high resolution of 300PPI" ([Boox announcement](https://shop.boox.com/blogs/news/introducing-the-go-7-series-portable-ereaders-for-a-joy-beyond-reading), 2025-04-24). 1680 x 1264 ([product page](https://shop.boox.com/products/go7), search excerpt) | "newly designed page-turn buttons" (announcement) | "Both models are water-repellent, offering protection against spills, splashes, or light rain". No IP rating given | "Running Android 13", "4GB of RAM and 64GB", "195g" (announcement). 2,300 mAh (product page, search excerpt) | €269.99 ([EU shop](https://euroshop.boox.com/products/boox-go-7), search excerpt) |
| Boox Go Color 7 (Gen II) | 7" Kaleido 3, "150 PPI for color and 300 PPI for black and white" (announcement) | Same | Same | Same | €289.99 ([EU shop](https://euroshop.boox.com/products/boox-go-color-7-gen-ii), search excerpt) |
| Boox Go 6 (Gen II) | not checked | not checked | not checked | not checked | €199.99 ([EU shop](https://euroshop.boox.com/collections/goseries), search excerpt) |
| Boox Go 10.3 (Gen II) and Lumi | not checked | not checked | not checked | not checked | €419.99 and €449.99 (same excerpt) |

- The Boox EU shop returned HTTP 429 on four attempts, so every Boox price above is a search excerpt. UNVERIFIED as live prices.
- Boox Page, the Note Air line and Palma: not checked.
- Bigme: a B751C-S at €260 on Amazon.de is reported only by a news site seen in a search excerpt. UNVERIFIED. Meebook: nothing found.

### Do the buttons reach a web page?

Not as key events in Chrome. The chain, link by link:

1. **Boox lets you choose what the side buttons do per app.** Path: "E Ink Center" → "App Optimization" → "Others" → "Custom side buttons". The post names a "Volume option" and a scrolling function, for built-in buttons such as the Leaf2's ([Boox, 2023-03-31](https://shop.boox.com/blogs/news/new-features-at-a-glance)). That the Go 7 offers the same options: UNVERIFIED.
2. **Android key codes.** Volume up is 24, volume down is 25, page up is 92, page down is 93 ([Android KeyEvent](https://developer.android.com/reference/android/view/KeyEvent)).
3. **Chromium drops volume keys before the page sees them.** Its Android input handler returns false from `shouldPropagateKeyEvent` for `KEYCODE_VOLUME_DOWN`, `KEYCODE_VOLUME_MUTE` and `KEYCODE_VOLUME_UP`, among others ([Chromium source](https://chromium.googlesource.com/chromium/src/+/main/content/public/android/java/src/org/chromium/content/browser/ContentUiEventHandler.java)). A web page in Chrome or an installed web app therefore never gets a key event from a button set to "Volume".
4. **Page up and page down are not on that list,** so they would be forwarded. Whether a Boox can make its buttons send those codes is not documented in anything I loaded: UNVERIFIED.
5. **Fully Kiosk Browser has a bridge for exactly this.** Its JavaScript interface lists `fully.bind('volumeUp','todo();')` and `fully.bind('volumeDown','todo();')` ([Fully JavaScript interface](https://www.fully-kiosk.com/docs/en/api/javascript)). It is a paid feature and needs "Advanced Web Settings >> Enable JavaScript Interface".

Steps 1 and 5 are each documented. Nobody documents them working together on a Boox. Test this before committing. The fallback, a small Android app of your own that wraps a WebView and forwards key presses to the page, is my suggestion and has no source.

### Keeping the screen on

- Fully: "Keep Screen On – Screen will always stay on. The device will be prevented from going to sleep by Android display settings" ([device management](https://www.fully-kiosk.com/docs/en/configuration/device-management)). Kiosk mode adds "Disable Screen Off" and "Disable Volume Buttons" ([kiosk mode](https://www.fully-kiosk.com/docs/en/configuration/kiosk-mode)). There is also "Set Wifi Wakelock – force Wifi to always keep up" ([power settings](https://www.fully-kiosk.com/docs/en/configuration/power)).
- Licence: "8.90 EUR or 10.99 USD per device plus tax", "a one-time payment for a lifetime license". Kiosk mode and the JavaScript interface are paid features ([Fully PLUS](https://www.fully-kiosk.com/docs/en/legal/fully-plus-license)).
- A web app without Fully can use the Screen Wake Lock API, which "prevents the screen from turning off, dimming or locking". It is "available only in secure contexts (HTTPS)", a request "may be rejected" in "power save mode or low battery level", and the lock is released when the page is not visible ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)). A server on your home network over plain HTTP would not qualify.
- Boox's own power settings (sleep timers, freezing of background apps, Wi-Fi in standby): not checked. UNVERIFIED.

### Refresh modes

Boox describes four modes ([Boox, 2023-09-13](https://shop.boox.com/blogs/news/boox-super-refresh-bsr-technology)):

- HD: "designed for deep reading", "the least ghosting".
- Balanced: "quick screen response ... when you are skimming".
- Fast: "browsing websites or activities that involve lots of scrolling. Subtle ghosting may occur but responsiveness is enhanced."
- Ultrafast: "the most rapid response to dynamic content", "some detail would be lost".

That post is about a technology "incorporated into every Tab series tablet". Which modes the Go 7 offers: UNVERIFIED. For a button-driven recipe UI, Balanced or Fast is the likely setting.

### Battery life when always on

No measured figure found for an always-on, Wi-Fi-connected e-ink Android device: UNVERIFIED. The only relevant primary statement is from Fully: "Usually devices will fall asleep (idle/doze mode) as soon as the screen is turned off or few seconds after that, especially when running on battery" ([power settings](https://www.fully-kiosk.com/docs/en/configuration/power)). So staying responsive means keeping Android awake on a 2,300 mAh battery.

## Route 4: Reflective LCD and other low-power displays

Two different kinds of thing sit in this route. A finished tablet has its own battery and needs kiosk software. A bare module needs a microcontroller, an enclosure and a battery.

| Item | What it is | Size and resolution | Power | Price and EU availability |
|---|---|---|---|---|
| Daylight DC-1 | Android 13 tablet with a reflective "Live Paper" LCD and optional amber backlight | "10.5in", "1600 x 1200 • 190dpi", 60Hz ([product page](https://daylightcomputer.com/product)) | "8000mAh". "15 hours active use with the backlight on", "67 hours reading without the backlight on" ([FAQ](https://daylightcomputer.com/faq)) | Price not found on the pages loaded: UNVERIFIED. Ships to "Europe", "up to $25", and "Currently, we do not take care of VAT" ([FAQ](https://daylightcomputer.com/faq)). "In stock · Ships in 3-5 business days" |
| Hannspree HannsNote2 | Android 13 tablet, "TN, Reflective LCD (RLCD)", no light of its own | 10-inch, "1200 x 1600 (194 PPI)", 60 Hz, 350g ([Hannspree](https://www.hannspree.com/product/hannsnote2)) | Battery capacity not in the page text read | EU distributors and shops listed, including Spain ([where to buy](https://www.hannspree.com/where-to-buy)). Price: UNVERIFIED |
| Hannspree Lumo | Android 14 tablet, reflective LCD with a front light | 7.8-inch, "1024 x 768 (164 PPI)", 250g ([Hannspree](https://www.hannspree.com/product/lumo-reader-tablet-78)) | "3,000 mAh Li-Ion, Up to 6.5 hours", measured as video playback at maximum front light | About €250–370 at German shops (search excerpts): UNVERIFIED |
| TCL NXTPAPER tablets | An LCD with its own light source and an anti-glare surface, by TCL's own description. Not a reflective display | Models not checked | TCL's own paper gives "peak brightness up to 650 nits" and describes a layer that "scatters the internal light source" ([TCL white paper](https://www.tcl.com/content/dam/brandsite/website-campaign-page/nxtpaper-whitepaper/pdf/tcl-nxtpaper-whitepaper.pdf)) | Not checked |
| Sharp LS044Q7DH01 | Memory LCD module: each pixel holds its state | "4.4" QVGA monochrome", "320x240" | 250 µW holding a static image, 650 µW in the second test condition; operating range -20 to 70 °C (Sharp specification LCP2111038A, 2011) | Listed by distributors ([DigiKey](https://www.digikey.com/en/products/detail/sharp-microelectronics/LS044Q7DH01/5054070), search excerpt). Price not checked |
| Waveshare ESP32-S3-RLCD-4.2 | ESP32-S3 board with a "fully reflective" LCD, 18650 battery holder, clock chip and a user button | 4.2-inch, "300 × 400", "no backlight required" ([Waveshare docs](https://docs.waveshare.com/ESP32-S3-RLCD-4.2)) | No power figures stated | $24.99–26.99 ([Waveshare](https://www.waveshare.com/esp32-s3-rlcd-4.2.htm?sku=33507), search excerpt): UNVERIFIED. EU price not checked |
| Modos Flow | E-paper computer monitor. Fast e-paper, not LCD | "13.3-inch", "3200 x 2400 Resolution", "60 Hz Refresh Rate", "Sub 100 ms latency", USB-C DisplayPort ([Modos](https://www.modos.tech/)) | Not stated | No price on the page. Sold through [Crowd Supply](https://www.crowdsupply.com/modos-tech/modos-flow) (not loaded) |
| JDI reflective colour LCD | Not checked | | | UNVERIFIED |

Notes:

- **Daylight DC-1.** "The DC-1 is not currently waterproof." On buttons the two pages disagree. The product page says "Action buttons for quick access and page turns. Customizable." The FAQ says "There are two buttons that currently do not have any functionality." The product page shows no successor. As an import you pay VAT and customs on arrival.
- **HannsNote2.** "Requires at least 500 lux ambient light, 800-1000 lux for reading", and "has no integrated backlight or front light module" ([Hannspree](https://www.hannspree.com/product/hannsnote2)). Check your kitchen's light level before considering it.
- **The Sharp datasheet text** was read from a saved copy whose download address was not recorded. A copy is indexed at [this address](https://cdn.eicom.ru/media/PDF/5233465.pdf), which I did not reopen.
- **Modos.** Its site now shows only the Flow monitor. The older Paper Monitor page on Crowd Supply returned HTTP 403: UNVERIFIED. A monitor needs a computer with a display output next to it, so it is not a standalone fridge device.

Suitability for an always-on, battery-powered fridge display:

- **Tablets (DC-1, Hannspree, TCL): poor.** An LCD shows nothing unless the tablet is running, so always-on means the maker's 15–67 hour figures at best. None is water-rated.
- **Memory and reflective LCD modules: good on power, too small.** The largest parts found are 4.2" to 4.4". They update at LCD speed, which suits a running timer better than e-paper does.

## Surprises

1. **Volume-key presses never reach a web page in Chrome on Android.** Chromium filters them out in its own source. The obvious plan, mapping page-turn buttons to volume and listening for key events in a web app, cannot work without a native bridge.
2. **NickelMenu does not run on Kobo firmware 5.x.** The easy Kobo path now depends on the firmware a unit arrives with. A used Libra 2 (asking €160–209) is the safer target, though it is not much cheaper than a new Libra Colour at €239,99.
3. **Kobo and Kindle dashboard projects use the baseline's design.** They fetch a server-rendered image, draw it and suspend. An e-reader is a ready-built, waterproof, battery-equipped thin client.
4. **Colour e-paper got slower in 2026.** Pimoroni's 7.3" units from April 2026 list 28 seconds, up from 12, in exchange for better colour.
5. **The most popular Pi e-paper dashboard does not support the large panels.** InkyPi excludes IT8951 displays outright.
6. **The Raspberry Pi cannot suspend,** by its makers' choice, so the smallest Pi still draws about 0.7 W around the clock.
7. **Good Display supports its large-panel controller board from an ESP32,** which blurs the line between Route 1 and the baseline.
8. **The Daylight DC-1 is not waterproof, does not handle EU VAT,** and by its own FAQ has two buttons that do nothing yet.
9. **Modos has moved on** from the Paper Monitor to a 13.3" "Flow" monitor.
10. **Supply is thin on the day checked.** The Pi Zero 2 W was out of stock at two EU shops, and the 10.3" panel was quoted at three weeks to three months.

## UNVERIFIED claims and pages that would not load

**Route 1**

- Waveshare Spectra 6 refresh times (12 s for 7.3", 19 s for 13.3"): product and wiki pages returned HTTP 403.
- Good Display DEJA-TC103 price (about $79) and GDEP103TC2 price: the storefronts buyepaper.com and buy-lcd.com returned HTTP 403.
- PiSugar 3 battery capacity (1200 mAh).
- Raspberry Pi boot time per update; headless Chromium speed on a Zero 2 W; rabbitink on a Pi.
- Delivery of the Eckstein and Welectron listings to Spain, and its cost.
- Amazon.es listing for the 10.3" panel: HTTP 503. OpenELAB prices: HTTP 429.

**Route 2**

- Libra Colour specifications (resolution, IPX8 depth and time, 2050 mAh): from a search excerpt of Kobo's product page. Direct loads returned HTTP 429.
- Libra 2 and Libra H2O: screen size, resolution, IPX8 rating.
- Used prices: asking prices from one Wallapop search response; item links not opened.
- Which Kobo models ship with firmware 5.x, and how KOReader is launched there. Leads not loaded: MobileRead thread ["Nickelmenu on 5.x firmware"](https://www.mobileread.com/forums/showthread.php?t=374547); [KOReader discussion 16001](https://github.com/koreader/koreader/discussions/16001), whose excerpt mentions a separate firmware-5 build of KOReader.
- Secure boot on recent Kobo models.
- The built-in Kobo browser's engine and its JavaScript and CSS support.
- Whether 5.20.2 is the newest Kindle firmware; whether a web dashboard can run in the Kindle browser; page-turn buttons on current Kindles.
- TRMNL's Kindle client (usetrmnl/trmnl-kindle): identified but not loaded.
- Plato's latest release date and maintenance status: not shown on the page.

**Route 3**

- All Boox EU prices, and the Go 7's battery capacity and pixel resolution: search excerpts. The EU shop returned HTTP 429 four times and the product page on shop.boox.com once.
- Whether the Go 7 offers "Custom side buttons" with the options the 2023 post describes, and whether it can send page-up and page-down codes.
- Whether Fully's `volumeUp` / `volumeDown` events fire for Boox side buttons.
- Which refresh modes the Go 7 has.
- Boox power settings and background-app behaviour.
- Any measured battery life for always-on, Wi-Fi-connected use.
- Bigme B751C-S price (€260); Meebook; Boox Page, Note Air and Palma.

**Route 4**

- Daylight DC-1 price. The FAQ page shows its answers only in embedded data, which I parsed from a saved copy.
- HannsNote2 battery capacity and price; Lumo price.
- TCL NXTPAPER tablet models, sizes, prices and battery life.
- Waveshare ESP32-S3-RLCD-4.2 price and power draw: waveshare.com returned HTTP 403.
- Sharp LS044Q7DH01 price, and the provenance of the datasheet copy.
- Modos Paper Monitor and dev kit (Crowd Supply page HTTP 403); Modos Flow price.
- JDI reflective colour LCD modules: the datasheet host returned HTTP 403.

**Method note.** Several pages for Routes 2 and 4 were read from copies saved earlier the same day by a parallel step of this research that then stopped: the Kobo Spain comparison page, the Wallapop response, the Kindle Modding data, and the Daylight, Hannspree, Sharp and TCL pages. Their source addresses were recovered from the saved files or by a follow-up search, as noted in each place.
