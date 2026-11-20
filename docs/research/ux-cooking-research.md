# Following recipes while cooking: research findings for the evey device

Checked 2026-11-20. Primary sources only: papers and theses, read in full or in the sections named. Cooking Navi was read as an abstract only.

**How strong the evidence is.** Strongest on step content and layout. Thinnest on scheduling several dishes with real cooks: one study of 10 people, with a mixed result. Nearly every user study had a small group of students cooking one dish. None tested e-paper, physical buttons, or a 3–5 dish batch session.

## Top findings to design around

1. **Put the quantity and prep inside the step.** With a separate ingredient list, cooks switched between the step and the list about 5 times per recipe, and rated inline quantities clearer (Buykx 2013). Amounts make up 17.8% of cooks' information needs (Frummet 2022), and 7 of 11 cooks asked for one (Hwang 2023). The recipe step tree already records each step's inputs, so render them inline.
2. **Never show a step on its own.** Cooks look ahead to plan parallel work and to make sense of the current step, and one-step-per-page was not preferred. Show the current step, what comes next, and anything running, with several steps active at once (Buykx 2013).
3. **Keep every timer on one always-visible screen.** Hiding timers behind other screens increased over-cooking (Craik & Bialystok 2006).
4. **One main action per step.** Steps cooks asked to hear again had about one extra action and one extra ingredient (Hwang 2023). Measuring two ingredients at once led to forgetting one (Chan 2025).
5. **Keep required page turns to a minimum.** 14 of 24 cooks complained about having to wash their hands to swipe (Buykx 2013). In real-world use, navigation is overwhelmingly a linear "next" (Ferreira 2026). Use one large button, and make steps readable at a glance without pressing anything.
6. **Show progress, and bring long-lead steps forward.** 5 of 11 cooks missed the last step. One lost an hour because a parallel instruction came too late (Hwang 2023).
7. **Schedule by attended vs unattended steps and by which pan or pot is in use, aiming for dishes to finish together.** Running steps in parallel saved 34% of the time, and reordering dishes saved a further 9.6% (Matsushima & Funabiki 2015). Half of real users were slower with the "optimal" plan, and the soup went cold (Nakabe 2021).
8. **Keep a short "last done" trail with counts**, e.g. "sugar 3 of 5". A history of recent actions helps cooks recover after an interruption (Tran et al. 2005).

## Per-paper findings

### A. Recipe format

**Buykx, L. (2013). *Interactive recipe instructions: supporting cooks with better designs.* PhD thesis, University of York.**
https://etheses.whiterose.ac.uk/id/eprint/5158/1/Lucy%20Buykx%20accepted%20thesis.pdf. Related papers, read as abstracts only: Buykx & Petrie, IEEE ISM 2011, https://doi.org/10.1109/ISM.2011.70, and CEA @ ACM MM 2012, https://doi.org/10.1145/2390776.2390789.

- **Study design.** Two repeated-measures experiments in a lab kitchen, N=24 each, students aged 18–25, three recipes on a fixed iPad.
  - RECIPE1 compared a control, a segmented format (one task per page) and an integrated format (quantities and prep inside the step).
  - RECIPE2 compared a control, segmented steps with pictures, and a flowchart overview.
- **Read:** §6.2, §6.4, §7.2, §7.4, §8.
- **Quantities inline.** With a separate list, "cooks had to switch attention between the method instruction step and the ingredient list on average 4.96 times per recipe" (§6.4.1). Integrated recipes were rated clearer: 4.38 vs 3.92 on a 5-point scale, F(2,2)=31.00, p=.031 (§6.3.3). Only four cooks did even a partial mise-en-place.
- **One step per page backfired.** Segmented steps were rated no better than the "wall of text" control. "Fourteen cooks mentioned problems... they had to swipe the iPad to move between instructions and this required them to have clean and dry hands" (§6.3.5). Cook 2: "I like to be able to scan the next few steps as I am cooking." One step per page "introduces a new problem by removing the context of the overall procedure" (§6.4.2).
- **The overview mattered more than the detail.** With the flowchart, 14 cooks used a "quick details" mode, opening detail pop-ups "for less than 10 seconds". "The overview, the context of the task, was more important to the cook than the detailed instruction of the current step" (§7.4.3).
- **Design rule from the thesis:** "Interactive recipe systems should enable cooks to have multiple, non-contiguous steps active at any one time" (§8.2.3).
- **For evey:** show the current step with quantities inline, plus a persistent strip of what is next and what is running. A button press must never be the only way to see the next step.

### B. Guided and voice-assisted cooking

**Hwang, Oza, Callison-Burch, Head. "Rewriting the Script: Adapting Text Instructions for Voice Interaction." DIS 2023.**
https://doi.org/10.1145/3563657.3596059 (open copy: https://arxiv.org/pdf/2306.09992)

