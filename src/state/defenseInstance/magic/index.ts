/**
 * Provides spell-casting functionality for a defense instance.
 * This includes using abilities, casting spells, etc.
 */

import { action, makeObservable, observable } from "mobx";
import type { Landscape } from "../landscape";
import type { DefenseInstance } from "../";
import type { Base } from "../entities/base";

export abstract class Spell {
  ["constructor"]!: typeof Spell;

  @observable
  public expired = false;
  public abstract type: string;
  /**
   * Creates a new spell.
   * @param landscape - landscape to cast the spell on
   * @param tile - tile to cast the spell at
   */
  constructor(protected landscape: Landscape, public readonly tile: Pos) {
    makeObservable(this, undefined);
  }

  /**
   * Casts the spell.
   */
  abstract tick(delta: number): void;

  static canBeCast(tile: Pos, landscape: Landscape) {
    return true;
  }
}

export class FireballSpell extends Spell {
  public type = "fireball";
  public radius = 0.5;
  public damage = 10;

  tick() {
    const enemies = this.landscape.getEnemiesInRange(this.tile, this.radius);
    enemies.forEach((enemy) => {
      enemy.takeDamage(this.damage);
    });
    this.expired = true;
  }

  static canBeCast(tile: Pos, landscape: Landscape) {
    return true;
  }
}

export class FireRingSpell extends FireballSpell {
  type = "fire_ring";

  constructor(landscape: Landscape, tile: Pos, { radius = 1, damage = 10 }: { radius?: number; damage?: number } = {}) {
    super(landscape, tile);
    this.radius = radius;
    this.damage = damage;
  }
}

export class ForceFieldSpell extends Spell {
  public type = "forcefield";
  public readonly effectTime = 5000;
  @observable
  private $elapsed = 0;
  private effect: Effect = {
    type: "forcefield",
    takeDamage: () => 0,
  };
  private base: Base;
  constructor(...args: ConstructorParameters<typeof Spell>) {
    super(...args);
    makeObservable(this, undefined);
    this.base = this.landscape.bases.find((base) => base.pos.x === this.tile.x && base.pos.y === this.tile.y)!;
  }

  tick(delta: number) {
    if (this.$elapsed === 0) {
      this.base.addEffect(this.effect);
    }
    this.$elapsed += delta;
    if (this.$elapsed >= this.effectTime) {
      this.expired = true;
      this.base.removeEffect(this.effect);
    }
  }

  get elapsed() {
    return this.$elapsed;
  }

  static canBeCast(tile: Pos, landscape: Landscape) {
    return landscape.bases.find((base) => base.pos.x === tile.x && base.pos.y === tile.y) !== undefined;
  }
}

const spellConstructors = {
  fireball: FireballSpell,
  forcefield: ForceFieldSpell,
  fire_ring: FireRingSpell,
} as const;

export class MagicProvider {
  @observable
  public cooldowns: Record<keyof typeof spellConstructors, number> = {
    fireball: 500,
    forcefield: 15000,
    fire_ring: 0,
  };
  @observable
  public remainingCooldowns: Record<keyof typeof spellConstructors, number> = {
    fireball: 0,
    forcefield: 0,
    fire_ring: 0,
  };
  @observable
  public activeSpells: Spell[] = [];
  constructor(private landscape: Landscape, private defenseInstance: DefenseInstance) {
    makeObservable(this, undefined, {
      proxy: false,
    });
  }

  /**
   * Casts a spell.
   * @param spell - spell to cast
   * @param pos - position to cast the spell at
   * @param props - properties to pass to the spell constructor (if any)
   */
  @action
  castSpell<Spell extends keyof typeof spellConstructors>(
    spell: Spell,
    pos: Pos,
    props?: typeof spellConstructors[Spell] extends new (a: any, b: any, props: infer P) => any ? P : never
  ) {
    const tile = this.landscape.grid.get(pos.x, pos.y);
    if (!tile || !spellConstructors[spell].canBeCast(pos, this.landscape)) {
      return false;
    }
    if (this.remainingCooldowns[spell] > 0) {
      return false;
    }
    this.remainingCooldowns[spell] = this.cooldowns[spell];
    this.activeSpells.push(new spellConstructors[spell](this.landscape, pos, props as any));
    return true;
  }

  /**
   * Updates the magic provider.
   */
  @action
  tick(delta: number) {
    this.activeSpells.forEach((spell) => {
      spell.tick(delta);
    });
    Object.keys(this.remainingCooldowns).forEach((spell) => {
      this.remainingCooldowns[spell] = Math.max(0, this.remainingCooldowns[spell] - delta);
    });
    this.activeSpells = this.activeSpells.filter((spell) => !spell.expired);
  }
}
