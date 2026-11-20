// Grid-fit measurement: largest type size at which each of the 97 process grids fits each panel size.
module.exports = async ({ ev, nav, sleep, errors, base }) => {
  await nav(`${base}?measure=1`);
  for (let i = 0; i < 240 && (await ev('document.title')) !== 'measure done'; i++) await sleep(500);
  console.log(await ev('document.getElementById("measure").textContent'));
  console.log('ERRORS', JSON.stringify(errors));
};
