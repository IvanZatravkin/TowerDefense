import { action, computed, makeObservable, observable } from "mobx";
import { Landscape } from "../landscape";
import { Base } from "./base";
import { Weapon } from "./weapon";

/**
 * Decorator that caches getter's result.
 */
function cached(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const getter = descriptor.get!;
  const symbol = Symbol(propertyKey);
  descriptor.get = function () {
    // @ts-ignore
    let cachedValue = this[symbol];
    if (cachedValue === undefined) {
      cachedValue = getter.call(this);
    }
    // @ts-ignore
    this[symbol] = cachedValue;
    return cachedValue;
  };
  return descriptor;
}

/**
 * Represents a single enemy.
 */
export class Enemy {
  type: "ranged" | "melee";
  initialHP: number;
  @observable
  currentHP: number;
  speed: number; // tiles per second
  @observable
  pos: Pos;
  @observable
  private landscape: Landscape;
  private targetBase: Base;
  public readonly weapon: Weapon;
  private onEnemyKilled?: (enemy: Enemy) => void;

  public score = 1;
  public gold = 1;

  constructor({
    initialHP,
    speed,
    pos,
    landscape,
    weapon,
    onEnemyKilled,
    type = "melee",
  }: {
    initialHP: number;
    speed: number;
    landscape: Landscape;
    pos: Pos;
    weapon: (enemy: Enemy) => Weapon;
    onEnemyKilled?: (enemy: Enemy) => void;
    type?: Enemy["type"];
  }) {
    this.initialHP = initialHP;
    this.currentHP = initialHP;
    this.speed = speed;
    this.pos = { ...pos };
    const targetBase = landscape.bases[0];
    this.landscape = landscape;
    this.targetBase = targetBase;
    this.weapon = weapon(this);
    this.weapon.setTarget(this.targetBase);
    this.type = type;
    this.onEnemyKilled = onEnemyKilled;
    makeObservable(this, undefined, { proxy: false });
  }

  @computed({ keepAlive: true })
  public get state() {
    return this.path.length == 0 ? "attacking" : "moving";
  }

  @cached
  protected get path() {
    const weaponRange = this.weapon.range;
    const maxDistance = this.landscape.distanceMap.reduce((max, tile) => Math.max(max, tile.distance), 0);
    const tilesInRange = this.landscape.distanceMap.filter(
      (tile) => tile.distance == Math.min(weaponRange, maxDistance)
    );

    const paths = tilesInRange
      .map((tile) => this.landscape.grid.findPath(this.landscape.grid.get(this.pos.x, this.pos.y)!, tile.hex))
      .filter((path) => path.length > 0)
      .sort((a, b) => a.length - b.length);
    const shortestPathLength = paths[0].length;
    const longestPathLength = paths[paths.length - 1].length;
    const median = (shortestPathLength + longestPathLength) * 0.5;
    const shortestPaths = paths.filter((path) => path.length <= median);
    const pathsCount = shortestPaths.length;
    // pick the lowest of 2 random rolls to select path
    const pathIndex = Math.min(Math.floor(Math.random() * pathsCount), Math.floor(Math.random() * pathsCount));
    return observable.array(shortestPaths[pathIndex].slice());
  }

  @computed({ keepAlive: true })
  public get direction() {
    const nextTile = this.path[this.path.length - 1];
    const directionToBase = {
      x: Math.sign(this.targetBase.pos.x - this.pos.x),
      y: Math.sign(this.targetBase.pos.y - this.pos.y),
    };
    if (!nextTile || this.state === "attacking") {
      return directionToBase;
    }
    const x = Math.sign(nextTile.x - this.pos.x);
    const y = Math.sign(nextTile.y - this.pos.y);
    if (x === 0 && y === 0) {
      return directionToBase;
    }
    return {
      x,
      y,
    };
  }

  /**
   * Runs enemy for a single tick.
   * @param delta - time passed since last tick in milliseconds
   */
  @action
  public tick(delta: number) {
    if (this.currentHP === 0) {
      return;
    }
    // enemies move towards the base
    const nextTile = this.path[this.path.length - 1];
    if (!nextTile) {
      this.weapon.tick(delta);
      return;
    }
    this.pos = updatePosition(this.pos, nextTile, this.speed, delta);
    if (this.pos.x === nextTile.x && this.pos.y === nextTile.y) {
      this.path.pop();
    }
  }

  @action
  public takeDamage(damage: number) {
    const previousHP = this.currentHP;
    this.currentHP = Math.max(0, this.currentHP - damage);
    if (this.isDead) {
      this.landscape.removeEnemy(this);
    }
    if (this.isDead && previousHP > 0) {
      this.onEnemyKilled?.(this);
    }
  }

  @computed
  public get isDead() {
    return this.currentHP === 0;
  }
}

/**
 * Calculates new position of the enemy.
 * @param pos
 * @param target
 * @param speed
 * @param delta
 */
export const updatePosition = (pos: Pos, target: Pos, speed: number, delta: number) => {
  const distance = Math.sqrt(Math.pow(target.x - pos.x, 2) + Math.pow(target.y - pos.y, 2));
  const distanceTraveled = (speed * delta) / 1000;
  if (distance < distanceTraveled) {
    return { ...target };
  } else {
    const angle = Math.atan2(target.y - pos.y, target.x - pos.x);
    return {
      x: pos.x + Math.cos(angle) * distanceTraveled,
      y: pos.y + Math.sin(angle) * distanceTraveled,
    };
  }
};
