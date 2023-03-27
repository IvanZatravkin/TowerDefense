import { Hexagon } from "engine/utils/hexagon";
import { withSubscriptionsMixin } from "utils/withSubscriptions";
import * as PIXI from "pixi.js";
import { Attack } from "state/defenseInstance/entities/weapon";
import { autorun } from "mobx";

const makeHex = (x: number, y: number, z: number = -(x + y)) => new Hexagon(x, y, z, TILE_SIZE);

export class ProjectileSprite extends withSubscriptionsMixin(PIXI.Container) {
  constructor(attack: Attack, initialPos: Pos) {
    super();
    // mock projectile using a red circle
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xff0000);
    graphics.drawCircle(0, 0, 15);
    graphics.endFill();
    this.addChild(graphics);
    this.addSubscription(
      autorun(() => {
        // interpolate between initialPos and attack.target.pos
        // to get coordinates in pixels we use makeHex
        const progress = attack.now / attack.duration;
        const startHex = makeHex(initialPos.x, initialPos.y);
        const endHex = makeHex(attack.target.pos.x, attack.target.pos.y);
        // coordinates are relative to startHex
        this.x = (endHex.center.x - startHex.center.x) * progress;
        this.y = (endHex.center.y - startHex.center.y) * progress;
      })
    );
  }
}
