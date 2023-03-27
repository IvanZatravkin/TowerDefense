import { distance } from "engine/utils/hexagon";
import type { Landscape } from "../landscape";
import { Enemy } from "./enemy";
import { Weapon } from "./weapon";

/**
 * Represents a single tower.
 * Towers fire at enemies in range.
 */
export class Tower {
  pos: Pos;
  weapon: Weapon;
  protected lastShot: number = Number.POSITIVE_INFINITY;
  protected readonly landscape: Pick<Landscape, "getEnemiesInRange">;
  protected currentTarget: Enemy | null = null;
  public readonly cost: number;

  constructor(
    pos: Pos,
    weapon: (tower: Tower) => Weapon,
    landscape: Pick<Landscape, "getEnemiesInRange">,
    cost: number
  ) {
    this.pos = { ...pos };
    this.weapon = weapon(this);
    this.landscape = landscape;
    this.cost = cost;
    // makeObservable(this, undefined, { proxy: false, deep: false });
  }

  /**
   * Runs tower for a single tick.
   */
  public tick(delta: number) {
    const target = this.selectTarget();
    this.weapon.setTarget(target);
    this.weapon.tick(delta);
  }

  get attacks() {
    return this.weapon.attacks;
  }

  protected selectTarget(): Enemy | null {
    if (this.currentTarget && this.isInRange(this.currentTarget)) {
      return this.currentTarget;
    }
    const enemies = this.landscape
      .getEnemiesInRange(this.pos, this.weapon.range)
      .filter((enemy) => enemy.currentHP > 0);
    if (enemies.length > 0) {
      return enemies[0];
    }
    return null;
  }

  private isInRange(enemy: Enemy) {
    return distance(this.pos, enemy.pos) <= this.weapon.range;
  }
}

export class BasicTower extends Tower {
  constructor(pos: Pos, landscape: Pick<Landscape, "getEnemiesInRange">) {
    super(pos, (t) => new BasicProjectileWeapon(t), landscape, 10);
  }

  public get damage() {
    return this.weapon.damage;
  }
}

class BasicProjectileWeapon extends Weapon {
  constructor(parent: { pos: Pos }) {
    super(parent, 2, 2, 2);
  }
}
