import { BasicTower } from "./tower";

describe("BasicTower", () => {
  test("attack should land after attack.duration", () => {
    const enemy = { pos: { x: 0, y: 0 }, takeDamage: jest.fn(), currentHP: 1 };
    const landscape = {
      getEnemiesInRange: jest.fn().mockReturnValue([enemy]),
    };
    const tower = new BasicTower({ x: 0, y: 0 }, landscape);
    tower.tick(0);
    expect(tower.attacks.length).toBe(1);
    const attack = tower.attacks[0];
    const duration = attack.duration;
    tower.tick(duration);
    expect(attack.now).toBe(duration);
    expect(enemy.takeDamage).toBeCalledWith(tower.damage);
    expect(tower.attacks.length).toBe(0);
  });
});
