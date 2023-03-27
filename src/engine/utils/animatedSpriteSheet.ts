import { withSubscriptionsMixin } from "../../utils/withSubscriptions";
import * as PIXI from "pixi.js";
import { AnimatedSprite } from "pixi.js";
import { computed, makeObservable, reaction } from "mobx";

/**
 * Animated spritesheet class. Encapsulates logic related to
 * picking sprite based on direction and flipping it if needed.
 * Accepts "getDirection" function that returns direction observable.
 */
export class AnimatedSpriteSheet extends withSubscriptionsMixin(AnimatedSprite) {
  /** -1,0 - bottom left; 0,1 - top left; -1,1 - left **/
  static scaleMap: { [direction: string]: number } = {
    "-1,0": 1,
    "0,1": 1,
    "-1,1": 1,
    "1,0": -1,
    "0,-1": -1,
    "1,-1": -1,
  };

  static directionMap: { [direction: string]: { x: 1 | -1 | 0; y: 1 | -1 | 0 } } = {
    "-1,0": { x: -1, y: 0 },
    "0,1": { x: 0, y: 1 },
    "-1,1": { x: -1, y: 1 },
    "1,0": { x: 0, y: 1 },
    "0,-1": { x: -1, y: 0 },
    "1,-1": { x: -1, y: 1 },
  };

  public onReady: Promise<void>;

  constructor(
    private spriteSheet: PIXI.Spritesheet,
    animationKey: string,
    private getDirection: () => { x: number; y: number },
    private getAnimationKey: () => string
  ) {
    super([PIXI.Texture.EMPTY]);

    makeObservable(this, undefined, { proxy: false });
    this.onReady = spriteSheet.parse().then(() => {
      this.addSubscription(
        reaction(
          () => this.getDirection(),
          (direction, oldDirection) => {
            if (oldDirection && direction.x === oldDirection.x && direction.y === oldDirection.y) {
              return;
            }
            this.switchSheet(direction, this.animationKey);
          },
          { fireImmediately: true }
        )
      );

      this.addSubscription(
        reaction(
          () => this.animationKey,
          (animationKey, oldKey) => {
            if (oldKey === animationKey) {
              return;
            }
            this.switchSheet(this.getDirection(), animationKey);
          }
        )
      );
    });
  }

  @computed
  get animationKey() {
    return this.getAnimationKey();
  }

  private switchSheet(direction: Pos, animationKey: string) {
    const remappedDirection = AnimatedSpriteSheet.directionMap[`${direction.x},${direction.y}`];
    const scale = AnimatedSpriteSheet.scaleMap[`${direction.x},${direction.y}`];
    const { x, y } = remappedDirection;
    const key = `${x},${y}-${animationKey}`;
    if (this.spriteSheet.animations[key]) {
      this.currentFrame = 0;
      this.textures = this.spriteSheet.animations[key];
      this.play();
      this.scale.x = scale;
      this.x = (-scale * this.width) / 2;
      this.y = -this.height / 2;
    }
  }
}
