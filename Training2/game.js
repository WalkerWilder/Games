class Game {
  start() {
    this._entities = [];
    this._buildings = [];
    this._chunks = [];
    this._player = undefined;
    this._play = true;
    this._renderer = new Renderer();

    this.addEntity(new Player({ x: 0, y: 0 }));

    for (let i = 0; i < dev_entities.length; i++) {
      const w = dev_entities[i];
      const components = [];
      for (let j = 0; j < w.components.length; j++) {
        const c = w.components[j];
        components.push(
          new Component(shapes.rectangle, { h: c.h, w: c.w }, (c.v) ? colors.blue : colors.red,
            { x: c.x_off, y: c.y_off }, { visual: c.v })
        );
      }
      this.addEntity(new Building(components, { x: w.x, y: w.y }, ((Math.PI * 2) / 360) * w.rotation));
    }

    this.run();
  }

  addEntity(entity) {
    this._entities.push(entity);
    if (entity instanceof Player) this._player = entity;

    if (entity instanceof Building) {
      this._buildings.push(entity);

      const pos = entity.position;
      const chunk = {
        x: Math.floor(pos.x / 300),
        y: Math.floor(pos.y / 300)
      };
      entity.setChunk(chunk);

      if (typeof this._chunks[chunk.x] == 'undefined') this._chunks[chunk.x] = [];
      if (typeof this._chunks[chunk.x][chunk.y] == 'undefined') this._chunks[chunk.x][chunk.y] = [];
      this._chunks[chunk.x][chunk.y].push(entity);
    }
  }

  update() {
    this._renderer._render()
  }

  run() {
    if (this._play) this.update();
    window.requestAnimationFrame(this.run.bind(this));
  }
}

game = new Game();

game.start()