import * as PIXI from "pixi.js";
import { autorun } from "mobx";
import { withSubscriptionsMixin } from "utils/withSubscriptions";
import { Hexagon } from "../utils/hexagon";

export class HexagonSprite extends withSubscriptionsMixin(PIXI.Container) {
  protected sprite: PIXI.Sprite;

  constructor(public hexagon: Hexagon, texture: PIXI.Texture) {
    super();
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.hitArea = new PIXI.Polygon(...this.hexagon.points);
    this.sprite.texture = texture;
    this.addChild(this.sprite);
    this.addSubscription(
      autorun(() => {
        this.draw();
      })
    );
  }

  draw() {
    this.x = this.hexagon.center.x;
    this.y = this.hexagon.center.y;
  }
}
