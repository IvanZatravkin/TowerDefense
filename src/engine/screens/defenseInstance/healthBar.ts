import * as PIXI from "pixi.js";
import { autorun } from "mobx";
import { withSubscriptionsMixin } from "utils/withSubscriptions";

export class HealthBar extends withSubscriptionsMixin(PIXI.Container) {
  constructor(
    entity: { currentHP: number; initialHP: number },
    { width = 80, height = 5 }: { width?: number; height?: number } = {}
  ) {
    super();
    const background = new PIXI.Graphics();
    background.beginFill(0x000000);
    background.drawRect(0, 0, width, height);
    background.endFill();
    this.addChild(background);
    const foreground = new PIXI.Graphics();
    foreground.beginFill(0xff0000);
    foreground.drawRect(0, 0, width, height);
    foreground.endFill();
    this.addChild(foreground);
    // HealthBar is updated when entity's HP changes
    this.addSubscription(
      autorun(() => {
        foreground.scale.x = entity.currentHP / entity.initialHP;
      })
    );
  }
}
