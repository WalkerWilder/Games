class Physics {
  constructor(configs) {
    this.configs = configs;

    this.hitPointsAngle = configs.get('hitpointsAngle');
    this.nChunks = configs.get('physicsNChunks');
    this.chunkSize = configs.get('chunkSize');
  }
  checkMovementCollision(entity, movement) {
    const entityPosition = entity.position;
    let collision = false;

    const destination = {
      x: entityPosition.x + movement.x,
      y: entityPosition.y + movement.y,
    };

    const parts = entity.getComponents();
    for (const p in parts) {
      if (parts.hasOwnProperty(p)) {
        const el = parts[p];
        if (el.visual) continue;
        const elDestination = el.self.getPosition(destination, entity.rotation);
        const borders = el.self.getBorders(elDestination, this.hitPointsAngle);
        collision = this.checkCollisionA(elDestination, el.self.size);
        collision = (collision || this.checkCollisionB(borders));
        if (collision) return collision;
      }
    }
    return collision;
  }

  checkCollisionA(elDestination, size) {
    const nChunks = this.nChunks;
    const chunk = { x: Math.floor(elDestination.x / this.chunkSize), y: Math.floor(elDestination.y / this.chunkSize) };
    for (let x = chunk.x - nChunks; x <= chunk.x + nChunks; x++) {
      for (let y = chunk.y - nChunks; y <= chunk.y + nChunks; y++) {
        if (typeof game._orchestrator._chunks[`${x}|${y}`] !== 'undefined' && game._orchestrator._chunks[`${x}|${y}`].length > 0) {
          const buildings = game._orchestrator._chunks[`${x}|${y}`];
          for (let i = 0; i < buildings.length; i++) {
            const building = buildings[i];
            const walls = building.getComponents();
            for (const part in walls) {
              if (walls.hasOwnProperty(part)) {
                const wall = walls[part];
                if (wall.visual) continue;
                const position = wall.self.getPosition(building.position, building.rotation);

                const corners = wall.self.getCorners(position, building.rotation);
                for (const c in corners) {
                  if (corners.hasOwnProperty(c)) {
                    const corner = corners[c];
                    if (pointIsInsideCircle(corner, { position: elDestination, r: size })) return true;
                  }
                }
              }
            }
          }

        }
      }
    }
    return false;
  }

  checkCollisionB(borders) {
    const nChunks = this.nChunks;
    for (const b in borders) {
      if (borders.hasOwnProperty(b)) {
        const border = borders[b];
        const chunk = { x: Math.floor(border.x / this.chunkSize), y: Math.floor(border.y / this.chunkSize) };
        for (let x = chunk.x - nChunks; x <= chunk.x + nChunks; x++) {
          for (let y = chunk.y - nChunks; y <= chunk.y + nChunks; y++) {
            if (typeof game._orchestrator._chunks[`${x}|${y}`] !== 'undefined' && game._orchestrator._chunks[`${x}|${y}`].length > 0) {
              const buildings = game._orchestrator._chunks[`${x}|${y}`];

              for (let i = 0; i < buildings.length; i++) {
                const building = buildings[i];
                const walls = building.getComponents();
                for (const part in walls) {
                  if (walls.hasOwnProperty(part)) {
                    const wall = walls[part];
                    if (wall.visual) continue;
                    const position = wall.self.getPosition(building.position, building.rotation);

                    const corners = wall.self.getCorners(position, building.rotation);
                    const { tl, tr, dl, dr } = corners;
                    const rectArea = (
                      getTriangleArea(position, tl, tr) +
                      getTriangleArea(position, tl, dl) +
                      getTriangleArea(position, dl, dr) +
                      getTriangleArea(position, dr, tr)
                    )

                    const check = (
                      getTriangleArea(border, tl, tr) +
                      getTriangleArea(border, tl, dl) +
                      getTriangleArea(border, dl, dr) +
                      getTriangleArea(border, dr, tr)
                    )

                    if (rectArea >= check) return true;
                  }
                }
              }
            }
          }
        }
      }
    }
    return false;
  }
}