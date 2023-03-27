import * as PIXI from "pixi.js";
import { autorun } from "mobx";
import { Store } from "../state";
import { WorldMapScreen } from "./screens/worldMap";
import { DefenseInstanceScreen } from "./screens/defenseInstance";

/**
 * Automatically centers children of this container
 */
class CenteringContainer extends PIXI.Container {
  constructor(refObj: PIXI.Container) {
    super();
    let alive = true;
    const raf = () => {
      if (!alive) {
        return;
      }
      this.children.forEach((child) => {
        if ("width" in child && "height" in child && child !== refObj && child instanceof PIXI.Container) {
          const newScale = Math.min(
            // @ts-ignore
            refObj.width / child.layers.terrain.width,
            // @ts-ignore
            refObj.height / child.layers.terrain.height
          );
          child.scale.set(newScale);
          // @ts-ignore
          child.x = refObj.width / 2 - (child.layers.terrain.width / 2) * newScale;
          // @ts-ignore
          child.y = refObj.height / 2 - (child.layers.terrain.height / 2) * newScale;
        }
      });
      requestAnimationFrame(raf);
    };
    raf();
    this.on("destroyed", () => {
      alive = false;
    });
  }
}

export class Engine {
  private app: PIXI.Application;
  private worldMapScreen: WorldMapScreen;
  private defenseInstanceScreen: DefenseInstanceScreen | null = null;

  constructor(private canvas: HTMLCanvasElement, private store: Store) {
    const pixelDensity = window.devicePixelRatio;
    const parentSize = canvas.parentElement!.getBoundingClientRect();

    this.app = new PIXI.Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parentSize.width,
      height: parentSize.height,
      resolution: pixelDensity,
    });
    canvas.style.width = `${parentSize.width}px`;
    canvas.style.height = `${parentSize.height}px`;
    if (!("events" in this.app.renderer)) {
      this.app.renderer.addSystem(PIXI.EventSystem, "events");
    }

    this.app.stage.scale.set(1 / pixelDensity);
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000);
    bg.drawRect(0, 0, canvas.offsetWidth * pixelDensity, canvas.offsetHeight * pixelDensity);
    bg.endFill();
    const container = new CenteringContainer(bg);
    this.app.stage.addChild(container);

    container.addChild(bg);

    this.worldMapScreen = new WorldMapScreen(store.worldMap, store);

    container.addChild(this.worldMapScreen);
    autorun(() => {
      if (store.defenseInstance) {
        if (this.defenseInstanceScreen) {
          container.removeChild(this.defenseInstanceScreen);
        }
        this.defenseInstanceScreen = new DefenseInstanceScreen(store.defenseInstance, store);
        container.addChild(this.defenseInstanceScreen);
      } else {
        if (this.defenseInstanceScreen) {
          container.removeChild(this.defenseInstanceScreen);
          this.defenseInstanceScreen = null;
        }
      }
    });

    canvas.addEventListener("resize", this.onResize.bind(this));
    this.onResize();
  }

  private onResize() {
    // this.app.renderer.resize(this.canvas.offsetWidth, this.canvas.offsetHeight);
  }

  public start() {
    this.app.start();
  }
}