- **Study design:** observed at home, N=12, recipes of the cooks' own choosing, screenless Alexa. Read §3–§5.1.
- **Nine challenges:** missing the big picture, information overload, fragmentation, time insensitivity, missing details, discarded context, failure to listen, uncommunicated affordances, limits of audio.
- **Eight remedies:** summarize, signpost, split, elaborate, volunteer, reorder, redistribute, visualize.
- **Repeats.** "Every cook asked Alexa to repeat at least one step." Repeated steps "had 1.1 additional actions, 1.2 additional ingredients, 10 additional words". Rule of thumb: "each step contains one main action".
- **Losing the end.** "Five of eleven cooks missed the last step without knowing there was more to be heard." The authors recommend showing "step 2 of 12".
- **Late instructions.** One cook waited about an hour for cakes to cool before hearing "While the cakes cool, make the buttercream." Seven of eleven cooks asked for an ingredient amount.
- **For evey:** one main action per step, always "n of N" with an explicit end, and promote "start this now" items such as preheating, thawing and long simmers.

**Vtyurina & Fourney. "Exploring the Role of Conversational Cues in Guided Task Support with Virtual Assistants." CHI 2018.**
https://doi.org/10.1145/3173574.3173782

- **Study design:** Wizard-of-Oz, N=10, a spice-rub recipe. Read in full.
- **What people asked for:** "Next" 32.8% of requests, ingredient quantity 8.9%, repeat 7.8%, list ingredients 6.2%. 24% of the assistant's responses were triggered by implicit cues such as "Okay".
- **Rehearsal.** 8 of 10 participants repeated an instruction out loud to hold it in memory.
- **For evey:** "next" deserves the biggest button, and quantities must stay visible while the cook carries out the step.

**Frummet, Elsweiler, Ludwig. "'What Can I Cook with these Ingredients?' Understanding Cooking-Related Information Needs in Conversational Search." ACM TOIS 40(4), 2022.**
https://doi.org/10.1145/3498330

- **Study design:** in-situ at home, N=45, with a human playing the assistant. 38.75 hours, 2,675 coded needs.
- **Information needs:**

| Need | Share |
|---|---|
| Preparation (what next / am I doing it right) | 28.7% |
| Ingredient | 24.6% |
| Amount | 17.8% |
| Technique | 7.9% |
| Recipe | 7.7% |
| Time | 6.8% |
| Knowledge, equipment, temperature | under 2% each |

- **Reassurance.** Checks such as "Then I need to add the onion, right?" were used extensively.
- **For evey:** step, ingredients and amounts cover about 71% of needs and can all be static text. Add a done-state cue ("until translucent") to answer reassurance questions without any dialogue.

**Jaber et al. "Cooking With Agents: Designing Context-aware Voice Interaction for Complex Tasks." CHI 2024.**
https://doi.org/10.1145/3613904.3642183

- **Study design:** 7 home sessions with Google Assistant, then 16 Wizard-of-Oz lab sessions on a 12-step soup.
- **Timers.** Users responded better to a timer offered as a follow-up ("Should I start a timer?") than to suggestions. They also declined ("not yet") and shortened timers to allow for time already passed: P8 asked for 5 minutes on a 6-minute step.
- **Step numbers.** Unnumbered steps had to be "extrapolated, and remembered by the user".
- **For evey:** pre-arm the timer on every timed step, but let the cook start it and trim it. Number every step.

**Chan et al. "'Mango Mango, How to Let The Lettuce Dry Without A Spinner?'..." PACM HCI 9(7), CSCW 2025.**
https://doi.org/10.1145/3757442 (open copy: https://szeyireinachan.github.io/data/chan25mango.pdf)

- **Study design:** lab smart kitchen, N=12, GPT-3.5 on Alexa, a no-cook salad.
- **Results.** On average 37.7 queries per participant in 18.5 minutes. 9 of 12 changed the step order. P10: "I always used to ask it a few steps before." Participants still did the planning themselves.
- **Overload.** Salt and pepper given together: "when I measured the first one, I forgot about the other one".
- **For evey:** put each measured ingredient on its own line, and offer look-ahead rather than enforcing an order.

**Ferreira et al. "Large-Scale User Behavior Analysis in Multimodal AI-Assisted Manual Task Execution." arXiv:2609.07594, 2026 (preprint; accepted at EPIA 2026 per arXiv).**
https://arxiv.org/abs/2609.07594

- **Study design:** about 30k real-world conversations with the TWIZ-v2 Alexa task assistant; 91% on devices with screens.
- **Results.**
  - "64.7% of turns use touch controls", and the most frequent voice intent is Next Step.
  - Complex actions appear in 8.8% of real interactions, against 47.5% in crowdsourced data.
  - Users who start a task complete about half of its steps on average.
- **For evey:** real use is linear next-pressing. Invest in next, back, jump and resume, not in question-answering.

### C. Memory, interruptions, timers

**Tran, Calcaterra, Mynatt. "Cook's Collage: Déjà vu Display for a Home Kitchen." HOIT 2005, pp. 15–32.**
https://doi.org/10.1007/11402985_2

