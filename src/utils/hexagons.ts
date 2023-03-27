import { Point } from "pixi.js";

export const cubeToPixels = ({ x, y, z = -(x + y) }: CubePos, radius: number) => {
  const x1 = radius * (x + z / 2);
  const y1 = radius * z * 0.75;
  return new Point(x1, y1);
};

/**
 * Returns points comprising a pointy-top hexagon.
 * @param radius
 */
export const getPoints = (radius: number) => {
  const points: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30;
    const angleRad = (Math.PI / 180) * angleDeg;
    points.push(new Point(((radius / 2) * Math.cos(angleRad)) / 0.86, (radius / 2) * Math.sin(angleRad)));
  }
  return points;
};

/**
 * Accepts local coordinates in pixels, hex radius in pixels, and returns the cube coordinates inside the hexagon.
 * Example: 0,0 is the center of the hexagon, so (0,0, 256) returns (0,0,0)
 * Points on the border of the hexagon return 0.5 for the coordinate that is on the border, etc.
 * Hexagons are pointy topped.
 */
export const localToCube = (point: Pos, radius: number) => {
  const x1 = point.x;
  const y1 = point.y;

  const z = y1 / (0.75 * radius);
  const x = x1 / radius - z / 2;
  const y = -x - z;

  return { x, y, z };
};
