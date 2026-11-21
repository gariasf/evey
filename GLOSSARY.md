# evey

evey is a kitchen terminal on the fridge door and the backoffice behind it, for cooking in batches at the weekend and eating through the week.

## Language

### The product

**Terminal**:
The dedicated screen on the fridge door that shows recipes, runs sessions and knows what can be cooked now.
_Avoid_: device, screen, display, kiosk

**Backoffice**:
Where recipes, the pantry, leftovers and plans are edited, from a phone or a computer.
_Avoid_: admin, dashboard, web app

**Server**:
What renders the terminal's frames, runs sessions and the conductor, and serves the backoffice.
_Avoid_: backend, hub

**Frame**:
One terminal screen as the server renders it: a 1-bit image at the panel's native resolution.
_Avoid_: screenshot, image, render

### Recipes

**Recipe**:
A dish's ingredients, quantities, steps and notes as its source published them, plus this project's labelled additions.

**Source**:
The published original a recipe is transcribed from, credited and linked from the recipe.

**Corpus**:
Every recipe evey knows. It lives in the private store, never in the public repo.
_Avoid_: library, catalogue, database

**Fixture recipe**:
An invented recipe that stands in for the corpus in tests, examples and screenshots.
_Avoid_: sample recipe, dummy recipe

**Private store**:
Where the corpus and the owner's data live, outside the public repo: the server's database and its off-machine backup.
_Avoid_: private corpus, private repo

**Step**:
One instruction in a recipe. Its inputs are ingredients and the results of earlier steps.

**Step tree**:
The shape a recipe's steps form through their inputs, ending in the finished dish.

**Process grid**:
A recipe's step tree drawn as a table: ingredients down the left, each step a box spanning its inputs, merging rightward into the finished dish.
_Avoid_: flowchart, diagram

**Done-cue**:
What tells the cook a step is finished, such as "until translucent".
_Avoid_: doneness, until-condition

**Addition**:
Something this project adds to a recipe and labels as its own: a batch rating, keep time, shop routing, shelf name, air-fryer note or session ordering.

**Adaptation**:
A labelled change to a recipe so that it keeps a diet rule.

**Diet rule**:
A food the owner's diet excludes. A recipe that breaks one is dropped or adapted.

**Batch rating**:
How well a recipe suits batch cooking: batch hero, batch OK, or cook fresh.

**Keep time**:
How long a recipe's dish keeps once cooked.

### Cooking

**Session**:
Cooking one or more recipes on the terminal, from the first step until the leftovers are put away.
_Avoid_: cook mode, cooking run

**Batch session**:
A session that cooks several recipes together.
_Avoid_: weekend session, prep session

**Conductor**:
What picks the next step across a session's recipes, as the session runs, within the limits of the equipment.
_Avoid_: scheduler

**Step screen**:
The terminal's screen during a session: the current step in large type with its quantities, the conductor's next steps, and the timer strip.
_Avoid_: cook screen, card

**Timer strip**:
Every running walk-away step and its time left, visible throughout a session.
_Avoid_: timer bar, timer list

**Hands-on step**:
A step that needs the cook throughout.
_Avoid_: active step, attended step, stay-with-it

**Walk-away step**:
A step that carries on by itself between its start and its end, such as a simmer or a marinade.
_Avoid_: passive step, unattended step

**Equipment**:
A kitchen item that a step occupies while it runs, such as a frying pan, a pot, the oven or the air fryer.
_Avoid_: utensil, tool, cookware

### Stock

**Pantry**:
The ingredients on hand, wherever they are kept. Leftovers are not part of it.
_Avoid_: inventory, stock

**Staple**:
A pantry ingredient assumed to be in stock until it is flagged out.
_Avoid_: basic, essential

**Leftover**:
A cooked dish kept in the fridge or freezer to eat later, with an eat-by date.
_Avoid_: stored dish, meal prep

**Eat-by date**:
The last day a leftover should be eaten.
_Avoid_: expiry, use-by

**Can cook now**:
A recipe whose ingredients are all in the pantry.
_Avoid_: crafting, cookable

**One item away**:
A recipe missing exactly one ingredient from the pantry.

### Planning and shopping

**Plan**:
The recipes chosen for a batch session, each with its batch multiplier.
_Avoid_: menu, meal plan

**Planner**:
What proposes a plan and its shopping list.

**Batch multiplier**:
How many times over a plan cooks a recipe's quantities.

**Shop routing**:
Which shop each ingredient is bought at.

**Shelf name**:
An ingredient's name as the shop labels it, in the local language.
_Avoid_: local label
