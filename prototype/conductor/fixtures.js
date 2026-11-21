// PROTOTYPE fixtures: invented recipes, not from any source (ADR 0001). Shape follows ADR 0006,
// trimmed to what the conductor reads. Kitchen counts are invented too; the owner's are private.
(function (root) {
  const W = (min, max) => ({ min, max: max ?? min, attention: 'walk' });
  const H = (min, max) => ({ min, max: max ?? min, attention: 'hands' });
  const RECIPES = [
    { id: 'braise', name: 'Braised pork and radish', handsOnMin: 15, batch: 3, steps: [
      { id: 'a1', text: 'Cut the pork into 3 cm cubes', inputs: [] },
      { id: 'a2', text: 'Brown the cubes on all sides', inputs: ['a1'], equipment: ['pan'], timer: H(6, 8) },
      { id: 'a3', text: 'Cut the radish into thick rounds', inputs: [] },
      { id: 'a4', text: 'Mix the braising liquid', inputs: [] },
      { id: 'a5', text: 'Pork, radish and liquid into the pot; bring to the boil', inputs: ['a2', 'a3', 'a4'], equipment: ['pot'] },
      { id: 'a6', text: 'Simmer, lid ajar', inputs: ['a5'], equipment: ['pot'], timer: W(40, 45) },
      { id: 'a7', text: 'Reduce uncovered until glossy', inputs: ['a6'], equipment: ['pot'], timer: H(5) },
    ] },
    { id: 'greens', name: 'Sesame greens', handsOnMin: 8, batch: 2, steps: [
      { id: 'g1', text: 'Bring a small pot of salted water to the boil', inputs: [], equipment: ['smallpot'], timer: W(6) },
      { id: 'g2', text: 'Wash and trim the greens', inputs: [] },
      { id: 'g3', text: 'Blanch the greens', inputs: ['g1', 'g2'], equipment: ['smallpot'], timer: H(1, 2) },
      { id: 'g4', text: 'Cool under cold water, squeeze dry', inputs: ['g3'] },
      { id: 'g5', text: 'Grind sesame with sugar and soy', inputs: [] },
      { id: 'g6', text: 'Dress the greens', inputs: ['g4', 'g5'] },
    ] },
    { id: 'cutlets', name: 'Crumbed chicken cutlets', handsOnMin: 22, batch: 1, steps: [
      { id: 'c1', text: 'Pound the chicken thin and season', inputs: [] },
      { id: 'c2', text: 'Set out flour, egg and crumbs', inputs: [] },
      { id: 'c3', text: 'Bread the chicken', inputs: ['c1', 'c2'] },
      { id: 'c4', text: 'Heat the oil to 170 °C', inputs: [], equipment: ['deepfry'], timer: W(8) },
      { id: 'c5', text: 'Fry, turning once, until golden', inputs: ['c3', 'c4'], equipment: ['deepfry'], timer: H(5, 6), perRound: 1 },
      { id: 'c6', text: 'Rest on a rack', inputs: ['c5'], timer: W(2) },
      { id: 'c7', text: 'Shred the cabbage finely', inputs: [] },
      { id: 'c8', text: 'Slice and plate with the cabbage', inputs: ['c6', 'c7'] },
    ] },
    { id: 'rice', name: 'Plain rice', handsOnMin: 4, batch: 3, steps: [
      { id: 'r1', text: 'Rinse the rice until the water runs clear', inputs: [] },
      { id: 'r2', text: 'Soak', inputs: ['r1'], timer: W(30) },
      { id: 'r3', text: 'Cook in the rice cooker', inputs: ['r2'], equipment: ['ricecooker'], timer: W(40) },
      { id: 'r4', text: 'Fluff', inputs: ['r3'] },
    ] },
    { id: 'bowl', name: 'Ginger chicken rice bowl', handsOnMin: 14, batch: 2, steps: [
      { id: 'b1', text: 'Slice the chicken thighs', inputs: [] },
      { id: 'b2', text: 'Grate the ginger into the sauce', inputs: [] },
      { id: 'b3', text: 'Fry the chicken', inputs: ['b1'], equipment: ['pan'], timer: H(6) },
      { id: 'b4', text: 'Add the sauce and glaze', inputs: ['b3', 'b2'], equipment: ['pan'] },
      { id: 'b5', text: 'Spoon over the rice', inputs: ['b4'], uses: ['rice'] },
    ] },
    { id: 'pickle', name: 'Quick cucumber pickle', handsOnMin: 6, batch: 3, steps: [
      { id: 'p1', text: 'Slice the cucumber thinly', inputs: [] },
      { id: 'p2', text: 'Salt and rest', inputs: ['p1'], timer: W(15) },
      { id: 'p3', text: 'Squeeze dry', inputs: ['p2'] },
      { id: 'p4', text: 'Mix vinegar, sugar and salt', inputs: [] },
      { id: 'p5', text: 'Combine and chill', inputs: ['p3', 'p4'], timer: W(60) },
    ] },
    { id: 'soup', name: 'Tofu miso soup', handsOnMin: 8, batch: 1, steps: [
      { id: 's1', text: 'Bring water and stock to a simmer', inputs: [], equipment: ['smallpot'], timer: W(8) },
      { id: 's2', text: 'Cube the tofu, slice the spring onion', inputs: [] },
      { id: 's3', text: 'Warm the tofu through', inputs: ['s1', 's2'], equipment: ['smallpot'], timer: H(2) },
      { id: 's4', text: 'Off the heat, dissolve the miso', inputs: ['s3'], equipment: ['smallpot'] },
    ] },
    { id: 'squash', name: 'Roast squash', handsOnMin: 8, batch: 2, steps: [
      { id: 'o1', text: 'Preheat the oven to 200 °C', inputs: [], equipment: ['oven'], timer: W(12) },
      { id: 'o2', text: 'Cut the squash into wedges, toss with oil', inputs: [] },
      { id: 'o3', text: 'Roast, turning halfway', inputs: ['o1', 'o2'], equipment: ['oven'], timer: W(25, 30) },
      { id: 'o4', text: 'Brush with the glaze', inputs: ['o3'] },
    ] },
    { id: 'omelette', name: 'Rolled omelette', handsOnMin: 10, batch: 2, steps: [
      { id: 'e1', text: 'Beat the eggs with stock and sugar', inputs: [] },
      { id: 'e2', text: 'Cook in thin layers, rolling each one', inputs: ['e1'], equipment: ['pan'] },
      { id: 'e3', text: 'Shape in a mat and cool', inputs: ['e2'], timer: W(10) },
      { id: 'e4', text: 'Slice', inputs: ['e3'] },
    ] },
  ];
  const KITCHEN = { hob: 4, pan: 1, pot: 1, smallpot: 1, deepfry: 1, ricecooker: 1, oven: 1, microwave: 1, airfryer: 0 };
  const out = { RECIPES, KITCHEN };
  if (typeof module === 'object' && module.exports) module.exports = out; else root.EVEY_FIXTURES = out;
})(typeof self !== 'undefined' ? self : this);
