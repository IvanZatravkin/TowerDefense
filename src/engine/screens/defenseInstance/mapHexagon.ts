import { HexagonSprite } from "engine/containers/hexagonSprite";
import { Tile } from "state/defenseInstance/landscape";
import * as PIXI from "pixi.js";
import { DefenseInstance } from "state/defenseInstance";
import { Hexagon } from "engine/utils/hexagon";
import { localToCube } from "../../../utils/hexagons";

const SPRITE_SIZE = 512;

export class MapHexagon extends HexagonSprite {
  constructor(hexagon: Tile, texture: PIXI.Texture, defenseInstance: DefenseInstance) {
    const h = Hexagon.fromDimensionless(hexagon, SPRITE_SIZE / 2);
    super(h, texture);
    this.interactive = true;
    this.on("pointerdown", (e) => {
      const local = this.toLocal(e.data.global);
      const cube = localToCube(local, SPRITE_SIZE / 2);
      defenseInstance.castSpell({ x: hexagon.x + cube.x, y: hexagon.y + cube.y });
    });

    this.on("mouseenter", () => {
      this.sprite.tint = 0xaaaaaa;
    });
    this.on("mouseleave", () => {
      this.sprite.tint = 0xffffff;
    });
  }
}
