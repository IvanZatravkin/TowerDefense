import { DefenseInstance } from "./index";

describe("DefenseInstance", () => {
  test("can't build tower on passable tile", () => {
    const instance = new DefenseInstance(10, 10, {
      basePos: { x: 0, y: 0 },
      spawnPoints: [],
      parentTile: {} as any,
    });
    const landscape = instance.landscape;
    const tile = landscape.grid.hexagonsArray[0];
    tile.passable = true;
    expect(instance.buildTower(tile)).toBe(false);
    instance.forceLose();
  });
});
