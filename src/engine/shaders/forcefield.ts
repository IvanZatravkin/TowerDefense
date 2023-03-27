import * as PIXI from "pixi.js";

import { autorun } from "mobx";
import type { ForceFieldSpell } from "../../state/defenseInstance/magic";
import forcefieldFrag from "./forcefield.frag";
import forcefieldVert from "./base.vert";

export class ForcefieldSprite extends PIXI.Sprite {
  constructor(spell: ForceFieldSpell) {
    super();
    const radius = 2 * TILE_SIZE;
    const filter = new PIXI.Filter(forcefieldVert, forcefieldFrag);
    filter.autoFit = false;
    this.filters = [filter];
    filter.uniforms.iTime = 0;
    filter.uniforms.seed = Math.random() * 10000;
    filter.uniforms.remainingHP = 1;
    this.width = radius;
    this.height = radius;
    const start = Date.now();
    let finished = false;

    autorun(() => {
      if (spell.expired) {
        finished = true;
        this.parent?.removeChild(this);
        this.destroy();
      }
      filter.uniforms.remainingHP = 1 - spell.elapsed / spell.effectTime;
    });

    this.on("added", () => {
      const raf = () => {
        if (finished) {
          return;
        }
        filter.uniforms.iTime = (Date.now() - start) / 300;
        requestAnimationFrame(raf);
      };
      raf();
    });

    this.on("removed", () => {
      finished = true;
    });
  }
}
