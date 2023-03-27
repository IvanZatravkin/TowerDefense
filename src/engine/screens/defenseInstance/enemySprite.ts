import { withSubscriptionsMixin } from "utils/withSubscriptions";
import * as PIXI from "pixi.js";
import { Container, Sprite } from "pixi.js";
import { Enemy } from "state/defenseInstance/entities/enemy";
import { autorun } from "mobx";
import { cube2RowCol, Hexagon } from "engine/utils/hexagon";
import { Attack } from "state/defenseInstance/entities/weapon";
import { HealthBar } from "./healthBar";
import { ProjectileSprite } from "./projectileSprite";
import meleeTexture from "resources/sprites/warrior_sheet.png";
import archerTexture from "resources/sprites/archer_sheet.png";
import { archerAtlas, meleeAtlas } from "../../../resources";
import { AnimatedSpriteSheet } from "../../utils/animatedSpriteSheet";

const meleeBaseTexture = PIXI.Texture.from(meleeTexture);
const meleeSpriteSheet = new PIXI.Spritesheet(meleeBaseTexture, meleeAtlas);

const archerBaseTexture = PIXI.Texture.from(archerTexture);
const archerSpriteSheet = new PIXI.Spritesheet(archerBaseTexture, archerAtlas);

const sheetByClass = {
  melee: meleeSpriteSheet,
  ranged: archerSpriteSheet,
};

const RandomPosVariation = 0;

export class EnemySprite extends withSubscriptionsMixin(Sprite) {
  private projectiles: Map<Attack, Container> = new Map();
  private sheet: AnimatedSpriteSheet;

  constructor(enemy: Enemy) {
    super();
    const radius = 16;
    this.sheet = new AnimatedSpriteSheet(
      sheetByClass[enemy.type],
      "moving",
      () => enemy.direction,
      () => enemy.state
    );
    this.sheet.animationSpeed = 0.2;
    const randomOffsetX = Math.random() * RandomPosVariation;
    const randomOffsetY = Math.random() * RandomPosVariation;
    this.sheet.onReady.then(() =>
      this.addSubscription(
        autorun(() => {
          if (enemy.state === "attacking") {
            const frames = this.sheet.textures.length;
            const fireRate = enemy.weapon.fireRate;
            this.sheet.animationSpeed = 1 / fireRate / frames;
          }
        })
      )
    );
    this.addChild(this.sheet);
    this.addSubscription(
      autorun(() => {
        const hex = new Hexagon(enemy.pos.x, enemy.pos.y, -(enemy.pos.x + enemy.pos.y), 1);
        this.x = hex.center.x * TILE_SIZE - radius / 2 + randomOffsetX;
        this.y = hex.center.y * TILE_SIZE - radius / 2 + randomOffsetY;
      })
    );
    const healthBar = new HealthBar(enemy);
    this.addChild(healthBar);
    healthBar.x = -healthBar.width / 2;
    healthBar.y = -80;
    this.addSubscription(
      autorun(() => {
        const { row, col } = cube2RowCol(enemy.pos.x, enemy.pos.y);
        this.zIndex = row * 10000 + col;
      })
    );

    this.addSubscription(
      autorun(() => {
        enemy.weapon.attacks.forEach((attack) => {
          if (!this.projectiles.has(attack)) {
            const projectile = new ProjectileSprite(attack, enemy.pos);
            this.projectiles.set(attack, projectile);
            this.addChild(projectile);
          }
        });
        this.projectiles.forEach((projectile, attack) => {
          if (!enemy.weapon.attacks.includes(attack)) {
            projectile.destroy({
              children: true,
              texture: true,
              baseTexture: true,
            });
            this.projectiles.delete(attack);
            this.removeChild(projectile);
          }
        });
      })
    );
  }

  destroy(options?: PIXI.IDestroyOptions | undefined) {
    super.destroy(options);
    this.projectiles.forEach((projectile) => {
      projectile.destroy(options);
    });
    this.sheet.destroy(options);
  }
}
