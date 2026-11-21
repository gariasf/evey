# Pantry and leftover tracking that people keep up

Checked 2026-11-20. Facts come from papers and theses read in full, the tools' source at the pinned commits linked below, their issue trackers and discussions, and food-safety agencies' own pages. Papers were read from author, repository or course copies, and the links point to the copies read. Anything not confirmed that way is marked UNVERIFIED and collected at the end. The pantry models of Grocy, Mealie, Tandoor, KitchenOwl and Cooklang are in [software-prior-art.md](./software-prior-art.md). This note covers their upkeep.

**How strong the evidence is.** Strong on why tracking lapses: five papers read in full. Strong on what the tools do: read from source. Thin on household food tools: two PhD theses, with four to seven households or participants per study, plus one app's usage log. Three agency pages and the FoodKeeper data were read through the Internet Archive, because the live pages refused automated requests or were gone.

**In short.** People stop tracking mainly because every entry costs effort, and a missed entry makes running totals wrong, which hastens the stop. In the household studies, inventory apps lost participants over adding and removing items, a camera that needed no input was often forgotten, and colour-coded fridge shelves, which needed no data entry, were still in use months later. Users of Grocy, Tandoor, Mealie and KitchenOwl have asked for shopping or cooking to update the pantry for them. Agencies' figures for how long cooked food keeps differ: 48 hours (UK FSA) against 3 to 4 days (USDA FSIS).

## Findings

### Why tracking lapses

- **Barriers cascade.** In Li, Dey and Forlizzi's stage-based model (68 surveys, 11 interviews), "problems in earlier stages affect the later stages", and gaps in collection "may lead to sparse datasets that are insufficient for reflection". The commonest collection barriers were the tool (13 of 68), remembering (12) and lack of time (11) [LI10].
- **Lapsing is normal, in four kinds.** Epstein et al. (surveys of 105, 99 and 83 trackers, 22 interviews) found forgetting, upkeep, skipping and suspending. After forgetting several times, "people may decide that tracking is not worth the trouble". 15%, 14% and 17% of trackers still called themselves current after a month or more without use. The authors recommend that designers "plan for lapse and resumption" [EP15].
- **Effort is the commonest reason to stop.** Among 193 people who had stopped, the cost of collecting and integrating data was the top reason in each domain: 45.6% (activity), 57.1% (finances), 42.9% (location). Manual entry "such as financial spreadsheets or food journals" is the hard case: "I got behind on keeping up with it and couldn't find the time to start back up" (one participant and 18 others). The authors suggest re-engagement "rather than nagging notifications pointing out a lack of tracking" [EP16].
- **Food is the hardest thing to log.** Among 141 food journallers (94 lapsed) and 5,526 forum posts, forgetting was the most-cited reason for a missed entry, and a missed entry makes totals wrong: "Half of the time, I would just log foods for half the day, so the calories totals were completely off." Journals "cannot assume continuous and complete compliance". Packaged food was easiest "because of bar codes", and home cooking hardest, partly because "I only eat some of what I make at a time" [CO15].
- **Semi-automated tracking.** In "mostly automated tracking, a system collects the majority of the data, but people can help by manually confirming or correcting" it. Quantified Self members cope with the burden by "automating the data collection when possible, lowering the data granularity, and making manual capture very easy" [CH17].

### Household food tools: what people keep up

