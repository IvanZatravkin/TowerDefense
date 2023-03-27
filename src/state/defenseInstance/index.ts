/**
 * This file contains state responsible for TowerDefense instance.
 * Here player can build towers, upgrade them, etc.
 * Enemy waves are also generated here.
 */
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { WithSubscriptions } from "utils/withSubscriptions";
import { MersenneTwister19937, pick } from "random-js";
import { store } from "../index";
import { Enemy } from "./entities/enemy";
import { Landscape } from "./landscape";
import { BasicTower } from "./entities/tower";
import { MagicProvider, Spell } from "./magic";
import { generateWave } from "./generateWave";
import { distance } from "../../engine/utils/hexagon";

type GoldLoot = {
  type: "gold";
  amount: number;
};

type HealthLoot = {
  type: "health";
  amount: number;
};

type ExplosionLoot = {
  type: "explosion";
  radius: number;
  damage: number;
};

export type Loot = {
  pos: Pos;
} & (GoldLoot | HealthLoot | ExplosionLoot);

export class DefenseInstance extends WithSubscriptions {
  @observable
  public landscape: Landscape;
  public readonly parentTile: unknown;
  /** Enemies from pool that are not spawned yet */
  @observable.ref
  private enemyPool: Enemy[] = [];
  private lastEnemySpawnedAt = 0;
  private previousTick = Date.now();
  public readonly magicProvider: MagicProvider;
  @observable
  private _active_spell: "fireball" | "tower" | "force_field" = "fireball";
  public currentWave = 0;
  private rnd = MersenneTwister19937.autoSeed();

  @observable
  private $gold = 40;
  public score = 0;

  @observable
  public loot: Set<Loot> = new Set();

  public get gold() {
    return this.$gold;
  }
  constructor(
    width: number,
    height: number,
    config: {
      basePos: Pos;
      spawnPoints: Pos[];
      parentTile: unknown;
    }
  ) {
    super();
    this.landscape = new Landscape(width, height, config);
    this.magicProvider = new MagicProvider(this.landscape, this);
    this.parentTile = config.parentTile;

    this.startLoop();
    makeObservable(this, undefined, {
      proxy: false,
      deep: false,
    });
    this.addSubscription(
      autorun(() => {
        if (this.over) {
          store.endInstance();
        }
      })
    );
  }

  private generateWave() {
    this.currentWave++;
    return generateWave({
      wave: this.currentWave,
      rndGenerator: this.rnd,
      landscape: this.landscape,
      onEnemyKilled: this.onEnemyKilled,
      spawnPoints: this.landscape.spawnPoints,
    });
  }

  @action
  public onEnemyKilled = (enemy: Enemy) => {
    this.score += enemy.score;
    this.$gold += enemy.gold;
    this.generateLoot(enemy);
  };

  @action
  private generateLoot(enemy: Enemy) {
    const lootChange = 0.2;
    if (Math.random() < lootChange) {
      const lootType = pick(this.rnd, ["gold", "health", "explosion"]);
      switch (lootType) {
        case "gold":
          this.loot.add({
            pos: { ...enemy.pos },
            type: "gold",
            amount: 20,
          });
          break;
        case "health":
          this.loot.add({
            pos: { ...enemy.pos },
            type: "health",
            amount: 20,
          });
          break;
        case "explosion":
          this.loot.add({
            pos: { ...enemy.pos },
            type: "explosion",
            radius: 2,
            damage: this.currentWave * 30,
          });
          break;
      }
    }
  }

  public consumeLoot(loot: Loot) {
    this.loot.delete(loot);
    switch (loot.type) {
      case "gold":
        this.$gold += loot.amount;
        break;
      case "health":
        this.landscape.bases.forEach((base) => base.heal(loot.amount));
        break;
      case "explosion":
        this.magicProvider.castSpell("fire_ring", loot.pos, {
          radius: loot.radius,
          damage: loot.damage,
        });
        break;
    }
  }

  @computed
  public get over(): -1 | 0 | 1 {
    // game is over if base is destroyed or all enemies are killed
    const baseDestroyed = this.landscape.bases.some((base) => base.isDestroyed);
    // const allEnemiesKilled = this.landscape.enemies.length === 0 && this.enemyPool.length === 0;
    if (baseDestroyed) {
      return -1;
    }
    // if (allEnemiesKilled) {
    //   return 1;
    // }
    return 0;
  }

  @action
  forceWin() {
    this.landscape.enemies.forEach((enemy) => this.landscape.removeEnemy(enemy));
    this.enemyPool = [];
  }

  @action
  forceLose() {
    this.landscape.bases.forEach((base) => base.destroy());
  }

  private startLoop() {
    const loop = () => {
      if (this.over) {
        return;
      }
      this.tick();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  @action
  private tick() {
    const now = Date.now();
    if (!this.paused) {
      if (this.enemyPool.length === 0 && this.landscape.enemies.length === 0) {
        this.enemyPool = this.generateWave();
      }
      while (this.enemyPool.length > 0) {
        this.spawnEnemy();
      }

      this.landscape.tick(now - this.previousTick);
      this.magicProvider.tick(now - this.previousTick);
    }
    this.previousTick = now;
  }

  @computed
  public get paused() {
    return this.active_spell === "tower";
  }

  private spawnEnemy() {
    const enemy = this.enemyPool.pop();
    if (enemy) {
      this.lastEnemySpawnedAt = Date.now();
      this.landscape.addEnemy(enemy);
    }
  }

  @action
  public buildTower(tile: Pos) {
    const pos = this.landscape.grid.get(tile.x, tile.y)!;
    if (pos.passable) {
      return false;
    }
    const tower = new BasicTower(pos, this.landscape);
    if (this.gold < tower.cost) {
      return false;
    }
    const added = this.landscape.addTower(tower);
    if (added) {
      this.$gold -= tower.cost;
    }
    return added;
  }

  @action
  public castSpell(pos: Pos) {
    switch (this.active_spell) {
      case "fireball":
        this.magicProvider.castSpell("fireball", pos);
        break;
      case "tower":
        this.buildTower(pos);
        break;
      case "force_field":
        this.magicProvider.castSpell("forcefield", pos);
        break;
    }
  }

  @action
  public castForceField(pos: Pos) {
    const base = this.landscape.bases.find((base) => base.pos.y === pos.y && base.pos.x === pos.x);
    if (!base) {
      return;
    }
    this.magicProvider.castSpell("forcefield", pos);
  }

  public get activeSpells(): Spell[] {
    return this.magicProvider.activeSpells;
  }

  @computed
  get active_spell(): this["_active_spell"] {
    return this._active_spell;
  }

  @action
  setActiveSpell(value: this["_active_spell"]) {
    this._active_spell = value;
  }

  @action
  increaseScore(value: number) {
    this.score += value;
  }
}
