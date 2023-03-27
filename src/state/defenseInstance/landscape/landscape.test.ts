import { BasicTower } from "../entities/tower";
import { Landscape } from "./";

describe("Landscape", () => {
  test("can't add two towers on same tile", () => {
    const landscape = new Landscape(10, 10, {
      basePos: { x: 0, y: 0 },
      spawnPoints: [{ x: 0, y: 0 }],
    });
    landscape.addTower(new BasicTower({ x: 0, y: 0 }, landscape));
    landscape.addTower(new BasicTower({ x: 0, y: 0 }, landscape));
    expect(landscape.towers.length).toBe(1);
  });

  test("can add two towers on different tiles", () => {
    const landscape = new Landscape(10, 10, {
      basePos: { x: 0, y: 0 },
      spawnPoints: [{ x: 0, y: 0 }],
    });
    landscape.addTower(new BasicTower({ x: 0, y: 0 }, landscape));
    landscape.addTower(new BasicTower({ x: 1, y: 0 }, landscape));
    expect(landscape.towers.length).toBe(2);
  });

  test("distance map is correct", () => {
    const landscape = new Landscape(3, 1, {
      basePos: { x: 0, y: 0 },
      spawnPoints: [{ x: 0, y: 0 }],
    });
    expect(landscape.distanceMap).toMatchInlineSnapshot(`
      [
        {
          "distance": 1,
          "hex": Tile {
            "passable": true,
            "x": 1,
            "y": -1,
            "z": 0,
          },
        },
      ]
    `);
  });
});