- **Logging food waste was kept up by very few.** A free food-waste diary app was installed on 1,065 devices and received 843 entries in 18 months. One user made 133 entries, and 146 made a single one. Users' own words for why food was binned included "leftover" and "forgot in the fridge" [GA14, ch. 5].
- **A camera that needed no input was often forgotten.** FridgeCam photographed the fridge every second its door was open and put the latest 15 photos on a web page. Over a month in five households, two used it to plan shopping (56 visits, 4 min 19 s on average). The other three made 50 visits of 47 s on average and "frequently forgot that the Fridge cam was in their fridge or that the images were available". Visits fell over the month [GA14, ch. 6].
- **Inventory apps lost people over entering and removing items.** In three-week trials of a commercial inventory app (Fridge Pal) and a prototype (EatChaFood), with four participants each and high attrition, "the burden of manual data entry and removal" was raised by all participants. One said: "when I'm in the kitchen and have just removed something from my fridge, I don't naturally think to remove it from the application. Then I get automatic notifications for something I have already eaten." A barcode scanner lost its appeal "after some products were not recognised". Expiry defaults that could not be edited gave a goat's cheese "over 100 days" [FW15, Publication 6].
- **What they asked for.** Four participants suggested filling the list from scanned receipts, and one preferred a device at the fridge to a phone, which the authors' findings support. The authors suggest automatic dates "with the option to provide manual input" [FW15, Publication 6].
- **The no-entry intervention lasted.** Colour-coding fridge shelves by food type was still in use in three of seven households months later. In the households that also tried a fridge camera, it did more against expired food than the camera [FW15, Publication 4]. The thesis also names losing the desire to eat a large cooked meal "after several sittings" as a cause of waste [FW15, ch. 6].
- **Leftovers matter to waste.** In UK households, nearly 40% of wasted food happens because it "wasn't used in time", and a quarter because people "cooked, prepared or served too much" [WRAP].

### What the tools ask, and what their users report

- **Grocy** books every purchase and use with an amount. Since January 2025, consuming a recipe takes whatever stock exists instead of refusing [G-23d7]. That answered a 2019 request from a user who wanted to do it "without having to have perfect stock management" [G-386]. A request for a periodic recount workflow has been open since 2022 [G-1988]. A user who found most features "too much 'work' for a small benefit" was pointed to the feature flags, which switch off due dates, prices, locations and opened or frozen tracking [G-2527], [G-config]. The shopping list adds items to stock one at a time or all at once [G-shop].
- **Tandoor's "Auto On Hand"** marks a food on hand "when checked off shopping list". It is off by default, and unticking removes the flag [T-models], [T-api], [T-en]. Its pantry (2.6.0) is booked by hand: no code updating it from cooking or shopping was found in its API views or signals [T-api], [T-signals]. A June 2026 request says "Management of items in pantry is very manual". The maintainer is likely to add auto-adding from the shopping list but is "not sure that it is a good idea" [T-4701]. Another user called such features the kind that "made us forget the idea of using tools like Grocy" [T-4738].
- **Mealie's on-hand flag** makes the shopping list skip a food [M-shop] and counts it as available in the Recipe Finder ([software-prior-art.md](./software-prior-art.md)). A November 2026 proposal says "Nothing updates On Hand after a shopping trip, and nothing clears it after cooking". It adds a "Mark Checked as On Hand" button and an "I Made This" list of the recipe's on-hand foods, "unticked by default". A comment objects that a recipe using one egg does not use up the box [M-8951]. The pull request is open [M-8952]. A 2023 pantry request has 33 upvotes, and one user there calls Grocy "much too convoluted for an individual/family usage" [M-2448].
- **KitchenOwl** has no pantry ([software-prior-art.md](./software-prior-art.md)). A request has been open since February 2022 [K-10], and a 2026 one asks for the items "you tapped when you bought them" to fill one [K-1032].
- **Cooklang's pantry** is a file edited by hand or by command, as in its example "Update quantity after shopping". `unlim` marks an item "stocked, not measurable", and `expiring` looks 7 days ahead by default [CC-pantry]. Shopping-list quantities "are reduced by anything in `pantry.conf`" [CC-api]. Neither document describes cooking or shopping updating the file.

### Signals from actions already taken

