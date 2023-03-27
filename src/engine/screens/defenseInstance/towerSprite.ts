import { withSubscriptionsMixin } from "utils/withSubscriptions";
import * as PIXI from "pixi.js";
import { Container, Sprite } from "pixi.js";
import { Tower } from "state/defenseInstance/entities/tower";
import { autorun } from "mobx";
import { cube2RowCol, Hexagon } from "engine/utils/hexagon";
import tower1Texture from "resources/sprites/tower1.png";
import { Attack } from "state/defenseInstance/entities/weapon";
import { ProjectileSprite } from "./projectileSprite";

const tower1 = PIXI.Texture.from(tower1Texture);

export class TowerSprite extends withSubscriptionsMixin(Container) {
  private projectiles: Map<Attack, Container> = new Map();
  constructor(tower: Tower) {
    super();
    const sprite = new Sprite(tower1);
    sprite.width = 384;
    sprite.height = 384;
    this.addChild(sprite);
    sprite.x = -sprite.width / 2;
    sprite.y = -sprite.height / 2;

    this.addSubscription(
      autorun(() => {
        const hex = new Hexagon(tower.pos.x, tower.pos.y, -(tower.pos.x + tower.pos.y), TILE_SIZE);
        this.x = hex.center.x;
        this.y = hex.center.y;
      })
    );

    this.addSubscription(
      autorun(() => {
        const { row, col } = cube2RowCol(tower.pos.x, tower.pos.y);
        this.zIndex = row * 10000 + col;
      })
    );

    this.addSubscription(
      autorun(() => {
        tower.attacks.forEach((attack) => {
          if (!this.projectiles.has(attack)) {
            const projectile = new ProjectileSprite(attack, tower.pos);
            this.projectiles.set(attack, projectile);
            this.addChild(projectile);
          }
        });
        this.projectiles.forEach((projectile, attack) => {
          if (!tower.attacks.includes(attack)) {
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
}
