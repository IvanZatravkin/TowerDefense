import { distance } from "engine/utils/hexagon";
import { Landscape } from "../landscape";
import { updatePosition, Enemy } from "./enemy";
import { Weapon } from "./weapon";

class Peasant extends Enemy {
  constructor(landscape: Landscape, pos: Pos, onEnemyKilled?: (enemy: Enemy) => void) {
    super({
      initialHP: Math.random() * 50,
      speed: 0.5,
      landscape,
      pos,
      onEnemyKilled,
      weapon: (enemy) => new Weapon(enemy, (Math.random() * 10) | 1, 1, 1),
    });
  }
}

describe("updatePosition", () => {
  it("should move enemy to the next tile", () => {
    const pos = { x: 0, y: 0 };
    const target = { x: 1, y: 0 };
    const speed = 1;
    const delta = 1000;
    expect(updatePosition(pos, target, speed, delta)).toEqual({
      x: 1,
      y: 0,
    });
  });

  it("should attack base when it reaches it", () => {
    const landscape = new Landscape(2, 2, {
      basePos: { x: 1, y: -1 },
      spawnPoints: [{ x: 0, y: 0 }],
    });
    const peasant = new Peasant(landscape, { x: 0, y: 0 });
    const base = landscape.bases[0];
    expect(distance(peasant.pos, base.pos)).toBe(1);
    const currentHP = base.currentHP;
    peasant.tick(1000);
    peasant.tick(1000);
    peasant.tick(1000);
    expect(base.currentHP).toBeLessThan(currentHP);
  });
});

describe("enemy", () => {
  test("direction should be towards the base", () => {
    const landscape = new Landscape(2, 2, {
      basePos: { x: 1, y: -1 },
      spawnPoints: [{ x: 0, y: 0 }],
    });
    const peasant = new Peasant(landscape, { x: 0, y: 0 });
    // peasant.tick(0);
    expect(peasant.direction).toEqual({ x: 1, y: -1 });
  });

  test(`state should be 'moving'`, () => {
    const landscape = new Landscape(3, 3, {
      basePos: { x: 2, y: -2 },
      spawnPoints: [{ x: 0, y: 0 }],
    });
    const peasant = new Peasant(landscape, { x: 0, y: 0 });
    expect(peasant.state).toBe("moving");
  });

  test("state should change from moving to attacking", () => {
    const landscape = new Landscape(3, 3, {
      basePos: { x: 2, y: -2 },
      spawnPoints: [{ x: 0, y: 0 }],
    });
    const peasant = new Peasant(landscape, { x: 0, y: 0 });
    expect(peasant.state).toBe("moving");
    while ((peasant as any).path.length > 0) {
      peasant.tick(1000);
    }
    expect(peasant.state).toBe("attacking");
  });
});
