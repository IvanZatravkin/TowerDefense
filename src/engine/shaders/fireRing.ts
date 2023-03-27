import * as PIXI from "pixi.js";

import fireRingFrag from "./firering.frag";
import baseVertex from "./base.vert";
import type { FireRingSpell } from "../../state/defenseInstance/magic";

export class FireRingSprite extends PIXI.Sprite {
  constructor(spell: FireRingSpell) {
    super();
    const radius = spell.radius * TILE_SIZE * 2;
    const filter = new PIXI.Filter(baseVertex, fireRingFrag);
    filter.autoFit = false;
    this.filters = [filter];
    filter.uniforms.iTime = 0;
    filter.uniforms.seed = Math.random() * 10000;
    this.width = radius;
    this.height = radius;
    const start = Date.now();
    let finished = false;

    this.on("added", () => {
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