- **Shopping-list ticks.** Tandoor ships them as a pantry signal. Mealie and KitchenOwl users ask for them [M-2448], [K-1032]. A tick records that something was bought, not how much, nor when it runs out.
- **The end of a session.** Grocy's recipe consumption books the recipe's amounts and adds the produced dish as one unit per serving [G-svc]. The Mealie egg comment shows why "used" does not imply "used up" [M-8951].
- **Receipts.** Paper receipts cover every shop, but someone has to keep and code them, and there remains "the potential for participants to lose or systematically omit receipts". Automatically captured transaction records avoid that, but in research they "typically represent a single retailer" [STRIDE]. Tandoor's shopping roadmap lists "ability to save receipts?" as an idea [T-4375].
- **Barcodes.** Open Food Facts held 4,926,069 products on 2026-11-20 [OFF], 363,366 of them tagged as sold in Spain [OFF-es]. Grocy looks barcodes up there by default [G-config]. GS1 UK says in-store codes for weighed items "should be exclusive to a specific retail chain" [GS1UK]. A scan names a product and records nothing about its use.
- **Default shelf lives.** USDA FSIS's FoodKeeper data covers 661 products, with fields for pantry, fridge and freezer ranges, and for after opening and after thawing. It is CC0, in English, Spanish and Portuguese [FK], [FK-cat]. EatChaFood showed freshness in three bands: 5 days or more, 2 to 4 days, under 2 days [FW15, ch. 3].

### Leftovers

