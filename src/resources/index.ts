import { Assets, Texture } from "pixi.js";
import base from "./sprites/base.png";
import rocks from "./sprites/rocks1-squared.png";
import tiles from "./sprites/stone_tiles1-squared.png";
import tower from "./sprites/tower1.png";
import MeleeSpriteSheet from "./sprites/warrior_sheet.png";
import ArcherSheet from "./sprites/archer_sheet.png";
import HealingRune from "./sprites/healing_rune.png";
import ExplosionRune from "./sprites/explosion_rune.png";

import { frameHeight, frameWidth, makeAtlas } from "./makeAtlas";
import { meleeAnimations } from "./meleeAnimations";
import { archerAnimations } from "./archerAnimations";

export const meleeAtlas = makeAtlas(MeleeSpriteSheet, 372, 372, meleeAnimations, ["-1,0", "0,1", "-1,1"]);
export const archerAtlas = makeAtlas(MeleeSpriteSheet, frameWidth, frameHeight, archerAnimations, [
  "-1,0",
  "-1,1",
  "0,1",
]);

const assets = {
  base,
  rocks,
  tiles,
  tower,
  melee: MeleeSpriteSheet,
  archer: ArcherSheet,
  healingRune: HealingRune,
  explosionRune: ExplosionRune,
} as const;

Assets.addBundle("game", assets);
export const resources: { [s in keyof typeof assets]: Texture } = {} as any;
export const resourcesPromise = Assets.loadBundle("game");
resourcesPromise.then((res) => {
  for (const key in assets) {
    // @ts-ignore
    resources[key] = res[key];
  }
});
