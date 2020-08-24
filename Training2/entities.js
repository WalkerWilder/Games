class Rectangle {
  constructor(size, offset) {
    this.size = size;
    this.offset = offset;
  }

  getPosition(entityPosition, rotation) {
    const position = _rotate({ x: 0, y: 0 }, { x: this.offset.x, y: this.offset.y }, rotation);
    return {
      x: position.x + entityPosition.x,
      y: position.y + entityPosition.y
    };
  }

  getDrawingPosition(entityPosition, rotation) {
    const position = this.getPosition(entityPosition, rotation);
    return {
      x: position.x - (this.size.w / 2),
      y: position.y - (this.size.h / 2)
    };
  }

  getCorners(entityPosition, rotation) {
    const { x, y } = entityPosition;
    const { w, h } = this.size;

    const top = y - (h / 2);
    const btm = y + (h / 2);
    const l = x - (w / 2);
    const r = x + (w / 2);

    const tl = { x: l, y: top };
    const tr = { x: r, y: top };
    const dl = { x: l, y: btm };
    const dr = { x: r, y: btm };

    return {
      tl: _rotate(entityPosition, tl, rotation),
      tr: _rotate(entityPosition, tr, rotation),
      dl: _rotate(entityPosition, dl, rotation),
      dr: _rotate(entityPosition, dr, rotation)
    };
  }

  getBorders(entityPosition, rotation, spacing = 50) {
    const { x, y } = entityPosition;
    const { w, h } = this.size;

    const top = y - (h / 2);
    const btm = y + (h / 2);
    const l = x - (w / 2);
    const r = x + (w / 2);

    const tl = { x: l, y: top };
    const tr = { x: r, y: top };
    const dl = { x: l, y: btm };
    const dr = { x: r, y: btm };

    const wIntervals = Math.round(w / spacing);
    const hIntervals = Math.round(h / spacing);

    const extraBorders = {};
    for (let i = 0; i < wIntervals; i++) {
      extraBorders[`t${i}`] = _rotate(entityPosition, { x: l + spacing * (i + 1), y: top }, rotation);
      extraBorders[`b${i}`] = _rotate(entityPosition, { x: l + spacing * (i + 1), y: btm }, rotation);
    }
    for (let i = 0; i < hIntervals; i++) {
      extraBorders[`l${i}`] = _rotate(entityPosition, { x: l, y: top + spacing * i }, rotation);
      extraBorders[`r${i}`] = _rotate(entityPosition, { x: r, y: top + spacing * i }, rotation);
    }

    return {
      tl: _rotate(entityPosition, tl, rotation),
      tr: _rotate(entityPosition, tr, rotation),
      dl: _rotate(entityPosition, dl, rotation),
      dr: _rotate(entityPosition, dr, rotation),
      ...extraBorders
    };
  }
}

class Circle {
  constructor(size, offset) {
    this.size = size;
    this.offset = offset;
  }

  getPosition(entityPosition, rotation) {
    const position = _rotate({ x: 0, y: 0 }, { x: this.offset.x, y: this.offset.y }, rotation);
    return {
      x: position.x + entityPosition.x,
      y: position.y + entityPosition.y
    };
  }

  getBorders(entityPosition, step) {
    const borders = {};
    for (let a = 0; a < 360; a += step) {
      borders[a] = _rotate(entityPosition, { x: entityPosition.x + this.size, y: entityPosition.y }, ((Math.PI * 2) / 360) * a);
    };
    return borders;
  }
}

class Component {
  constructor(shape, size, color, offset = { x: 0, y: 0 }, physics = {}) {
    const {
      visual = false
    } = physics;

    this.visual = visual;

    this.color = color;
    switch (shape) {
      case shapes.circle:
        this.self = new Circle(size, offset);
        break;
      case shapes.rectangle:
        this.self = new Rectangle(size, offset);
        break;
    }
  }
}

class Entity {
  constructor(components, position, rotation) {
    this.components = components;
    this.position = position;
    this.rotation = rotation;
    this.facing = { x: 0, y: 0 };
  }

  getComponents() {
    return this.components;
  }
}

class Creature extends Entity {
}

class Player extends Creature {
  constructor(position) {
    var components = {
      maod: new Component(shapes.circle, 10, colors.lightBlue, { x: 35, y: -40 }, { visual: true }),
      maoe: new Component(shapes.circle, 10, colors.lightBlue, { x: -35, y: -40 }, { visual: true }),
      ombd: new Component(shapes.circle, 25, colors.lightBlue, { x: 30, y: 2 }),
      ombe: new Component(shapes.circle, 25, colors.lightBlue, { x: -30, y: 2 }),
      main: new Component(shapes.circle, 40, colors.blue, { x: 0, y: 0 })
    };

    super(components, position, 0);
    this.facing = { x: 0, y: 0 };
    this.speed = 10;
  }

  lookAt(position) {
    this.facing = position;
  }

  start(action) {
    switch (action) {
      case 'up':
        this.moveUp = true;
        break;
      case 'down':
        this.moveDown = true;
        break;
      case 'left':
        this.moveLeft = true;
        break;
      case 'right':
        this.moveRight = true;
        break;
    }
  }
  stop(action) {
    switch (action) {
      case 'up':
        this.moveUp = false;
        break;
      case 'down':
        this.moveDown = false;
        break;
      case 'left':
        this.moveLeft = false;
        break;
      case 'right':
        this.moveRight = false;
        break;
    }
  }
  movement() {
    return ({ moveUp: this.moveUp, moveDown: this.moveDown, moveLeft: this.moveLeft, moveRight: this.moveRight });
  }
}

class Enemy extends Creature {
}

class Zombie extends Enemy {
  constructor(position) {
    var components = {
      maod: new Component(shapes.circle, 10, colors.darkGreen, { x: 35, y: -40 }, { visual: true }),
      maoe: new Component(shapes.circle, 10, colors.darkGreen, { x: -35, y: -40 }, { visual: true }),
      ombd: new Component(shapes.circle, 25, colors.darkGreen, { x: 30, y: 2 }),
      ombe: new Component(shapes.circle, 25, colors.darkGreen, { x: -30, y: 2 }),
      main: new Component(shapes.circle, 40, colors.darkGrey, { x: 0, y: 0 })
    };

    super(components, position, 0);

    this.speed = 2;
  }
}

class Building extends Entity {
  constructor(components, position, rotation) {
    super(components, position, rotation);
    this.chunk = {
      x: Math.floor(this.position.x / 300),
      y: Math.floor(this.position.y / 300)
    };
  }

  setChunk(chunk) {
    this.chunk = chunk;
  }
}