import { Layer } from "engine/utils/layer";
import { Tower } from "state/defenseInstance/entities/tower";
import { Tile } from "state/defenseInstance/landscape";
import { DefenseInstance, Loot } from "state/defenseInstance";
import { cube2RowCol, Hexagon } from "engine/utils/hexagon";
import { FireballSpell, FireRingSpell, ForceFieldSpell, Spell } from "state/defenseInstance/magic";
import { FireballSprite } from "engine/shaders/fireball";
import * as PIXI from "pixi.js";
import Base1 from "resources/sprites/base.png";
import { Base } from "state/defenseInstance/entities/base";
import Rocks1 from "resources/sprites/rocks1-squared.png";
import StoneTiles1 from "resources/sprites/stone_tiles1-squared.png";
import { Enemy } from "state/defenseInstance/entities/enemy";
import { ForcefieldSprite } from "../../shaders/forcefield";
import { MapHexagon } from "./mapHexagon";
import { TowerSprite } from "./towerSprite";
import { EnemySprite } from "./enemySprite";
import { HealthBar } from "./healthBar";
import { FireRingSprite } from "../../shaders/fireRing";
import ExplosionRune from "resources/sprites/explosion_rune.png";
import HealingRune from "resources/sprites/healing_rune.png";

const tiles = [Rocks1, StoneTiles1];
const textures = tiles.map((tile) => PIXI.Texture.from(tile));
const baseTexture = PIXI.Texture.from(Base1);
const explosionTexture = PIXI.Texture.from(ExplosionRune);
const healingTexture = PIXI.Texture.from(HealingRune);

export class EnemyLayer extends Layer<Enemy> {
  getSprite(enemy: Enemy) {
    return new EnemySprite(enemy);
  }
}

export class TerrainLayer extends Layer<Tile> {
  constructor(private defenseInstance: DefenseInstance) {
    super();
  }

  getSprite(tile: Tile) {
    const hex = new MapHexagon(tile, tile.passable ? textures[1] : textures[0], this.defenseInstance);
    const { row, col } = cube2RowCol(tile.x, tile.y, tile.z);
    hex.zIndex = row * 1000 + col + (tile.passable ? 0 : 1000000);
    return hex;
  }
}

export class TowerLayer extends Layer<Tower> {
  getSprite(tower: Tower) {
    return new TowerSprite(tower);
  }
}

export class SpellsLayer extends Layer<Spell> {
  getSprite(spell: Spell) {
    const hex = new Hexagon(spell.tile.x, spell.tile.y, -(spell.tile.x + spell.tile.y), TILE_SIZE);
    let sprite: PIXI.Sprite = new PIXI.Sprite();
    switch (spell.type) {
      case "fireball":
        sprite = new FireballSprite(spell as FireballSpell);
        break;
      case "forcefield":
        sprite = new ForcefieldSprite(spell as ForceFieldSpell);
        break;
      case "fire_ring":
        sprite = new FireRingSprite(spell as FireRingSpell);
        break;
    }
    sprite.x = hex.center.x - sprite.width / 2;
    sprite.y = hex.center.y - sprite.height / 2;
    return sprite;
  }

  draw(entities: Spell[]) {
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

export class BaseLayer extends Layer<Base> {
  getSprite(base: Base) {
    const sprite = new PIXI.Sprite(baseTexture);
    const hex = new Hexagon(base.pos.x, base.pos.y, -(base.pos.x + base.pos.y), TILE_SIZE);
    sprite.scale.set(0.9, 0.9);

    const container = new PIXI.Container();
    const healthBar = new HealthBar(base, { width: 200 });
    container.addChild(sprite);
    container.addChild(healthBar);
    container.x = hex.center.x - sprite.width / 2;
    container.y = hex.center.y - sprite.height / 2;
    healthBar.x = -healthBar.width / 2 + container.width / 2;
    healthBar.y = 0;

    return container;
  }
}

export class LootLayer extends Layer<Loot> {
  constructor(private defenseInstance: DefenseInstance) {
    super();
  }
  getSprite(loot: Loot) {
    const hex = new Hexagon(loot.pos.x, loot.pos.y, -(loot.pos.x + loot.pos.y), TILE_SIZE);
    let finished = false;
    const container = new PIXI.Container();
    let sprite = new PIXI.Sprite();
    const rotationAnimationRaf = () => {
      sprite.rotation += 0.1;
      if (!finished) {
        requestAnimationFrame(rotationAnimationRaf);
      }
    };
    if (loot.type === "explosion") {
      sprite = new PIXI.Sprite(explosionTexture);
      sprite.width = 100;
      sprite.height = 100;
      requestAnimationFrame(rotationAnimationRaf);
    } else if (loot.type === "health") {
      sprite = new PIXI.Sprite(healingTexture);
      sprite.width = 100;
      sprite.height = 100;
      requestAnimationFrame(rotationAnimationRaf);
    } else {
      sprite = new PIXI.Text(loot.type);
    }
    sprite.pivot.set(sprite.width * 2, sprite.height * 2);
    // sprite.x -= sprite.width / 2;
    // sprite.y -= sprite.height / 2;

    sprite.interactive = true;
    sprite.on("pointerdown", () => {
      this.defenseInstance.consumeLoot(loot);
    });
    sprite.on("destroyed", () => (finished = true));

    container.x = hex.center.x - sprite.width / 2;
    container.y = hex.center.y - sprite.height / 2;
    container.addChild(sprite);

    return container;
  }
}
