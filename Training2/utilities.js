const shapes = {
  'circle': 0,
  'rectangle': 1,
  'line': 2
}

const colors = {
  black: 'black',
  blue: 'blue',
  gray: 'gray',
  green: 'green',
  red: 'red'
}

function _rotate(center, position, angle) {
  const cx = center.x;
  const cy = center.y;
  const x = position.x;
  const y = position.y;
  const cos = Math.cos(- angle);
  const sin = Math.sin(- angle);
  const rotatedx = Math.round((cos * (x - cx)) + (sin * (y - cy)) + cx);
  const rotatedy = Math.round((cos * (y - cy)) - (sin * (x - cx)) + cy);
  return { x: rotatedx, y: rotatedy };
}

function pointIsInsideCircle(point, circle) {
  const { position, r } = circle;

  return this.getDistance(point, position) <= r;
}

function getDistance(pointA, pointB) {
  const { x: x1, y: y1 } = pointA;
  const { x: x2, y: y2 } = pointB;
  const a = x1 - x2;
  const b = y1 - y2;
  const c = Math.sqrt(a * a + b * b);

  return c;
}

function getTriangleArea(pointA, pointB, pointC) {
  const { x: x1, y: y1 } = pointA;
  const { x: x2, y: y2 } = pointB;
  const { x: x3, y: y3 } = pointC;

  return Math.abs(((x1 * y2) + (x3 * y1) + (x2 * y3)) - ((x3 * y2) + (x1 * y3) + (x2 * y1))) / 2;

}