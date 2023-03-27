import * as PIXI from "pixi.js";

export abstract class Layer<Entity = any> extends PIXI.Container {
  protected sprites: Map<Entity, PIXI.Container> = new Map();

  abstract getSprite(entity: Entity): PIXI.Container;
  sortableChildren = true;

  draw(entities: Entity[]) {
    const set = new Set(entities);
    // remove children not present in the map
    for (const [key, sprite] of this.sprites) {
      if (!set.has(key)) {
        sprite.destroy();
        this.removeChild(sprite);
        this.sprites.delete(key);
      }
    }
    // add children not present in the sprites
    for (const entity of entities) {
      if (!this.sprites.has(entity)) {
        const sprite = this.getSprite(entity);
        this.addChild(sprite);
        this.sprites.set(entity, sprite);
      }
    }
  }
}
