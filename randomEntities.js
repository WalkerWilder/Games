const fs = require('fs')
let arr = [];

for (let i = 0; i < 50000; i++) {
  const elements = 1;
  let components = [];
  for (let j = 0; j < elements; j++) {
    let x_off = Math.round(100 * Math.random());
    let y_off = Math.round(100 * Math.random());
    x_off = (Math.random() > 0.5) ? x_off * -1 : x_off;
    y_off = (Math.random() > 0.5) ? y_off * -1 : y_off;

    const w = Math.floor(198 * Math.random()) + 2;
    const h = Math.floor(198 * Math.random()) + 2;
    const v = (Math.random() >= .75);

    components.push({
      x_off, y_off, w, h, v
    });
  }

  let x = Math.round(50000 * Math.random());
  let y = Math.round(50000 * Math.random());

  x = (Math.random() > 0.5) ? x * -1 : x;
  y = (Math.random() > 0.5) ? y * -1 : y;

  const rotation = Math.round(Math.random() * 360);

  arr.push({ x, y, components, rotation });
}

var file = `const dev_entities = ${JSON.stringify(arr)}`;

fs.writeFileSync('Training2/dev_entities.js', file);