import * as PIXI from "pixi.js";
import { autorun } from "mobx";
import type { Store } from "state";
import { animateProperty } from "engine/utils/animatedValue";
import type { DefenseInstance } from "state/defenseInstance";
import { withSubscriptionsMixin } from "utils/withSubscriptions";
import { findLeftmostChild, findTopmostChild } from "../../utils/children";
import { BaseLayer, EnemyLayer, LootLayer, SpellsLayer, TerrainLayer, TowerLayer } from "./layers";

export class DefenseInstanceScreen extends withSubscriptionsMixin(PIXI.Container) {
  /**
   * Layers are used to lay different sprites on top of each other. I.e. towers should be on top of the terrain.
   * @private
   */
  private layers: {
    terrain: TerrainLayer;
    towers: TowerLayer;
    enemies: EnemyLayer;
    bases: BaseLayer;
    spells: SpellsLayer;
    loot: LootLayer;
  };
  constructor(defenseInstance: DefenseInstance, store: Store) {
    super();
    this.layers = {
      terrain: new TerrainLayer(defenseInstance),
      towers: new TowerLayer(),
      enemies: new EnemyLayer(),
      bases: new BaseLayer(),
      spells: new SpellsLayer(),
      loot: new LootLayer(defenseInstance),
    };
    const container = new PIXI.Container();
    this.addChild(container);
    container.addChild(this.layers.terrain);
    container.addChild(this.layers.towers);
    container.addChild(this.layers.enemies);
    container.addChild(this.layers.bases);
    container.addChild(this.layers.spells);
    container.addChild(this.layers.loot);
    [
      () => this.layers.terrain.draw([...defenseInstance.landscape.grid.hexagons.values()]),
      () => this.layers.enemies.draw(defenseInstance.landscape.enemies),
      () => this.layers.towers.draw(defenseInstance.landscape.towers),
      () => this.layers.bases.draw(defenseInstance.landscape.bases),
      () => this.layers.spells.draw(defenseInstance.activeSpells),
      () => this.layers.loot.draw([...defenseInstance.loot.values()]),
    ].forEach((fn) => this.addSubscription(autorun(fn)));

    this.addSubscription(animateProperty(this, "alpha", () => +(store.activeScreen === "defenseInstance"), 0.01));

    setTimeout(() => {
      // find leftmost child and use its coordinate to move container to align it with the left edge of the screen
      const leftmostChild = findLeftmostChild(this.layers.terrain.children);
      container.x = -leftmostChild.x + TILE_SIZE / 2;

      // find topmost child and use its coordinate to move container to align it with the top edge of the screen
      const topmostChild = findTopmostChild(this.layers.terrain.children);

      container.y = -topmostChild.y + TILE_SIZE * 1.5;
    }, 0);
  }

  get interactiveChildren() {
    return this.alpha === 1;
  }
}
