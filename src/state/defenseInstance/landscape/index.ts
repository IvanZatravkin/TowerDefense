import { DimensionlessHexagon, distance, HexagonalGrid, RectangularGrid } from "engine/utils/hexagon";
import { action, computed, makeObservable, observable } from "mobx";
import { Tower } from "../entities/tower";
import { Enemy } from "../entities/enemy";
import { Base } from "../entities/base";
import { generateLayout } from "./generateLayout";

export class Tile extends DimensionlessHexagon implements Pos {
  passable = false;
}

class DefaultBase extends Base {
  constructor(pos: Pos) {
    super(100, pos);
  }
}

/**
 * Represents landscape of the map.
 */
export class Landscape {
  /** Rectangular map of hexagons */
  public readonly grid: HexagonalGrid<Tile>;
  /** Points where enemies spawn. Usually at the edge of the map */
  public spawnPoints: Tile[];
  @observable
  public readonly towers: Tower[];
  public readonly bases: Base[];
  @observable
  public readonly enemies: Enemy[] = [];

  /**
   * Creates new landscape.
   * @param width - width of the map in hexagons
   * @param height - height of the map in hexagons
   * @param config - configuration of the map
   * @param config.spawnPoints - points where enemies spawn. Usually at the edge of the map
   * @param config.basePos - position of the base
   */
  constructor(
    private width: number,
    private height: number,
    config: {
      basePos: Pos;
      spawnPoints: Pos[];
    }
  ) {
    this.spawnPoints = [];
    this.towers = [];
    this.grid = new RectangularGrid(width, height, (...coords) => new Tile(...coords));
    this.spawnPoints = config.spawnPoints.map((pos) => this.grid.get(pos.x, pos.y)!);
    this.bases = [new DefaultBase(config.basePos)];
    // generate paths from spawnPoints to bases
    const passableTiles = generateLayout(this.grid, {
      basePos: [this.grid.get(config.basePos.x, config.basePos.y)!],
      spawnPoints: this.spawnPoints,
    });
    passableTiles.forEach((tile) => {
      tile.passable = true;
    });
    this.bases.forEach((base) => {
      const tile = this.grid.get(base.pos.x, base.pos.y);
      if (tile) {
        tile.passable = false;
      }
    });
    makeObservable(this, undefined, {
      proxy: false,
      deep: false,
    });
  }

  /**
   * Returns all enemies in range around given position ordered by distance.
   */
  public getEnemiesInRange(pos: Pos, range: number): Enemy[] {
    return this.enemies
      .filter((enemy) => {
        return distance(pos, enemy.pos) <= range;
      })
      .sort((a, b) => distance(pos, a.pos) - distance(pos, b.pos));
  }

  /**
   * Add enemy to the map.
   */
  @action
  public addEnemy(enemy: Enemy) {
    this.enemies.push(enemy);
  }

  /**
   * Remove enemy from the map.
   */
  @action
  public removeEnemy(enemy: Enemy) {
    (this as any).enemies = this.enemies.filter((e) => e !== enemy);
  }

  /**
   * Runs landscape for a single tick.
   */
  @action
  public tick(delta: number) {
    this.enemies.forEach((enemy) => enemy.tick(delta));
    this.towers.forEach((tower) => tower.tick(delta));
  }

  /**
   * Add tower to the map.
   */
  @action
  public addTower(tower: Tower) {
    // towers can't occupy the same tile
    if (this.towers.some((t) => t.pos.x === tower.pos.x && t.pos.y === tower.pos.y)) {
      return false;
    }
    this.towers.push(tower);
    return true;
  }

  /**
   * Returns all hexes with distances to the closest base.
   */
  @computed
  public get distanceMap() {
    const basesPositions = this.bases.map((base) => base.pos);
    const hexes = this.grid.hexagonsArray.filter((hex) => hex.passable);

    const distances = hexes.map((hex) => {
      const distances = basesPositions.map((basePos) => distance(hex, basePos));
      return Math.min(...distances);
    });
    return hexes.map((hex, i) => ({ hex, distance: distances[i] }));
  }
}
