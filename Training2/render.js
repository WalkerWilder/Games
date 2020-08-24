class Renderer {
  constructor(configs) {
    this.configs = configs;

    this._container = document.getElementById('container')
    this._canvas = document.getElementById('game');
    this._canvas.width = this._container.clientWidth;
    this._canvas.height = this._container.offsetHeight;
    this._context = this._canvas.getContext('2d');
    this._context.translate(this._canvas.width / 2, this._canvas.height / 2);
    this.drawHitPoints = this.configs.get('drawHitPoints');
    this.hitPointsAngle = this.configs.get('hitpointsAngle');
    this.hitPointsDistance = this.configs.get('hitpointsDistance');
    this.nChunks = this.configs.get('RenderNChunks');
    this.chunkSize = this.configs.get('chunkSize');
  }

  _drawDot(position, pointOfView = { x: 0, y: 0 }, size = 5, color = colors.red) {
    this._drawCircle(pointOfView, position, size, color);
  }

  _drawRectangle(pointOfView, position, size, color, rotation) {
    const x = position.x - pointOfView.x;
    const y = position.y - pointOfView.y;
    const w = size.w;
    const h = size.h;

    this._context.fillStyle = color;
    this._context.translate((x + (w / 2)), (y + (h / 2)));
    this._context.rotate(rotation);
    this._context.fillRect(- (w / 2), - (h / 2), w, h);
    this._context.rotate(-rotation);
    this._context.translate(-(x + (w / 2)), -(y + (h / 2)));
  }

  _drawCircle(pointOfView, position, size, color) {
    const x = position.x - pointOfView.x;
    const y = position.y - pointOfView.y;
    const r = size;
    this._context.beginPath();
    this._context.fillStyle = color;
    this._context.arc(x, y, r, 0, Math.PI * 2, false);
    this._context.fill();
  }

  _drawLine(pointOfView, pointA, pointB, color) {
    const x1 = pointA.x - pointOfView.x;
    const y1 = pointA.y - pointOfView.y;
    const x2 = pointB.x - pointOfView.x;
    const y2 = pointB.y - pointOfView.y;

    this._context.strokeStyle = color;
    this._context.moveTo(x1, y1);
    this._context.lineTo(x2, y2);
    this._context.stroke()
  }

  _drawTriangle(pointOfView, pointA, pointB, pointC, color = colors.green) {
    this._drawLine(pointOfView, pointA, pointB, color);
    this._drawLine(pointOfView, pointB, pointC, color);
    this._drawLine(pointOfView, pointC, pointA, color);
  }

  _drawComplex(entity, playerPosition) {
    const components = entity.getComponents();
    const rotation = entity.rotation;
    const entityPosition = (entity instanceof Player) ? { x: 0, y: 0 } : entity.position;
    for (const part in components) {
      if (components.hasOwnProperty(part)) {
        const component = components[part];
        if (component.self instanceof Circle) {
          const position = component.self.getPosition(entityPosition, entity.rotation);
          this._drawCircle(playerPosition, position, component.self.size, component.color);

          if (this.drawHitPoints) {
            const borders = component.self.getBorders(position, this.hitPointsAngle);
            for (const b in borders) {
              if (borders.hasOwnProperty(b)) {
                const border = borders[b];
                this._drawDot(border, playerPosition);
              }
            }
          }
        }
        if (component.self instanceof Rectangle) {
          const position = component.self.getDrawingPosition(entityPosition, entity.rotation);
          this._drawRectangle(playerPosition, position, component.self.size, component.color, rotation);
          const compPosition = component.self.getPosition(entityPosition, entity.rotation);

          if (this.drawHitPoints) {
            const corners = component.self.getBorders(compPosition, rotation, this.hitPointsDistance);
            for (const c in corners) {
              if (corners.hasOwnProperty(c)) {
                const corner = corners[c];
                this._drawDot(corner, playerPosition);
              }
            }
          }
        }
      }
    }
  }

  _render(player, chunks, creatures) {
    this._context.fillStyle = 'black';
    this._context.fillRect(-(this._canvas.width / 2), -(this._canvas.height / 2), this._canvas.width, this._canvas.height);

    // player.move();
    const playerPosition = player.position;

    const layers = {};

    layers[0] = [];
    layers[0].push({ entity: player, pointOfView: { x: 0, y: 0 } });
    layers[-1] = []; // Walls
    layers[1] = []; // Monsters

    const chunk = { x: Math.floor(playerPosition.x / this.chunkSize), y: Math.floor(playerPosition.y / this.chunkSize) };

    const nChunks = this.nChunks;
    for (let x = chunk.x - nChunks; x <= chunk.x + nChunks; x++) {
      for (let y = chunk.y - nChunks; y <= chunk.y + nChunks; y++) {
        if (typeof chunks[`${x}|${y}`] !== 'undefined' && chunks[`${x}|${y}`].length > 0) {
          const buildings = chunks[`${x}|${y}`];
          for (let i = 0; i < buildings.length; i++) {
            const building = buildings[i];
            layers[-1].push({ entity: building, pointOfView: playerPosition });
          }
        }
      }
    }

    for (let i = 0; i < creatures.length; i++) {
      const creature = creatures[i];
      if (!(creature instanceof Player)) {
        layers[1].push({ entity: creature, pointOfView: playerPosition });
      }
    }

    for (let i = -1; i <= 1; i++) {
      const layer = layers[i];
      if (typeof layer == 'undefined' || layer.length == 0) continue;
      for (let j = 0; j < layer.length; j++) {
        const drawing = layer[j];
        this._drawComplex(drawing.entity, drawing.pointOfView);
      }
    }
  }
}