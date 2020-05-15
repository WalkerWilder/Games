class Physics {
  constructor() {
    this.hitPointsAngle = 18;
    this.nChunks = 1
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
    const chunk = { x: Math.floor(elDestination.x / 300), y: Math.floor(elDestination.y / 300) };
    for (let x = chunk.x - nChunks; x <= chunk.x + nChunks; x++) {
      if (typeof game._chunks[x] !== 'undefined' && game._chunks[x].length > 0) {
        for (let y = chunk.y - nChunks; y <= chunk.y + nChunks; y++) {
          if (typeof game._chunks[x][y] !== 'undefined' && game._chunks[x][y].length > 0) {
            const buildings = game._chunks[x][y];
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
    }
    return false;
  }

  checkCollisionB(borders) {
    const nChunks = this.nChunks;
    for (const b in borders) {
      if (borders.hasOwnProperty(b)) {
        const border = borders[b];
        const chunk = { x: Math.floor(border.x / 300), y: Math.floor(border.y / 300) };
        for (let x = chunk.x - nChunks; x <= chunk.x + nChunks; x++) {
          if (typeof game._chunks[x] !== 'undefined' && game._chunks[x].length > 0) {
            for (let y = chunk.y - nChunks; y <= chunk.y + nChunks; y++) {
              if (typeof game._chunks[x][y] !== 'undefined' && game._chunks[x][y].length > 0) {
                const buildings = game._chunks[x][y];

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
    }
    return false;
  }
}

physics = new Physics();