- **Agencies differ on how long cooked food keeps.** FSIS: "Leftovers can be kept in the refrigerator for 3 to 4 days or frozen for 3 to 4 months. Although safe indefinitely, frozen leftovers can lose moisture and flavor" [FSIS]. FoodKeeper: leftovers with meat, fish, poultry or egg, and soups and stews, 3 to 4 days in the fridge and 2 to 3 months frozen [FK]. FSA: "Leftovers stored in the fridge should be eaten within 48 hours", and rice "no more than one day" [FSA]. Spain's AESAN says not to pack food made more than 2 days earlier in school lunchboxes [AESAN].
- **What people do.** In the FSA's Food and You 2 survey (Wave 9), 66% would eat fridge leftovers within 2 days, 25% within 3 to 5 days and 2% later [FY2].
- **What a default eat-by date stands in for** (this note's analysis, not a sourced fact). It stands in for "finished" and "binned": a leftover leaves the terminal when its date passes, whether or not anyone said so. It cannot stand in for "froze it", because frozen leftovers keep months instead of days [FSIS], nor for a count of portions.
- **Labels and portions.** AESAN advises dividing meals into portions and marking frozen containers with the food and its freezing date [AESAN]. The FSA suggests portions for faster cooling and "planning for future meals" [FSA]. Ovie's LightTags count down on the container itself: one press per day of life, then a teal, yellow or red light, at $110 for six [OVIE]. Grocy can drive a label printer, off by default [G-config]. Camera fridges see only part of what is inside ([software-prior-art.md](./software-prior-art.md#5-commercial-products)).

## Options

Each option is an input evey could take or a rule it could apply. They combine: option 8 extends option 7, and the rest stand alone. Options 6 and 9 count portions, so they need servings in the [Recipe data model](https://github.com/gariasf/evey/issues/16).

**Thursday** is the test case of [Pantry and leftovers: what evey knows without asking for discipline](https://github.com/gariasf/evey/issues/17): six portions of a curry are cooked in a session on Sunday, and nothing is logged all week.

| # | Option | Owner's weekly effort | If the input is skipped | What the terminal still shows | Thursday |
|---|---|---|---|---|---|
| 1 | Staples assumed in stock until flagged out | One press when a staple runs out | The staple stays in; can cook now may offer a dish that needs it | Can cook now and one item away, from staples and known fresh food | Still counts any staple that ran out midweek |
| 2 | Shopping-list ticks record what was bought | None beyond shopping with the list | Food bought off the list is unknown | Staples, and the plan's food if evey assumes it was bought | Fresh food ticked at the weekend, with its age |
| 3 | Fresh food ages out after a default shelf life | None; a correction when a default is wrong | An item eaten early stays until its date; one that lasts longer leaves early | Fresh food with its age | Fresh food whose default ran out since the weekend has left |
| 4 | "Used the last of…" at a session's end, nothing ticked | A glance per session; a press when something ran out | Nothing leaves the pantry, as in option 1 | As option 1 | Whatever was ticked on Sunday stays out |
| 5 | Receipts record what was bought | A photo or forward per shop, and fixing unmatched lines | As option 2 | As option 2 | As option 2, plus food bought off the list |
| 6 | Booked quantities with barcode scans (Grocy's model) | Every purchase and every use, and recounts | Counts drift both ways; restarting takes a full recount | Counts, right or wrong | "Curry: 6 portions" until eaten ones are booked |
| 7 | A leftover made at a session's end, aged out at its eat-by date | None | Cooked without a session: no leftover appears | Each leftover with its day cooked and eat-by date | "Curry, cooked Sunday: eat today" with a 4-day keep time; gone with 3 days or 48 hours |
| 8 | Option 7, plus "finished" and "froze it" presses | Up to two optional presses per dish | As option 7 | As option 7, plus a freezer list | As option 7, unless "froze it" moved it to the freezer list |
| 9 | Portions eaten down, one press each | A press per portion: six for this curry | The count stays at six | A count that only falls with presses | "Curry: 6 portions", true or not |
| 10 | Sensing at the fridge: a camera, or timer tags on containers | Camera: none. Tags: a press per container | Tags: an untagged box goes unseen | A photo, if it reads in 1-bit; tags show on the box, not the terminal | A photo shows the curry if it is in view |

### 1. Staples assumed in stock until flagged out

evey counts every staple as in the pantry until the owner flags it out with one press, on the terminal or in the backoffice. Ticking it on the shopping list brings it back. A missed flag costs a surprise at the cupboard and breaks nothing else. Tandoor's `ignore_shopping` foods and Grocy's "only check if any amount is in stock" do this ([software-prior-art.md](./software-prior-art.md)), and so does Cooklang's `unlim` [CC-pantry]. It is the "lowering the data granularity" workaround [CH17].

### 2. Shopping-list ticks as the purchase record

Ticking an item at the shop puts its food in the pantry, dated that day. It asks nothing extra when the owner shops from evey's list, which is read on the phone at the shop ([Terminal concept](https://github.com/gariasf/evey/issues/12)). A tick says nothing about amounts, and food bought off the list stays unknown. Tandoor ships this as "Auto On Hand", off by default [T-models], [T-en]. Grocy books each item with an amount [G-shop], and Mealie and KitchenOwl users ask for it [M-2448], [K-1032]. A design suggestion, not a sourced fact: with nothing ticked, evey could assume the plan's list was bought on the shopping day.

### 3. Fresh food ages out after a default shelf life

Each fresh ingredient leaves the pantry when its default shelf life ends, with no press, so its error never outlasts the shelf life. FoodKeeper is a ready table under CC0, though its figures are US guidance [FK], [FK-cat]. Fridge Pal's defaults could not be edited and gave a goat's cheese more than 100 days; the authors suggest automatic dates with a manual override [FW15]. EatChaFood's three bands are one way to show age [FW15].

### 4. "Used the last of…" at the end of a session

The session's last screen lists the pantry ingredients it used, none ticked, and ticking one takes it out of the pantry. Skipped, nothing changes, and option 1's failure applies. Mealie's open proposal also ticks nothing by default [M-8952], and a comment on it shows why clearing foods after cooking misleads: a recipe that uses one egg does not finish the box [M-8951]. Grocy books exact amounts instead, which only works while its counts are right [G-svc].

### 5. Receipts

A photo of a paper receipt, or an electronic receipt, records what was bought, including food bought off the list. It costs a photo or forward per shop, plus fixing the lines evey cannot match. Paper receipts cover every shop but can get lost; automatically captured records cannot, but in research they "typically represent a single retailer" [STRIDE]. Fridge Pal's users suggested receipt scanning [FW15], and Tandoor's shopping roadmap lists saving receipts as an idea [T-4375]. Like a tick, a receipt records what came in, never what was used.

### 6. Booked quantities with barcode scans

This is Grocy's model: every purchase and every use is booked with an amount, and can cook now compares amounts ([software-prior-art.md](./software-prior-art.md)). A barcode speeds up naming a product, not the booking. Open Food Facts is large [OFF], but GS1 UK says in-store codes for weighed items should stay within one retail chain [GS1UK], and a Fridge Pal user lost interest when products went unrecognised [FW15]. A skipped booking makes counts drift, and in the food-journal study missed entries led people to give up altogether [CO15]. Grocy users ask for a recount workflow [G-1988], and waited from 2019 to 2025 to consume a recipe without exact counts [G-386], [G-23d7].

### 7. A leftover made at a session's end, aged out at its eat-by date

A session ends when the leftovers are put away ([GLOSSARY.md](../../GLOSSARY.md)), so evey knows the dish and the day without asking. The eat-by date can come from the recipe's keep time, one of the project's labelled additions, with an agency figure as the fallback: 3 to 4 days [FSIS], [FK] or 48 hours [FSA]. It errs two ways: a curry finished on Wednesday still shows on Thursday, and portions frozen on Sunday vanish when the fridge date passes. Grocy's produced product with a default due date is the same idea behind an explicit press ([software-prior-art.md](./software-prior-art.md)).

### 8. Option 7, plus "finished" and "froze it"

Two optional presses fix option 7's errors. "Finished" removes the leftover, and "froze it" moves it to a freezer list with a quality date: FSIS gives 3 to 4 months and calls frozen leftovers safe indefinitely [FSIS], and FoodSafety.gov says its freezer times "are for quality only" [FS-chart]. Skipped, it behaves exactly as option 7. AESAN's advice to mark frozen containers with the food and the date is the paper version [AESAN], and Ovie's LightTags a hardware one, at a press per day of life [OVIE].

### 9. Portions eaten down

The leftover carries a count, six here, and each portion eaten is a press. It is the only option that knows how much is left. It is also the only leftover option whose skipped input shows something false, unless option 7's age-out runs as well. Grocy books one unit per serving [G-svc]. Portions are where food journallers struggle ("I only eat some of what I make at a time") [CO15], and Fridge Pal sent one participant reminders "for something I have already eaten" [FW15].

### 10. Sensing at the fridge

A camera needs no input but costs hardware money, which is a roadmap decision. Three of FridgeCam's five households often forgot it existed when its photos lived on a web page, and visits fell over the month [GA14]. Camera fridges see only part of what is inside ([software-prior-art.md](./software-prior-art.md#5-commercial-products)). Ovie's tags show freshness on the container, not on the terminal, and still take a press per container [OVIE]. Whether a fridge photo reads at 1-bit was not checked.

## UNVERIFIED

- **Not read.** Clawson et al., "No longer wearing" (UbiComp 2015): the publisher refused access, and only the project page was read, which says it analysed over 1,600 Craigslist advertisements [CL15]. BinCam's findings: only the lab's description was read [BC]. The practice-lens papers by Evans (2012) and by Schanes, Dobernig and Gözet (2018).
- **FridgeCam** results come from Ganglbauer's thesis, which says the chapter was part of the study presented in the TOCHI paper of 2013 [GA14]. The paper itself was not read.
- **FoodKeeper** was read from an Internet Archive copy of 2025-07-02 (data version 128, modified 2018-09-06). The catalog says the dataset was last updated on 2025-01-22 [FK-cat]. Whether the live file differs is unknown. The FSIS leftovers page was read through a copy of 2026-11-19, the FoodSafety.gov chart through a copy of 2026-11-15, and the Food and You 2 chapter, which the live site no longer serves, through a copy of 2026-05-18.
- **AESAN.** No general guidance on how long home leftovers keep was found. Its 2-day figure is for school lunchboxes.
- **Receipts.** How often receipt lines fail to match an ingredient was not researched. Nor was which electronic receipts are available in Spain: the owner's shops stay out of this repo (ADR 0001).
- **Open Food Facts.** The counts are products in the database, not the share of a household's shopping it covers.
- **Barcodes on weighed food.** GS1 UK's rule is for the UK. How Spain codes weighed items was not checked.
- **Ovie** was read from the vendor page only. No study of its use was found.
- **Tandoor.** That cooking does not update the pantry was checked in its API views and signals only.
- **Keep times.** Whether every recipe in the corpus has one was not checked: the corpus is private.

<!-- Sources -->

[LI10]: https://my.eng.utah.edu/~cs5540/au16/readings/PersonalInformatics-Li2010.pdf
[EP15]: https://my.eng.utah.edu/~cs5540/au16/readings/PersonalInformatics-Epstein2015.pdf
[EP16]: https://pmc.ncbi.nlm.nih.gov/articles/PMC5428074/
[CO15]: https://my.eng.utah.edu/~cs5540/au16/readings/PersonalInformatics-Cordeiro2015.pdf
[CH17]: https://users.ece.utexas.edu/~ethomaz/papers/j1.pdf
[CL15]: https://ecl.cc.gatech.edu/node/261

[GA14]: https://repositum.tuwien.at/handle/20.500.12708/3139
[FW15]: https://eprints.qut.edu.au/82295/
[BC]: https://openlab.ncl.ac.uk/research/bincam-designing-for-reflection-and-social-persuasion-to-promote-sustainable-lifestyles
[WRAP]: https://www.wrap.ngo/resources/report/household-food-and-drink-waste-uk-2022

[G-svc]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/services/RecipesService.php
[G-23d7]: https://github.com/grocy/grocy/commit/23d7b6ad3cb94b85b3dd0247618e33953782889c
[G-386]: https://github.com/grocy/grocy/issues/386
[G-1988]: https://github.com/grocy/grocy/issues/1988
[G-2527]: https://github.com/grocy/grocy/issues/2527
[G-config]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/config-dist.php
[G-shop]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/views/shoppinglist.blade.php

[T-models]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/cookbook/models.py
[T-api]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/cookbook/views/api.py
[T-en]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/vue3/src/locales/en.json
[T-signals]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/cookbook/signals.py
[T-4701]: https://github.com/TandoorRecipes/recipes/issues/4701
[T-4738]: https://github.com/TandoorRecipes/recipes/issues/4738
[T-4375]: https://github.com/TandoorRecipes/recipes/issues/4375

[M-shop]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/mealie/services/household_services/shopping_lists.py
[M-8951]: https://github.com/mealie-recipes/mealie/discussions/8951
[M-8952]: https://github.com/mealie-recipes/mealie/pull/8952
[M-2448]: https://github.com/mealie-recipes/mealie/discussions/2448

[K-10]: https://github.com/TomBursch/kitchenowl/issues/10
[K-1032]: https://github.com/TomBursch/kitchenowl/issues/1032

[CC-pantry]: https://github.com/cooklang/cookcli/blob/3804be47b0ce25a3e2bade23a43df4cfd8152413/docs/pantry.md
[CC-api]: https://github.com/cooklang/cookcli/blob/3804be47b0ce25a3e2bade23a43df4cfd8152413/docs/api.md

[STRIDE]: https://pmc.ncbi.nlm.nih.gov/articles/PMC10755395/
[OFF]: https://world.openfoodfacts.org/api/v2/search?page_size=1&fields=code
[OFF-es]: https://world.openfoodfacts.org/api/v2/search?countries_tags_en=spain&page_size=1&fields=code
[GS1UK]: https://gs1uk.org/support-training/help-to-use-and-implement-gs1-standards/barcode-variable-measure-items

[FSIS]: https://web.archive.org/web/20261119141358/https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety
[FS-chart]: https://web.archive.org/web/20261115073039/https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts
[FK]: https://web.archive.org/web/20250702182320/https://www.fsis.usda.gov/shared/data/EN/foodkeeper.json
[FK-cat]: https://catalog.data.gov/dataset/fsis-foodkeeper-data
[FSA]: https://www.gov.uk/government/publications/student-guide-to-food-safety-and-hygiene/student-guide-to-food-safety-and-hygiene
[FY2]: https://web.archive.org/web/20260518025100/https://www.food.gov.uk/research/fy2-wave-9-chapter-6-eating-at-home
[AESAN]: https://www.aesan.gob.es/dam/jcr:dc0b346e-68f3-46a6-a0cb-41595cfbb2e3/FAMILIAS_COMIDAS_CENTRO_ESCOLAR.pdf
[OVIE]: https://www.ovie.life/
