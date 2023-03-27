import { Weapon } from "./weapon";

describe("Weapon", () => {
  test("attack should land after attack.duration", () => {
    const enemy = { pos: { x: 0, y: 0 }, takeDamage: jest.fn(), currentHP: 1 };
    const weapon = new Weapon({ pos: { x: 0, y: 0 } }, 1, 1, 1);
    weapon.setTarget(enemy);
    weapon.tick(0);
    expect(weapon.attacks.length).toBe(1);
    const attack = weapon.attacks[0];
    const duration = attack.duration;
    weapon.tick(duration);
    expect(attack.now).toBe(duration);
    expect(enemy.takeDamage).toBeCalledWith(weapon.damage);
    expect(weapon.attacks.length).toBe(0);
  });
});
