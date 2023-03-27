import { Landscape } from "../landscape";
import { FireballSpell, MagicProvider } from "./index";

describe("FireballSpell", () => {
  it("should damage enemies in range", () => {
    const enemy = {
      takeDamage: jest.fn(),
    };
    const landscape = {
      getEnemiesInRange: jest.fn(() => [enemy as any]),
    };
    const tile = {};
    const spell = new FireballSpell(landscape as any, tile as any);
    spell.tick();
    expect(landscape.getEnemiesInRange).toBeCalledWith(tile, spell.radius);
    expect(enemy.takeDamage).toBeCalledWith(spell.damage);
  });
});

const makeLandscape = () => {
  return new Landscape(10, 10, {
    basePos: { x: 0, y: 0 },
    spawnPoints: [],
  });
};

describe("MagicProvider", () => {
  it("should not allow forcefield on tile without base", () => {
    const landscape = makeLandscape();
    const tile = {};
    const magicProvider = new MagicProvider(landscape, {} as any);
    expect(magicProvider.castSpell("forcefield", tile as any)).toBe(false);
  });

  it("should allow forcefield on tile with base", () => {
    const landscape = makeLandscape();
    const tile = landscape.bases[0].pos;
    const magicProvider = new MagicProvider(landscape, {} as any);
    expect(magicProvider.castSpell("forcefield", tile)).toBe(true);
  });

  test("magic cooldown should work", () => {
    const landscape = makeLandscape();
    const tile = landscape.bases[0].pos;
    const magicProvider = new MagicProvider(landscape, {} as any);
    expect(magicProvider.castSpell("forcefield", tile)).toBe(true);
    expect(magicProvider.castSpell("forcefield", tile)).toBe(false);
    magicProvider.tick(magicProvider.remainingCooldowns.forcefield);
    expect(magicProvider.castSpell("forcefield", tile)).toBe(true);
  });
});