- **Study design:** dual-task simulation, N=22, with a display of the six most recent actions and repeat counts.
- **What cooks lose track of:** "which ingredients have already been added, counting multiple scoops of an ingredient, and keeping watch of cooking times". The display answers "what did you last do here?"; still images were enough.
- **Adoption.** Cooks who had first tried without the aid were far more likely to use it: 7 of 11, against 3 of 11 who had it from the start. One unaided cook overshot by 12 scoops.
- **For evey:** keep a short "last done" trail with counts on screen.

**Craik & Bialystok. "Planning and task management in older adults: Cooking breakfast." Memory & Cognition 34(6), 2006.**
https://doi.org/10.3758/BF03193268

- **Study design:** simulated five-food breakfast plus a table-setting task, N=60, with timers spread over 1, 2 or 6 screens.
- **Results.** Over-cooking rose with the number of screens, F(2,112)=38.4, p<.0001. With everything on one screen there were no age differences.
- **Caveat:** conditions always ran in the same order (1, 2, 6), and the task was simulated.
- **For evey:** every running timer stays on the main screen.

### D. Cooking several dishes at once

**Hamada et al. "Cooking Navi: Assistant for Daily Cooking in Kitchen." ACM MM 2005.**
https://doi.org/10.1145/1101149.1101228

- **Read:** abstract only. The system "helps even a novice user to cook several recipes in parallel", and "all users... could finish two dishes in parallel". Its evaluation and mechanism are UNVERIFIED (see below).

**Matsushima & Funabiki. "A Cooking-Step Scheduling Algorithm with Guidance System for Homemade Cooking." IEICE Trans. E98-D(8), 2015.**
https://doi.org/10.1587/transinf.2015EDP7048

- **Study design:** simulation on 100 web recipes, plus two real cooking trials.
- **Model.** Six step types. Cut, Mix and Fry occupy the cook throughout. Boil, Microwave and Stand need the cook only at the start and end. Resources are cooks, boards, hobs and microwaves, but the model assumes "a sufficient number of pans and pots".
- **Results.**
  - Running steps in parallel cut total time by 34%, and reordering dishes cut a further 9.6%.
  - Schedules held up with steps taking 30% longer or shorter.
  - In real trials, 38 minutes actual against 40 planned for four dishes with one cook, and 35 against 31 for two cooks.
  - Idle gaps prompt a "cleaning chance".
- **For evey:** tag each step as attended or unattended, which is where most of the gain comes from, and add pans and pots as resources.

**Nakabe, Mizumoto, Suwa, Yasumoto. "Optimal Cooking Procedure Presentation System for Multiple Recipes and Investigating Its Effect." Algorithms 14(2), 2021.**
https://doi.org/10.3390/a14020067

- **Study design:** N=10, three dishes, an app against paper, counterbalanced.
- **Model.** Each task lists the resources it needs (user, knife, board, pan, stove, lid) and a "holding resource" that stays occupied afterwards. Washing up is scheduled.
- **Speed.** Five participants got faster (by up to 14.8%) and five got slower (by up to 15%). Some cooks ran in parallel tasks the model had treated as attended.
- **Comfort.** Urgency fell from 3.1 to 1.7, and ease rose from 3.4 to 4.8.
- **Quality.** Dish quality fell from 3.9 to 3.6 because the miso soup went cold.
- **For evey:** model which pan or pot is held and the washing up, optimise for dishes finishing together, and sell the plan on calm rather than speed.

## Surprises

- Shorter one-per-page steps were rated no better than a paragraph (Buykx).
- Pictures were liked but "did not reduce the number of problems or errors" (Buykx §7.4.5).
- 66% of problems came from recipe wording, and how often someone cooked did not predict problems (Buykx §6.4).
- With a screen available, people mostly touch rather than talk, and ask few questions (Ferreira).
- People adopt a memory aid mainly after failing without one (Tran).
- Nakabe's headline "9 min (9.5%)" saving is the mean of the five who improved. Across all ten participants it is roughly −2 minutes.

## UNVERIFIED

- **Cooking Navi beyond its abstract.** Its evaluation is known only second-hand from Buykx §2.3.3: 8 cooks, questionnaires only, and difficulties with parallel tasks. Its mechanism is known only from Matsushima's related-work section.
- **Buykx & Petrie 2011 and 2012.** Full texts not read. The 2011 abstract reports 16 cooks against the thesis's 24.
- **Publication details.** Chan et al.'s volume and DOI come from an index record. Hwang's page numbers come from a search summary.
- **Ferreira et al.** is a preprint; the figure data was not extracted.
- **Not accessed at all:**
  - Kosch et al. 2019
  - MimiCook 2014
  - CounterActive 2001
  - Bonanni et al. 2005
  - panavi 2012
  - TaskBot 2022
  - KogniChef
  - Siio, Hamada & Mima 2007
- **Not found in any source:** a controlled novice-vs-expert comparison, or any study of physical buttons, e-paper, or 3–5 dish batch sessions.
