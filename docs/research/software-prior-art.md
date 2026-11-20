# Software prior art: backoffice, recipe format, device protocol

Checked 2026-11-20. Facts come from source repositories read at the pinned commits linked below, first-party docs, specs and original papers. Anything not confirmed that way is marked UNVERIFIED and collected at the end.

**How strong the evidence is.** Strong for the four recipe managers, Cooklang and TRMNL: all read from source. Medium for recipe-graph research: two papers read in full, one abstract. Thin for commercial products: only Samsung and Google were checked. The research on following recipes while cooking is in a separate file, [ux-cooking-research.md](./ux-cooking-research.md).

## Recommendations

### 1. Backoffice: build your own

Do not adopt one of the existing tools, as-is or as the recipe backend. Copy their patterns instead.

The deciding facts:

- **None of the four stores a step-to-step dependency.** Mealie and Tandoor link a step to ingredients only [M-step], [T-models]. Grocy and KitchenOwl keep the method as one text field [G-recipeform], [K-recipe]. The tabular rendering and the session planner both need that structure, so it would live outside the adopted tool anyway.
- **None has a multi-dish planner with equipment limits.** No such feature appears in any model or doc read here. The nearest thing is Mealie's "tools on hand" filter [M-sugg].
- **The inventory you want is the cheap part.** Mealie and Tandoor answer "can I make this" from presence, not quantities: an on-hand flag per food, or in Tandoor any pantry entry above zero [M-sugg], [T-avail]. That is one table and one query.
- **Grocy's stock model is the only complete one, and it costs upkeep.** An ingredient counts as fulfilled only when the stock amount covers the scaled recipe amount [G-0249], so every purchase and use has to be booked.
- **Licences favour copying ideas, not code.** Grocy is MIT [G-repo]. Mealie and KitchenOwl are AGPL-3.0 [M-repo], [K-repo]. Tandoor is AGPL-3.0 plus the Commons Clause [T-license].

What to copy:

| From | Pattern | Source |
|---|---|---|
| Tandoor | "Make now" takes a number of allowed missing foods, so "one ingredient away" is the same query with 1 | [T-search], [T-managers] |
| Tandoor | Staples: foods flagged `ignore_shopping` count as available | [T-managers] |
| Grocy | A third state: "not enough in stock, but already on the shopping list" | [G-recipes-view] |
| Grocy | `due_score`: rank recipes by how much expiring stock they use | [G-0247] |
| Grocy | Leftovers: cooking a recipe books its "produced product" into stock with a default due date | [G-recipes-svc], [G-stock-svc] |
| Grocy | `GET /system/db-changed-time` as a cheap "has anything changed" poll for the device server | [G-api] |
| Mealie | LLM import in separate passes, with numbered references that are range-checked | [M-enrich] |
| CookCLI | `pantry plan`: which ingredient unlocks the most recipes | [CC-pantry-src] |

One fallback is worth keeping open. If you later want barcode scanning and exact quantities, Grocy can sit beside your system as a stock service: REST with an OpenAPI file, an API-key header, and custom "userfields" on its entities [G-api]. Its recipes cannot hold your tree, so only stock would live there.

### 2. Recipe format: your own JSON

Store the step tree as your own JSON with stable step ids. Treat Cooklang as an export format at most.

The deciding facts:

- **The Cooklang spec has no way to reference a step's output.** Its feature list is ingredients, steps, comments, metadata, cookware, timers, notes, sections, short-hand preparations, references to other recipe files, and optional items [C-spec].
- **The reference Rust parser has an extension for it, with limits.** `@&(~1)dough{}` means "whatever was prepared one step back" [C-ext]. References are positional (step number or offset), "only past steps from the current section can be referenced", and "text steps can't be referenced" [C-ext]. A step in one section cannot name a specific step in another.
- **The official CLI turns that extension off.** CookCLI builds its parser with `Extensions::empty()`, documented as "no extensions" [CC-parser]. The WASM package for JavaScript turns every extension on [C-wasm]. A file using step references would parse differently in the two.
- **Cooklang's pantry matching is by name only.** "No unit or quantity is considered" [CC-pantry-src]. Shelf names, shop routing and staple flags would still need your own dictionary.
- **Structured output can be checked in code after an LLM import.** Mealie's importer asks the model for numbered references and range-checks them [M-enrich]. Free-text Cooklang would need parsing first.

What Cooklang does cover, and what is worth mirroring in your schema: inline timers, inline cookware, sections, linear scaling with a fixed-quantity marker (`=`), and timers that do not scale [C-spec], [C-conv].

