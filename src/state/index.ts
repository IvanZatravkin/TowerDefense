import { action, makeObservable, observable } from "mobx";
import { rowCol2Cube } from "../engine/utils/hexagon";
import { WorldMap } from "./worldMap";
import { DefenseInstance } from "./defenseInstance";

export class Store {
  /**
   * The world map:
   */
  @observable
  worldMap: WorldMap = new WorldMap(2, this);
  @observable
  defenseInstance: DefenseInstance | null = null;
  @observable
  public activeScreen: "worldMap" | "defenseInstance" = "worldMap";
  @observable
  scores: number[] = JSON.parse(localStorage["scores"] || "[]");

  constructor() {
    makeObservable(this, undefined, {
      proxy: false,
      deep: false,
    });
  }

  @action
  public startInstance(width = 14, height = 14) {
    this.activeScreen = "defenseInstance";
    this.defenseInstance = new DefenseInstance(width, height, {
      basePos: rowCol2Cube(Math.round(width / 2), Math.round(width / 2)),
      spawnPoints: [
        rowCol2Cube(0, 0),
        rowCol2Cube(0, height - 1),
        rowCol2Cube(width - 1, 0),
        rowCol2Cube(width - 1, height - 1),
      ],
      parentTile: {},
    });
  }

  @action
  public endInstance() {
    this.activeScreen = "worldMap";
    if (this.defenseInstance) {
      const winner = this.defenseInstance.over;
      if (winner === 1) {
        // this.defenseInstance.parentTile.setOwner(1);
      }
      this.scores.push(this.defenseInstance.score);
      this.scores.sort((a, b) => b - a);
      this.scores = this.scores.slice(0, 10);
      localStorage["scores"] = JSON.stringify(this.scores);
      this.defenseInstance.destroy();
      this.defenseInstance = null;
    }
  }
}

export const store = new Store();
