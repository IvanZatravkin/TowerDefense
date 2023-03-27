import { makeAutoObservable, makeObservable, action, observable, computed } from "mobx";
import { DimensionlessHexagon, CircularGrid } from "engine/utils/hexagon";
import type { Store } from "../index";

export abstract class MapTile extends DimensionlessHexagon {
  @observable
  public mouseOver = false;
  @observable
  public controlledBy = 0;
  private static id = 0;
  public readonly id = MapTile.id++;

  constructor(x: number, y: number, z: number) {
    super(x, y, z);
    makeObservable(this, undefined, { deep: false, proxy: false });
  }

  @computed
  public get initialColor() {
    if (this.controlledBy === 1) {
      return 0xaaffaa;
    }
    return 0xffaaaa;
  }

  @computed
  get color(): number {
    // darken color by 50% if mouse is over
    // separate into rgb components
    const r = (this.initialColor >> 16) & 0xff;
    const g = (this.initialColor >> 8) & 0xff;
    const b = this.initialColor & 0xff;
    // darken
    const r2 = Math.floor(r * (this.mouseOver ? 0.5 : 1));
    const g2 = Math.floor(g * (this.mouseOver ? 0.5 : 1));
    const b2 = Math.floor(b * (this.mouseOver ? 0.5 : 1));
    // combine back into a single number
    return (r2 << 16) + (g2 << 8) + b2;
  }

  @action
  setMouseOver(mouseOver: boolean) {
    this.mouseOver = mouseOver;
  }

  abstract click(): void;

  public setOwner(owner: number) {
    this.controlledBy = owner;
  }
}

/**
 * Represents state of the world map:
 */
export class WorldMap {
  public grid: CircularGrid<MapTile>;

  constructor(mapRadius: number, store: Store) {
    class _Tile extends MapTile {
      public click() {
        store.startInstance();
      }
    }
    this.grid = new CircularGrid(mapRadius, (...coords) => new _Tile(...coords));
    this.grid.get(0, 0, 0)!.setOwner(1);
    makeAutoObservable(this, {}, { autoBind: true, proxy: false });
  }
}