Schema guidance follows in [What this means for the schema and the import step](#what-this-means-for-the-schema-and-the-import-step). It is a design suggestion, not a sourced fact.

### 3. Device protocol: copy TRMNL's contract, add button identity

See [Protocol patterns to copy](#protocol-patterns-to-copy). In short: the device pulls, one request returns the image name and the next sleep interval, and the image is re-downloaded only when its name changes [TR-byos]. TRMNL has one button, so it has no way to say which button was pressed. A step-by-step terminal needs that added.

### 4. UX findings

Already written up: [ux-cooking-research.md](./ux-cooking-research.md). Its top findings are to put quantities inside the step, never show a step alone, keep all timers on one screen, hold steps to one main action, and need as few button presses as possible.

## 1. Open-source recipe and kitchen managers

| | Grocy | Mealie | Tandoor | KitchenOwl |
|---|---|---|---|---|
| Method | One "Preparation" text field | Step records | Step records | One Markdown description |
| Step to ingredient links | No | Yes | Yes | Inline `@ingredient` pills |
| Step to step links | No | No | No | No |
| Sub-recipes | Included recipes with servings | Ingredient can reference a recipe | Step can embed a recipe | Not found |
| Scaling | Desired over base servings | Recipe scale; per-meal servings | Servings; scale to one ingredient | Not checked |
| Step timer | No | Duration stored and shown | Minutes, with a countdown | No |
| Equipment | Separate list, not linked to recipes | Tools per recipe; tools on hand | No model found | No model found |
| Inventory | Quantities, due dates, opened state, locations | On-hand flag per food | On-hand flag, plus pantry entries with amount and expiry | None |
| Can make now | SQL view, quantity-based | Recipe Finder, max missing | `makenow`, allowed-missing count | None |
| Leftovers | Produced product with due date | Meal-plan note | Pantry expiry dates | None |
| Shopping by store | Default store per product | Labels | Supermarkets with category order | Ordered categories |
| Meal plan | Yes | Yes | Yes | Yes |
| Import | None found in core | URL scraper; LLM from URL, text, photos, video | URL; LLM from image, PDF, text; app importers | URL scraper; LLM ingredient parsing |
| API | REST, OpenAPI file, API key | REST, live docs, long-lived tokens | REST, OpenAPI, OAuth2 tokens | REST, OpenAPI, JWT; MCP server |
| Stack | PHP 8.5, SQLite | Python (FastAPI), one container | Django, Postgres for production | Python backend, Dart apps |
| Licence | MIT | AGPL-3.0 | AGPL-3.0 + Commons Clause | AGPL-3.0 |
| Latest release | v4.7.1, 2026-09-04 | v3.31.0, 2026-11-13 | 2.7.6, 2026-11-18 | v0.8.1, 2026-11-08 |
| Last commit read | 2026-11-13 | 2026-11-20 | 2026-11-19 | 2026-11-13 |

Release dates and licences are from each repository's GitHub metadata [G-repo], [M-repo], [T-repo], [K-repo].

### Grocy

- **Recipe model.** A recipe has a name, a description, servings and ingredient rows. Recipes nest through `recipes_nestings` [G-0025], [G-0043]. The form labels the description "Preparation" [G-recipeform]. No step table exists.
- **Equipment and meal plan.** Equipment is its own table (name, description, manual file) with no link to recipes. The meal plan table holds a day, a recipe or product or note, and servings [G-migrations].
- **Import.** No recipe importer was found in the controllers, services or views at this commit [G-tree].
- **Can make now.** The view `recipes_pos_resolved` computes, per ingredient, `need_fulfilled`, `missing_amount` and `need_fulfilled_with_shopping_list` from current stock, after scaling by desired over base servings [G-0249]. `recipes_resolved` rolls these up per recipe with `missing_products_count` and `due_score` [G-0247]. The API exposes it at `GET /recipes/fulfillment` [G-api].
- **Staples.** An ingredient row can be set to "Only check if any amount is in stock" or "Disable stock fulfillment checking for this ingredient" [G-recipeposform].
- **Due score.** "The higher this number is, the more ingredients currently in stock are due soon, overdue or already expired" [G-recipes-view].
- **Leftovers.** A recipe can name a product it produces: "one unit (per serving in stock quantity unit) will be added to stock on consuming this recipe" [G-recipeform]. The stock service sets "the default due date, if none is supplied" [G-stock-svc].
- **Shopping.** Products carry a default store, and the list can be grouped by "Default store" or "Product group" [G-shoplist-view].
- **API.** "Authentication is done via API keys (header GROCY-API-KEY or same named query parameter)" [G-api]. Stock endpoints cover add, consume, open, transfer, inventory and by-barcode variants [G-api]. No event webhook exists; the only webhook setting is for a label printer [G-config].
- **Footprint and upkeep.** "PHP 8.5 (with SQLite 3.40+)", described as "a hobby project by Bernd Bestel" [G-readme].

### Mealie

- **Step model.** `RecipeStep` has `title`, `summary`, `text`, `ingredient_references`, `note_references` and `duration_seconds` [M-step]. Nothing points at another step.
- **Sub-recipes.** An ingredient can carry a `referenced_recipe` [M-ingr].
- **Scaling and equipment.** "Each recipe on your meal plan has its own serving size." Tools are a recipe-level organiser, "like a pressure cooker or a sous vide" [M-features].
- **Shopping.** Lists are grouped by labels: "You may want to Label by Food Type (Frozen, Fresh, etc), by Store, Tool, Recipe, or more" [M-features].
- **Timer.** The duration is stored and displayed. No countdown component was found in the frontend components at this commit [M-instr-vue].
- **Recipe Finder.** "Search for recipes based on ingredients you have on hand... and set a maximum number of missing ingredients or tools" [M-lang]. The query counts ingredients whose food is neither selected, on hand, nor covered by a substitution, and keeps recipes at or under `max_missing_foods`, default 5 [M-sugg], [M-sugg-schema]. Ingredients with no linked food are skipped, and quantities are ignored [M-sugg]. The food filter only runs when at least one food id is passed [M-sugg].
- **On hand** is a flag per food per household: it "will make this food unchecked by default when adding a recipe to a shopping list" [M-lang].
- **No stock or expiry.** No pantry, stock or best-before model exists [M-models]. Leftovers are a meal-plan note: "This is great for leftovers, or for ordering out" [M-features].
- **Import.** "Import with AI" builds a recipe from "pasted text, HTML, or JSON, photos of a recipe, a link, or any combination of them", and "works with any OpenAI-compatible API" [M-ai].
- **Step enrichment.** A separate LLM pass links each step to the ingredients it uses and extracts a stated duration. It is separate "so that smaller models only have one job per request" [M-enrich]. The prompt says: "Only link an ingredient when the step uses it, whether by name or by a clear reference to it such as 'the dry ingredients'" [M-enrich-prompt]. Returned numbers are mapped back "dropping duplicates and numbers out of range" [M-enrich].
- **API.** Long-lived tokens are created at `/user/profile/api-tokens`, with interactive docs at `/docs` [M-api]. Webhooks are scheduled, "sent on the day of a scheduled meal plan"; event notifications go through Apprise [M-features].
- **Footprint.** One container, SQLite or Postgres. SQLite is "the ideal choice for Mealie when you have 1-20 Users", and the example compose file sets a 1000M memory limit [M-sqlite].

### Tandoor

- **Step model.** `Step` has `instruction`, `ingredients` (many-to-many), `time`, `order` and `step_recipe` [T-models]. A step can embed another recipe, and a food can point to a recipe. No step refers to another step, and the file has no equipment model.
- **Scaling and meal plan.** Recipes and meal-plan entries carry `servings` [T-models]. Release 2.4.0 added "scale recipe to specific ingredient amount" [T-rel-240].
- **Timer.** A step with a time shows a button that starts a countdown of `step.time * 60` seconds [T-stepview].
- **Pantry.** Added in 2.6.0 (2026-03-26): "configure multiple locations (freezer, shelf, ...) where you book foods in, out and inbetween" and "track expiry dates for different foods". The same notes say "integrations with shopping/planning and cooking are planned for the future" [T-rel-260]. The models are `InventoryLocation`, `InventoryEntry` (amount, unit, food, `expires`) and `InventoryLog` [T-models].
- **Make now.** A food is available if a household member has it on hand, or a pantry entry has an amount above zero [T-avail]. Substitutes and `ignore_shopping` foods also count [T-managers]. Recipes pass when `missing_foods <= missing` [T-managers].
- **Allowed-missing count.** The API documents `makenow` as a boolean, but the parser maps true to 0 and otherwise calls `int(value)` [T-search].
- **Shopping.** "It also includes automatic supermarket specific ordering" [T-shopping].
- **Import.** URL import reads `ld+json` or microdata [T-index]. AI is used for "importing recipes from images, PDFs, or raw text" and "sorting recipe steps and assigning ingredients to steps", routed through LiteLLM [T-ai]. Importers exist for about two dozen other apps and formats, Mealie and Cooklang among them [T-import].
- **API.** Django REST Framework with OAuth2 token and session authentication. The schema is served at `/openapi/` and docs at `/docs/api/` [T-settings], [T-urls]. Basic auth was removed in 2.6.0 [T-rel-260].
- **Footprint.** "Production should always use postgresql" [T-config].

### KitchenOwl

- **Recipe model.** A recipe has a name, a Markdown description, times, `yields` and a list of items [K-recipe]. Steps live inside the description. "Ingredient pills allow you to reference ingredients from inside your recipes' description" [K-md].
- **No inventory.** No stock or pantry model exists [K-models].
- **Shopping and planning.** Item categories carry an `ordering` per household [K-models]. The README lists "Create a meal plan" among its features [K-readme].
- **API.** "A REST API to interact with recipes, shopping lists, households, planner, and items", with JWT bearer tokens from `POST /api/auth` [K-api]. An MCP server ships with it and is "disabled by default" [K-mcp].
- **Import.** Scraping works for supported sites only; "anything else returns an 'Unsupported website' error" [K-mcp]. An optional LLM handles ingredient parsing and recipe generation [K-ingr].
- **Maturity.** The README says: "Please keep in mind that this project is still in development" [K-readme].

### Other projects, not evaluated

Only repository metadata was checked: Norish (AGPL-3.0, v0.26.1-beta, 2026-11-05) [X-norish], RecipeSage (v4.1.6, 2026-11-14) [X-recipesage], Nextcloud Cookbook (AGPL-3.0, v0.11.12, 2026-10-13) [X-nc], Recipya (GPL-3.0, nightly 2026-11-02) [X-recipya], and Barcode Buddy for Grocy (AGPL-3.0, v1.9.0.1, 2026-09-25) [X-bb]. Their features are UNVERIFIED.

## 2. Cooklang

- **Core syntax.** "Each paragraph in your recipe file is a cooking step." Ingredients are `@name{qty%unit}`, cookware `#pot{}`, timers `~{25%minutes}`, sections `== Filling ==`, and sub-recipes are file references such as `@./sauces/Hollandaise{150%g}` [C-spec].
- **Scaling.** Linear by servings. `=` locks a quantity. Timers and cookware do not scale [C-conv].
- **Step outputs.** Not in the spec. The Rust parser's "intermediate preparations" extension adds `@&(~1)name{}` (one step back), `@&(2)name{}` (step 2), `@&(=2)name{}` (section 2) and `@&(=~2)name{}` (two sections back) [C-ext]. The parsed model records whether a reference targets an ingredient, a step or a section [C-model].
- **Extensions are opt-in per tool.** In the library, `Extensions::default` "enables all extensions" [C-lib]. CookCLI passes none [CC-parser].
- **JavaScript parser.** `@cooklang/cooklang` is the Rust parser compiled to WASM. Version 0.19.1 was published 2026-10-15 under MIT [C-npm]. The older native package `@cooklang/cooklang-ts` is deprecated in favour of it [C-npm-ts], and its repository is archived [C-org].
- **Pantry file.** `pantry.conf` is TOML with a section per storage place and optional `quantity`, `low`, `bought` and `expire` per item [C-conv].
- **Pantry commands.** `cook pantry recipes` lists "recipes that can be made with items currently in pantry", with `--partial --threshold <percent>` for near matches. `expiring`, `depleted` and `plan` also exist [CC-pantry].
- **How matching works.** By lowercased name only; optional ingredients and references to other recipes are ignored [CC-pantry-src].
- **Shopping by store.** `aisle.conf` groups ingredients under arbitrary headings, which can be shops such as `[Costco]` and `[Tesco]` [C-conv].
- **CookCLI server.** A web UI plus a JSON API for recipes, menus, plans, shopping list, pantry, aisles and search [CC-api]. It listens on localhost port 9080 unless `--host` is given [CC-server]. Authentication is "off unless the server has a users file" [CC-api].
- **Import.** `cook import <URL>` "requires the `OPENAI_API_KEY` environment variable for conversion to Cooklang" [CC-import].
- **Maturity and licence.** Spec, parser and CLI are MIT. CookCLI is at v0.41.1 (2026-11-09) and cooklang-rs at v0.19.0 (2026-09-30) [C-org]. The older Swift, Python, C and Kotlin parsers are archived [C-org].

## 3. Recipe data formats and representations

### schema.org/Recipe

- `recipeIngredient` is "an ingredient or ordered list of ingredients and potentially quantities", as text or a structured value [S-ri].
- `recipeInstructions` is "a single item... or an ordered list with HowToStep and/or HowToSection items" [S-rins].
- A `HowToStep` is "an ordered list with HowToDirection and/or HowToTip items" [S-step].
- No property links an ingredient to a step [S-recipe]. `HowToDirection` does have its own `supply`, `tool` and time properties [S-dir]. This was read through a fetch summary, not the raw page.
- Use it as the import interchange format. It is what Mealie and Tandoor ingest [M-ai], [T-index].

### Open Recipe Format

Ingredients are "listed in the order in which they are to be used", and steps are "a list, in order" with optional notes and HACCP fields. Steps do not reference ingredients [ORF]. The last commit was 2021-01-19 [ORF-repo].

### Cooking for Engineers tabular notation

UNVERIFIED. The site returned gateway time-outs on 2026-11-20. Search snippets from the site suggest the notation is Michael Chu's and was labelled "patent pending" around 2005. They describe ingredients listed down the left with brackets to the right naming the action applied. Confirm the rules and any reuse terms on the site before copying the layout closely.

### Recipe flow graphs (Mori et al.; Yamakata, Mori and Carroll, LREC 2020)

Read in full [RFG].

- "A flow graph is a directed acyclic graph (DAG) with a single root. Graph nodes are r-NEs and labelled edges represent the relationships between these nodes."
- **Node types:** F food ("eatable; also intermediate products"), T tool, D duration, Q quantity, Ac action by chef, Af action by food, At action by tool, Sf food state, St tool state. Ac2 marks the second part of a split action.
- **Edge labels:** Agent, Targ (direct object), Dest (indirect object, container), t-comp (tool used), F-comp (food used as a tool), F-eq (same food), F-part-of (part of a food), F-set (set of foods), T-eq, T-part-of, A-eq, V-tm (timing), other-mod.
- **Corpus:** 300 English recipes.
- **Agreement between annotators:** 90.5 F1 on entities and 82.3 F1 on graph edges.
- **Automatic accuracy:** 87.5 F1 on entities and 71.1 F1 on edges.
- **Availability:** the corpus is published by the authors' lab [RFG-data]. Its licence is UNVERIFIED.

### MILK and CURD (Tasse and Smith, CMU, 2008)

Read in full [MILK].

- **Commands:** `create_ing`, `create_tool`, `combine`, `separate`, `put`, `remove`, `cut`, `mix`, `cook`, `do`, `serve`, `set`, `leave`, `chefcheck`.
- **Every transforming command makes a new named ingredient.** `combine(ingredient set ins, ingredient out, string outdesc, string manner)` "results in the deletion of ing0 and ing1 and the creation of the ingredient (ing2, 'mixed fruit')".
- **`separate`** deletes one ingredient and creates two, which models by-products.
- **`serve`** is used "at the end of a recipe on every remaining ingredient".
- **`chefcheck`** models an "until" condition, such as "saute onions until transparent".
- **`set`** acts on a tool only, such as setting an oven to 350 degrees.
- **Size.** The report says 300 recipes were annotated. The dataset page says CURD 1.0 holds 260 and gives no licence [CURD].

### LLMs and parallel plans

Lin et al. (ICML 2024, abstract only) report that LLMs including GPT-4 "behave poorly" at asynchronous planning when given no illustration of the solving process. They "still suffer from drastic degradation when task complexity increases", even with the paper's graph-based prompting [ASYNC].

### What this means for the schema and the import step

These are design suggestions drawn from the sources above.

- **Give every step one named output.** Inputs then refer to an ingredient id or a step id. This is MILK's `out, outdesc`, and the flow graph's F nodes include intermediates.
- **Allow a portion on any input.** "Half the dough" and reserved pasta water are the F-part-of and `separate` cases.
- **Allow named groups** such as "the dry ingredients" (F-set). Mealie's prompt treats that phrase as a valid link.
- **Allow steps with no food input**, attached to equipment, for cases like preheating (MILK `set`).
- **Store a done-condition** next to the timer (MILK `chefcheck`).
- **Validate imports structurally.** Exactly one root. No cycles. No reference to a later step. Every ingredient and every output consumed exactly once unless a portion is given. Every reference id in range.
- **Expect to review dependencies by hand.** Trained annotators agree on only 82.3 F1 of the edges.
- **Split the LLM work into passes**, as Mealie does: extract the recipe first, then link steps.
- **Do not ask the LLM to schedule the session.** Compute the plan from the graph.

## 4. Thin-client e-paper prior art

### TRMNL

**Architecture.** "Your TRMNL device pings our server, never the other way around." The device wakes, requests content, draws it, "then goes to sleep for the instructed amount of time" [TR-how].

**Endpoints.** A self-hosted server needs three: `GET /api/setup`, `GET /api/display` and `POST /api/log` [TR-byos], [TR-fw-readme].

- **Setup** trades the MAC address (header `ID`) for an API key. It returns `status`, `api_key`, `friendly_id`, `image_url` and `message` [TR-byos].
- **Display** returns `status`, `image_url`, `filename`, `refresh_rate`, `reset_firmware`, `update_firmware`, `firmware_url`, `special_function`, `maximum_compatibility` and `temperature_profile` [TR-byos].
- **Request headers** on display include `ID`, `Access-Token`, `Refresh-Rate`, `Battery-Voltage`, `FW-Version`, `Model`, `Image-Cached`, `Wake-Time`, `Reset-Reason`, `RSSI`, `Width` and `Height` [TR-fw-hdr].

**Scheduling.** `refresh_rate` is "seconds to sleep before the next request". It must be a number: "the firmware reads a string as 0 and wakes again at once" [TR-byos]. The hosted service allows 5 minutes to 24 hours [TR-how]. Status `202` means "not registered yet" and the device polls again in a few seconds [TR-byos].

**Caching.** "The device saves each new image to flash under its `filename`. When a response names a file it already has, it shows that copy and downloads nothing." The recommended name is `<name>-<id>-<unix time>`, at most 31 characters [TR-byos].

**Images.** The decoder is chosen from `Content-Type`: `image/png`, `image/jpeg`, and anything else is read as BMP [TR-byos].

| Model | Size | Greys | Formats | Largest file |
|---|---|---|---|---|
| TRMNL OG | 800x480 | 2 or 4 | PNG, JPEG, 1-bit BMP | 90,000 bytes |
| TRMNL X | 1872x1404 | 16 | PNG, JPEG | 750,000 bytes |

A capabilities list for every model is published at `trmnl.com/api/models` [TR-img]. The docs give ImageMagick commands for 1-bit, 2-bit and 4-bit PNGs, with and without Floyd-Steinberg dithering [TR-img].

**Buttons.** The original device has one. A short press wakes and refreshes. A double-click runs the "special function". Holding 5 to 15 seconds forgets Wi-Fi, and 15 seconds or more wipes credentials [TR-fw-readme]. On a double-click the request carries a `special_function` header [TR-fw-hdr]. The function is a server setting, one of `none`, `identify`, `sleep`, `add_wifi`, `restart_playlist`, `rewind`, `send_to_me` or `guest_mode` [TR-byos].

**Failure handling.** API retries run at 15, 30 and 60 seconds, then every 5 minutes. Wi-Fi retries run at 60 and 180 seconds, then 300 [TR-fw-ri]. On a timer wake the device stays quiet for up to 12 failed tries before showing an error [TR-fw-readme].

**OTA.** `update_firmware` true plus a `.bin` URL in `firmware_url` triggers an update. Builds are per model [TR-byos].

**Two hazards for a self-hosted server.** An unknown token on the hosted API returns `reset_firmware: true`, which the firmware reads as "erase WiFi credentials + API key" [TR-screens]. `maximum_compatibility: true` "turns off fast refresh" [TR-byos].

**Firmware.** GPL-3.0, release v1.8.19 on 2026-11-13, last commit 2026-11-19 [TR-fw]. Build targets include `trmnl` (the default), `TRMNL_X`, `trmnl_gen2`, `seeed_xiao_esp32c3`, `seeed_xiao_esp32s3`, `TRMNL_7inch5_OG_DIY_Kit`, `seeed_reTerminal_E1001`, `seeed_reTerminal_E1002`, `WAVESHARE_397`, `xteink_x4` and `esp32dev` [TR-fw-pio].

**Server implementations listed in the docs** [TR-byos]:

| Server | Stack | Licence | Last activity |
|---|---|---|---|
| Terminus (flagship) | Ruby, Hanami | MIT | Pushed 2026-11-20 |
| LaraPaper | PHP, Laravel | MIT | 0.48.0, 2026-11-19 |
| Kuroshiro | Next.js | MIT | v0.25.0, 2026-11-16 |
| BYOS Next.js | Next.js | MIT | v0.2.15, 2026-06-24 |
| BYOS Phoenix | Elixir | MIT | Pushed 2026-08-14 |
| Inker | JavaScript | Not detected | 0.6.0, 2026-07-30 |
| BYOS FastAPI | Python | Not detected | Pushed 2026-08-07 |

Licence and activity are from GitHub metadata for each repository [TR-org].

**Bring your own device.** A one-time licence per device connects other hardware to the hosted service. Supported hardware includes Inkplate boards, Kindles and Kobos [TR-byod].

### Other systems, briefly

- **ESPHome `online_image`.** Decodes BMP, JPEG, PNG and QOI. `update_interval` defaults to `never`. "Caching follows standard HTTP mechanisms... utilizing the `Last-Modified` and `ETag` headers", and `on_download_finished` receives a `cached` flag [E-oi].
- **ESPHome e-paper.** Several panels, including the Waveshare 7.5in V2 and the Seeed reTerminal E1001, support "partial refresh via `full_update_every`" [E-epaper].
- **Inkplate examples.** `Inkplate10_Show_Pictures_From_Web` downloads BMPs with `drawBitmapFromWeb` and offers dither and invert options [I-web]. "Partial update works only in 1-bit (black & white) mode", "a full refresh every 5-10 partial updates is recommended", and the screen must be rebuilt after deep sleep before a partial update [I-partial]. The library is LGPL-3.0 [I-repo].
- **OpenEPaperLink.** Tags check in with an access point "once every 40 seconds", and "it's not possible to make the tag react in real time. Most of the time, the delay will be about 40-60 seconds" [O-timing]. Content is pushed to the access point by HTTP POST to `/imgupload` with `mac` and `dither` [O-upload]. The licence is CC BY-NC-SA 4.0 [O-lic].
- **Seeed reTerminal E1001.** Seeed's page says it "natively supports our SenseCraft Seeedash no-code UI platform... while supporting Home Assistant, TRMNL E-ink dashboard, Arduino and ESP-IDF". The refresh button "manually refreshes the display and checks for new content from the SenseCraft platform" [SE]. Two more buttons page backward and forward, per a fetch summary of the same page. The page does not describe the device protocol.

### Protocol patterns to copy

1. **The device pulls; the server never calls the device** [TR-how].
2. **One request per wake returns the image reference and the next sleep interval.** The server owns the schedule [TR-byos].
3. **Name images by content and skip unchanged downloads** [TR-byos]. `ETag` and `Last-Modified` do the same with standard HTTP [E-oi].
4. **Render on the server at the size the device reports, at the panel's native bit depth, under a byte cap.** For 800x480 without PSRAM that is 1-bit or 2-bit PNG under 90,000 bytes [TR-byos], [TR-img].
5. **Send telemetry as request headers**: battery, signal strength, firmware version, wake reason, whether the last image came from cache [TR-fw-hdr].
6. **Provision through a captive portal, then exchange the MAC for an API key** [TR-fw-readme], [TR-byos].
7. **Fail quietly, then loudly.** Keep the last frame through a ladder of retries, show an error after about an hour or on a button press, and post logs to the server [TR-fw-ri], [TR-fw-readme].
8. **Signal firmware updates in the same response** [TR-byos].
9. **Use 1-bit frames with partial refresh for step changes, and a full refresh every 5 to 10 updates** [I-partial], [E-epaper].
10. **Add what TRMNL lacks: button identity.** Its single button can only wake the device or fire one server-defined function [TR-fw-hdr]. A next/back/timer terminal should send the pressed button with the wake request. This is a design suggestion.
11. **Do not use check-in polling for step navigation.** OpenEPaperLink's 40 to 60 second latency shows the cost [O-timing]. Fetch immediately on a button press.

## 5. Commercial products

Only two were checked.

- **Samsung.** "As of April 2025, AI Vision can recognize 37 food items like fresh fruits and vegetables", plus up to 50 packaged items the user has saved. It "cannot identify or list any food items in the fridge door bins or freezer" [SS-us]. A version built with Google Gemini was announced on 2025-12-23 for CES 2026, intended to "recognize more food items" [SS-us]. Even a camera-equipped fridge sees only part of the inventory, which supports a presence-flag model with a staples list over automatic tracking.
- **Google.** The post "Changes we're making to Google Assistant" (2024-01-11) said "some underutilized features will no longer be supported" [GA-blog]. The help-centre list includes: "Access or manage your cookbook, transfer recipes from device to device, play an instructional recipe video, or show step-by-step recipes" [GA-help].

Skylight, Echo Show, restaurant kitchen display systems and pantry-based recipe finders were not researched.

## Surprises

- **Cooklang's step references exist but the official CLI ignores them.** The WASM package enables all extensions and CookCLI enables none [C-wasm], [CC-parser].
- **Tandoor already has "one ingredient away".** `makenow=1` works, although the API documents the parameter as a boolean [T-search].
- **Tandoor gained a real pantry in March 2026**, with locations, expiry dates and a booking log [T-rel-260].
- **Mealie now runs an LLM pass that links steps to ingredients and extracts durations** [M-enrich]. It is the closest existing thing to a structure importer, and it still records no step-to-step links.
- **Trained human annotators agree on only 82.3 F1 of recipe graph edges** [RFG].
- **TRMNL caches by file name, not by HTTP validators**, and a string `refresh_rate` makes the device wake in a loop [TR-byos].
- **TRMNL's firmware builds for Seeed's reTerminal E1001 and E1002** [TR-fw-pio], and Seeed lists TRMNL as supported [SE]. Off-the-shelf hardware can run an open thin-client firmware.
- **Seeed's page now calls its platform "SenseCraft Seeedash".** The string "SenseCraft HMI" does not appear on it [SE].
- **KitchenOwl ships an MCP server** [K-mcp].
- **Google removed step-by-step recipes from Assistant** [GA-help].
- **CURD's size is reported two ways**: 300 recipes in the report, 260 on the dataset page [MILK], [CURD].

## UNVERIFIED

**Formats and research**

- Cooking for Engineers notation: origin, rules and patent status. The site was unreachable.
- Mori et al. 2014 was not read. Its scheme is taken from the 2020 paper that describes it.
- Not read: Kiddon 2015, Jermsurawong and Habash 2015, Malmaud 2014, RecipeScape, Donatelli 2021, Papadopoulos 2022, PizzaCommonSense, Cook2LTL, CaptainCook4D, TimeArena.
- No measured accuracy was found for LLMs extracting step dependencies from recipes.
- The AsyncHow paper was read as an abstract only. Its benchmark size is unknown.
- The licence of the English flow graph corpus.
- schema.org `HowToDirection` properties were read through a fetch summary.

**Recipe managers**

- Grocy: community add-ons for recipe import, and how Barcode Buddy integrates.
- Mealie: which scraper library it uses, and what the Recipe Finder page sends when no food is selected.
- Tandoor: whether cooking a recipe changes the pantry, what "add to pantry" does, and where API tokens are created in the UI.
- KitchenOwl: scaling behaviour, the suggestion algorithm, and any event or webhook output.
- Norish, RecipeSage, Nextcloud Cookbook and Recipya: only metadata was checked.

**Devices**

- TRMNL: partial versus full refresh behaviour in the firmware, the content of `trmnl.com/api/models`, how the TRMNL X touch bar reaches the server, and the feature matrix of each server implementation.
- ESPHome: deep-sleep scheduling and button handling were not checked.
- Inkplate: PNG and JPEG constraints, and greyscale bit depth per board.
- OpenEPaperLink: image specification, JSON template parameters, button and NFC wake reasons, and tag firmware updates.
- Seeed: whether "Seeedash" is a rename of SenseCraft HMI, its refresh-interval settings, its device protocol, whether its firmware source is open, and any self-hosted option. The left and right button functions come from a fetch summary.

**Commercial**

- Skylight Calendar, Echo Show and Alexa+, restaurant kitchen display systems and bump bars, SuperCook, Cooklist and Paprika were not researched.
- Whether Samsung's Gemini-based recognition has shipped, and how its "use by" tracking works.

**General**

- Release dates come from GitHub metadata on 2026-11-20. Repositories without GitHub release objects (Terminus, BYOS FastAPI, BYOS Phoenix) show only a last-push date.

<!-- Sources -->

[G-repo]: https://github.com/grocy/grocy
[G-readme]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/README.md
[G-0025]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/migrations/0025.sql
[G-0043]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/migrations/0043.sql
[G-0247]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/migrations/0247.sql
[G-0249]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/migrations/0249.sql
[G-api]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/grocy.openapi.json
[G-config]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/config-dist.php
[G-migrations]: https://github.com/grocy/grocy/tree/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/migrations
[G-tree]: https://github.com/grocy/grocy/tree/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5
[G-recipes-view]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/views/recipes.blade.php
[G-recipeform]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/views/recipeform.blade.php
[G-recipeposform]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/views/recipeposform.blade.php
[G-shoplist-view]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/views/shoppinglist.blade.php
[G-recipes-svc]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/services/RecipesService.php
[G-stock-svc]: https://github.com/grocy/grocy/blob/146f73af47fe65f806b6eea0ac5f3bee7cb62cb5/services/StockService.php

[M-repo]: https://github.com/mealie-recipes/mealie
[M-models]: https://github.com/mealie-recipes/mealie/tree/d17d11a65ba50a59f106cdb44a4304456bc880d9/mealie/db/models
[M-step]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/mealie/schema/recipe/recipe_step.py
[M-ingr]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/mealie/schema/recipe/recipe_ingredient.py
[M-sugg-schema]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/mealie/schema/recipe/recipe_suggestion.py
[M-sugg]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/mealie/repos/_recipe_suggestions.py
[M-lang]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/frontend/app/lang/messages/en-US.json
[M-instr-vue]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/frontend/app/components/Domain/Recipe/RecipePage/RecipePageParts/RecipePageInstructions.vue
[M-features]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/docs/docs/documentation/getting-started/features.md
[M-ai]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/docs/docs/documentation/getting-started/installation/ai-providers.md
[M-api]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/docs/docs/documentation/getting-started/api-usage.md
[M-sqlite]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/docs/docs/documentation/getting-started/installation/sqlite.md
[M-enrich]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/mealie/services/recipe/import_workflow/steps/enrich_instructions.py
[M-enrich-prompt]: https://github.com/mealie-recipes/mealie/blob/d17d11a65ba50a59f106cdb44a4304456bc880d9/mealie/services/openai/prompts/recipes/enrich-instructions.txt

[T-repo]: https://github.com/TandoorRecipes/recipes
[T-license]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/LICENSE.md
[T-models]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/cookbook/models.py
[T-managers]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/cookbook/managers.py
[T-avail]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/cookbook/helper/food_availability_helper.py
[T-search]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/cookbook/helper/recipe_search.py
[T-urls]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/cookbook/urls.py
[T-settings]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/recipes/settings.py
[T-stepview]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/vue3/src/components/display/StepView.vue
[T-shopping]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/docs/features/shopping.md
[T-ai]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/docs/features/ai.md
[T-index]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/docs/index.md
[T-config]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/docs/system/configuration.md
[T-rel-260]: https://github.com/TandoorRecipes/recipes/releases/tag/2.6.0
[T-rel-240]: https://github.com/TandoorRecipes/recipes/releases/tag/2.4.0
[T-import]: https://github.com/TandoorRecipes/recipes/blob/163ab3216cc0ecc6bd61b0e6e699aefcc07ff946/docs/features/import_export.md

[K-repo]: https://github.com/TomBursch/kitchenowl
[K-readme]: https://github.com/TomBursch/kitchenowl/blob/14d0cf34b2cf5c3acd8f16a1d03e1de77ebc0cac/README.md
[K-models]: https://github.com/TomBursch/kitchenowl/tree/14d0cf34b2cf5c3acd8f16a1d03e1de77ebc0cac/backend/app/models
[K-recipe]: https://github.com/TomBursch/kitchenowl/blob/14d0cf34b2cf5c3acd8f16a1d03e1de77ebc0cac/backend/app/models/recipe.py
[K-api]: https://github.com/TomBursch/kitchenowl/blob/14d0cf34b2cf5c3acd8f16a1d03e1de77ebc0cac/docs/docs/reference/API.md
[K-mcp]: https://github.com/TomBursch/kitchenowl/blob/14d0cf34b2cf5c3acd8f16a1d03e1de77ebc0cac/docs/docs/reference/MCP.md
[K-md]: https://github.com/TomBursch/kitchenowl/blob/14d0cf34b2cf5c3acd8f16a1d03e1de77ebc0cac/docs/docs/Tips-%26-Tricks/markdown.md
[K-ingr]: https://github.com/TomBursch/kitchenowl/blob/14d0cf34b2cf5c3acd8f16a1d03e1de77ebc0cac/docs/docs/self-hosting/ingredient_parsing.md

[X-norish]: https://github.com/norish-recipes/norish
[X-recipesage]: https://github.com/julianpoy/RecipeSage
[X-nc]: https://github.com/nextcloud/cookbook
[X-recipya]: https://github.com/reaper47/recipya
[X-bb]: https://github.com/Forceu/barcodebuddy

[C-org]: https://github.com/orgs/cooklang/repositories
[C-spec]: https://github.com/cooklang/spec/blob/f08832362abec6b16db8eb5ae6b421edd6813989/README.md
[C-conv]: https://github.com/cooklang/spec/blob/f08832362abec6b16db8eb5ae6b421edd6813989/conventions.md
[C-ext]: https://github.com/cooklang/cooklang-rs/blob/80e37bca5ddeffb9bb50074a5a5c700aaa40fcb3/extensions.md
[C-lib]: https://github.com/cooklang/cooklang-rs/blob/80e37bca5ddeffb9bb50074a5a5c700aaa40fcb3/src/lib.rs
[C-model]: https://github.com/cooklang/cooklang-rs/blob/80e37bca5ddeffb9bb50074a5a5c700aaa40fcb3/src/model.rs
[C-wasm]: https://github.com/cooklang/cooklang-rs/blob/80e37bca5ddeffb9bb50074a5a5c700aaa40fcb3/typescript/src/lib.rs
[C-npm]: https://registry.npmjs.org/@cooklang%2fcooklang
[C-npm-ts]: https://registry.npmjs.org/@cooklang%2fcooklang-ts
[CC-parser]: https://github.com/cooklang/cookcli/blob/3804be47b0ce25a3e2bade23a43df4cfd8152413/crates/core/src/parser.rs
[CC-pantry-src]: https://github.com/cooklang/cookcli/blob/3804be47b0ce25a3e2bade23a43df4cfd8152413/crates/core/src/pantry/mod.rs
[CC-pantry]: https://github.com/cooklang/cookcli/blob/3804be47b0ce25a3e2bade23a43df4cfd8152413/docs/pantry.md
[CC-server]: https://github.com/cooklang/cookcli/blob/3804be47b0ce25a3e2bade23a43df4cfd8152413/docs/server.md
[CC-api]: https://github.com/cooklang/cookcli/blob/3804be47b0ce25a3e2bade23a43df4cfd8152413/docs/api.md
[CC-import]: https://github.com/cooklang/cookcli/blob/3804be47b0ce25a3e2bade23a43df4cfd8152413/docs/import.md

[S-recipe]: https://schema.org/Recipe
[S-ri]: https://schema.org/recipeIngredient
[S-rins]: https://schema.org/recipeInstructions
[S-step]: https://schema.org/HowToStep
[S-dir]: https://schema.org/HowToDirection
[ORF]: https://github.com/techhat/openrecipeformat/blob/master/doc/topics/reference/orf.rst
[ORF-repo]: https://github.com/techhat/openrecipeformat
[RFG]: https://aclanthology.org/2020.lrec-1.638.pdf
[RFG-data]: https://sites.google.com/view/yy-lab/resource/english-recipe-flowgraph
[MILK]: https://www.cs.cmu.edu/~nasmith/papers/tasse+smith.tr08.pdf
[CURD]: https://www.cs.cmu.edu/~ark/CURD/
[ASYNC]: https://arxiv.org/abs/2402.02805

[TR-org]: https://github.com/usetrmnl
[TR-fw]: https://github.com/usetrmnl/trmnl-firmware
[TR-fw-readme]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/README.md
[TR-fw-pio]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/platformio.ini
[TR-fw-hdr]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/lib/trmnl/src/api-client/request_headers.cpp
[TR-fw-ri]: https://github.com/usetrmnl/trmnl-firmware/blob/41ca2b220c534a886f63c17c04a3fa777be4e1fa/lib/trmnl/include/refresh_interval.h
[TR-how]: https://github.com/usetrmnl/api-docs/blob/88956c18ff557ef04343affa8fa503298ad3de76/how-it-works.md
[TR-byos]: https://github.com/usetrmnl/api-docs/blob/88956c18ff557ef04343affa8fa503298ad3de76/diy/byos.md
[TR-byod]: https://github.com/usetrmnl/api-docs/blob/88956c18ff557ef04343affa8fa503298ad3de76/diy/byod.md
[TR-img]: https://github.com/usetrmnl/api-docs/blob/88956c18ff557ef04343affa8fa503298ad3de76/diy/imagemagick-guide.md
[TR-screens]: https://github.com/usetrmnl/api-docs/blob/88956c18ff557ef04343affa8fa503298ad3de76/private-api/screens.md

[E-oi]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/image/online_image.mdx
[E-epaper]: https://github.com/esphome/esphome-docs/blob/29393051fc5681109f4888616ec5e3feb4cd8a9c/src/content/docs/components/display/epaper_spi.mdx
[I-repo]: https://github.com/SolderedElectronics/Inkplate-Arduino-library
[I-web]: https://github.com/SolderedElectronics/Inkplate-Arduino-library/blob/3c15d3275bb3b5c0d4b0ea8d79d87a8380a94554/examples/Inkplate10/Advanced/WEB_WiFi/Inkplate10_Show_Pictures_From_Web/Inkplate10_Show_Pictures_From_Web.ino
[I-partial]: https://github.com/SolderedElectronics/Inkplate-Arduino-library/blob/3c15d3275bb3b5c0d4b0ea8d79d87a8380a94554/examples/Inkplate10/Advanced/DeepSleep/Inkplate10_Partial_Update_With_Deep_Sleep/Inkplate10_Partial_Update_With_Deep_Sleep.ino
[O-timing]: https://github.com/OpenEPaperLink/OpenEPaperLink/wiki/Tag-protocol-timing
[O-upload]: https://github.com/OpenEPaperLink/OpenEPaperLink/wiki/Image-upload
[O-lic]: https://github.com/OpenEPaperLink/OpenEPaperLink/blob/812c646420d457daa22e516e1e59f61a3d4ad136/LICENSE
[SE]: https://wiki.seeedstudio.com/getting_started_with_reterminal_e1001/

[SS-us]: https://news.samsung.com/us/samsung-unveil-ai-vision-google-gemini-ces-2026/
[GA-blog]: https://blog.google/products/assistant/google-assistant-update-january-2024/
[GA-help]: https://support.google.com/assistant/answer/13971691
