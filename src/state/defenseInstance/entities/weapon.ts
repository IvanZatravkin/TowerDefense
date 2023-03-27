import { makeObservable, observable } from "mobx";
import { distance } from "engine/utils/hexagon";

interface Enemy {
  pos: Pos;
  takeDamage(damage: number): void;
}

export interface Attack {
  target: Enemy;
  /** damage per hit */
  damage: number;
  /** time at which the attack will hit, ms since 0 */
  duration: number; // time at which the attack hits
  /** current time, goes from 0 to hitsAt */
  now: number;
  type: "projectile" | "ray";
}

class ProjectileAttack implements Attack {
  type = "projectile" as const;

  constructor(public target: Enemy, public damage: number, public duration: number, public now: number) {
    makeObservable(
      this,
      {
        now: observable,
      },
      { proxy: false, deep: false }
    );
  }
}

export class Weapon {
  private lastShot: number = Number.POSITIVE_INFINITY;
  private target: Enemy | null = null;
  @observable.shallow
  public attacks: Attack[] = [];
  private parent: { pos: Pos };
  public readonly range: number;
  public readonly damage: number;
  /** shots per second */
  public readonly fireRate: number;

  constructor(parent: { pos: Pos }, range: number, damage: number, fireRate: number) {
    this.parent = parent;
    this.range = range;
    this.damage = damage;
    this.fireRate = fireRate;
    makeObservable(this, undefined, { proxy: false, deep: false });
  }

  public tick(delta: number) {
    this.attacks.forEach((attack) => (attack.now += delta));
    this.lastShot += delta;
    if (this.lastShot >= 1000 / this.fireRate) {
      const shotFired = this.shoot();
      if (shotFired) {
        this.lastShot = 0;
      }
    }
    this.attacks = this.attacks.filter((attack) => {
      if (attack.duration <= attack.now) {
        attack.target.takeDamage(attack.damage);
        return false;
      }
      return true;
    });
  }

  private shoot(): boolean {
    if (!this.target) {
      return false;
    }
    const isTargetInRange = distance(this.parent.pos, this.target!.pos) <= this.range;
    if (isTargetInRange) {
      this.attacks = [...this.attacks, this.getAttack(this.target!)];
      return true;
    }
    return false;
  }

  private getAttack(target: Enemy): Attack {
    return new ProjectileAttack(target, this.damage, 100, 0);
  }

  public setTarget(target: Enemy | null) {
    this.target = target;
  }
}
