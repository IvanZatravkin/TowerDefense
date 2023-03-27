import * as PIXI from "pixi.js";

import type { FireballSpell } from "../../state/defenseInstance/magic";
import fireballFragment from "./fireball.frag";
import fireballVertexShader from "./base.vert";

export class FireballSprite extends PIXI.Sprite {
  constructor(fireballSpell: FireballSpell) {
    super();
    const radius = fireballSpell.radius * TILE_SIZE * 2;
    const filter = new PIXI.Filter(fireballVertexShader, fireballFragment);
    filter.autoFit = false;
    this.filters = [filter];
    filter.uniforms.iTime = 0;
    filter.uniforms.seed = Math.random() * 10000;
    this.width = radius;
    this.height = radius;
    const start = Date.now();
    let finished = false;

    this.on("added", () => {
      navigator.vibrate?.(100);
      const raf = () => {
        if (finished) {
          return;
        }
        filter.uniforms.iTime = (Date.now() - start) / 200;
        requestAnimationFrame(raf);
        if (filter.uniforms.iTime > 2) {
          finished = true;
          this.destroy();
        }
      };
      raf();
    });

    this.on("removed", () => {
      finished = true;
    });
  }
}
