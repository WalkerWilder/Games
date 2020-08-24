class Orchestrator {
  constructor(configs) {
    this.configs = configs;

    this._entities = [];
    this._buildings = [];
    this._creatures = [];
    this._chunks = {};
    this._player = undefined;
    this._play = true;

    this._renderer = new Renderer(configs);
    this._physics = new Physics(configs);
  }
  start() {
    this.addEntity(new Player({ x: 0, y: 0 }));

    this._control = new Control(this.configs, this._player, this);

    this.addEntity(new Building(
      {
        t: new Component(shapes.rectangle, { h: 200, w: 200 }, colors.red,
          { x: 0, y: 0 }, { visual: false })
      },
      { x: 0, y: 150 }, 0)
    );

    for (let i = 0; i < dev_entities.length; i++) {
      const w = dev_entities[i];
      const components = {};
      for (let j = 0; j < w.components.length; j++) {
        const c = w.components[j];
        components.floor = new Component(shapes.rectangle, { h: c.h, w: c.w }, (c.v) ? colors.grey : colors.red,
          { x: c.x_off, y: c.y_off }, { visual: c.v });

        // components.btWall = new Component(shapes.rectangle, { h: 15, w: c.w }, colors.darkGrey,
        //   { x: c.x_off, y: c.y_off + (c.h / 2) - 7 }, { visual: false });

        // components.rtWall = new Component(shapes.rectangle, { h: c.h, w: 15 }, colors.darkGrey,
        //   { x: c.x_off + (c.w / 2) - 7, y: c.y_off }, { visual: false });

        // components.tpWall = new Component(shapes.rectangle, { h: 15, w: c.w }, colors.darkGrey,
        //   { x: c.x_off, y: c.y_off - (c.h / 2) + 7 }, { visual: false });

        // components.ltWall = new Component(shapes.rectangle, { h: c.h, w: 15 }, colors.darkGrey,
        //   { x: c.x_off - (c.w / 2) + 7, y: c.y_off }, { visual: false });

      }
      this.addEntity(new Building(components, { x: w.x, y: w.y }, ((Math.PI * 2) / 360) * w.rotation));
    }

    this.addEntity(new Zombie({ x: 1000, y: 150 }));
    this.run();
  }

  addEntity(entity) {
    this._entities.push(entity);
    if (entity instanceof Player) this._player = entity;

    if (entity instanceof Creature) this._creatures.push(entity);

    if (entity instanceof Building) {
      this._buildings.push(entity);

      const pos = entity.position;
      const chunkSize = this.configs.get('chunkSize');
      const chunk = {
        x: Math.floor(pos.x / chunkSize),
        y: Math.floor(pos.y / chunkSize)
      };
      entity.setChunk(chunk);

      if (typeof this._chunks[`${chunk.x}|${chunk.y}`] == 'undefined') this._chunks[`${chunk.x}|${chunk.y}`] = [];

      this._chunks[`${chunk.x}|${chunk.y}`].push(entity);
    }
  }

  action(actionStr, player, detail) {
    switch (actionStr) {
      case 'startAction':
        player.start(detail);
        break;
      case 'stopAction':
        player.stop(detail);
        break;
      case 'lookAt':
        player.lookAt(detail);
        break;
    }
  }

  update() {
    this.movements();
    this._renderer._render(this._player, this._chunks, this._creatures)
  }

  movements() {
    const entities = this._creatures;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      this.entityFacing(entity);
      this.entityMove(entity);
    }
  }

  entityFacing(entity) {
    const position = entity.position;
    const direction = (entity instanceof Player) ? this.getAbsolutePosition(entity.facing, position) : entity.facing;
    const preRotation = entity.rotation;
    entity.rotation = Math.atan2(direction.y - position.y, direction.x - position.x) - Math.PI / 2;
    if (this._physics.checkMovementCollision(entity, { x: 0, y: 0 })) entity.rotation = preRotation;
  }

  entityMove(entity) {
    if (entity instanceof Player) {
      const moves = entity.movement();
      if (!moves.moveUp && !moves.moveDown && !moves.moveLeft && !moves.moveRight) return;
      let steps = entity.speed;
      while (steps > 0) {
        const movement = { x: 0, y: 0 };
        if (moves.moveUp) {
          movement.y -= 1;
          steps--;
        }
        if (moves.moveDown) {
          movement.y += 1;
          steps--;
        }
        if (moves.moveLeft) {
          movement.x -= 1;
          steps--;
        }
        if (moves.moveRight) {
          movement.x += 1;
          steps--;
        }
        if (!this._physics.checkMovementCollision(entity, movement)) {
          entity.position.x += movement.x;
          entity.position.y += movement.y;
        }
      }
    }
    if (entity instanceof Enemy) {
      const direction = this._player.position;
      const position = entity.position;
      const preRotation = entity.rotation;
      entity.rotation = Math.atan2(direction.y - position.y, direction.x - position.x) + Math.PI / 2;
      if (this._physics.checkMovementCollision(entity, { x: 0, y: 0 })) entity.rotation = preRotation;

      let moveUp = false, moveDown = false, moveLeft = false, moveRight = false;
      if (position.x > direction.x) moveLeft = true;
      if (position.x < direction.x) moveRight = true;
      if (position.y > direction.y) moveUp = true;
      if (position.y < direction.y) moveDown = true;

      if (position == direction || (!moveUp && !moveDown && !moveLeft && !moveRight)) return;
      let steps = entity.speed;
      while (steps > 0) {
        const movement = { x: 0, y: 0 };
        if (moveUp) {
          movement.y -= 1;
          steps--;
        }
        if (moveDown) {
          movement.y += 1;
          steps--;
        }
        if (moveLeft) {
          movement.x -= 1;
          steps--;
        }
        if (moveRight) {
          movement.x += 1;
          steps--;
        }
        if (!this._physics.checkMovementCollision(entity, movement)) {
          entity.position.x += movement.x;
          entity.position.y += movement.y;
        }
      }
    }
  }

  getAbsolutePosition(screenPosition, basePosition) {
    const midX = this._renderer._canvas.offsetLeft + (this._renderer._container.clientWidth / 2);
    const midY = this._renderer._canvas.offsetTop + (this._renderer._container.offsetHeight / 2);
    const difY = midY - screenPosition.y;
    const difX = midX - screenPosition.x;
    return { x: basePosition.x + difX, y: basePosition.y + difY };
  }

  run() {
    if (this._play) this.update();
    window.requestAnimationFrame(this.run.bind(this));
  }
}