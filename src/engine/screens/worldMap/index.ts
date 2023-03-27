import * as PIXI from "pixi.js";
import { autorun } from "mobx";
import { MapTile, WorldMap } from "state/worldMap";
import Rocks1 from "resources/sprites/rocks1-squared.png";
import StoneTiles1 from "resources/sprites/stone_tiles1-squared.png";
import type { Store } from "state";
import { animateProperty } from "engine/utils/animatedValue";
import { HexagonSprite } from "engine/containers/hexagonSprite";
import { withSubscriptionsMixin } from "utils/withSubscriptions";
import { cube2RowCol, Hexagon } from "engine/utils/hexagon";
import { Layer } from "engine/utils/layer";
import { findLeftmostChild, findTopmostChild } from "../../utils/children";

const tiles = [StoneTiles1, Rocks1];

const SPRITE_SIZE = 512;

class MapHexagon extends HexagonSprite {
  constructor(public mapTile: MapTile, texture: PIXI.Texture) {
    const hexagon = Hexagon.fromDimensionless(mapTile, SPRITE_SIZE / 2);
    super(hexagon, texture);
    const { col, row } = cube2RowCol(hexagon.x, hexagon.y, hexagon.z);
    this.zIndex = row * 1000 + col + (texture === textures[1] ? 1 : 0) * 10000;
  }
}

class OverlaySprite extends PIXI.Container {
  private hexagonOverlay: PIXI.Graphics;
  constructor(public mapTile: MapTile) {
    super();
    this.interactive = true;
    this.on("mouseover", () => {
      mapTile.setMouseOver(true);
    });
    this.on("mouseout", () => {
      mapTile.setMouseOver(false);
    });
    this.on("click", () => {
      mapTile.click();
    });
    this.on("tap", () => {
      mapTile.click();
    });
    this.alpha = 1;

    const hexagonOverlay = new PIXI.Graphics();
    const hexagon = Hexagon.fromDimensionless(mapTile, SPRITE_SIZE / 2);
    hexagonOverlay.beginFill(0xffffff, 0.9);
    hexagonOverlay.drawPolygon(...hexagon.coords);
    hexagonOverlay.endFill();
    hexagonOverlay.alpha = 0.3;
    this.addChild(hexagonOverlay);
    this.hexagonOverlay = hexagonOverlay;

    autorun(() => {
      this.draw();
    });
  }

  draw() {
    this.hexagonOverlay.tint = this.mapTile.color;
  }
}

class TerrainLayer extends Layer<MapTile> {
  getSprite(entity: MapTile): PIXI.Container {
    const texture = pickRandomArrayElement(textures);
    return new MapHexagon(entity, texture);
  }
}

class OverlayLayer extends Layer<MapTile> {
  getSprite(entity: MapTile): PIXI.Container {
    return new OverlaySprite(entity);
  }
}

const textures = tiles.map((tile) => PIXI.Texture.from(tile));

const pickRandomArrayElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export class WorldMapScreen extends withSubscriptionsMixin(PIXI.Container) {
  sortableChildren = true;
  private layers: { overlay: OverlayLayer; terrain: TerrainLayer };
  constructor(worldMap: WorldMap, store: Store) {
    super();
    this.layers = {
      overlay: new OverlayLayer(),
      terrain: new TerrainLayer(),
    };
    const container = new PIXI.Container();
    this.addChild(container);
    container.addChild(this.layers.terrain);
    container.addChild(this.layers.overlay);

    this.addSubscription(
      autorun(() => {
        this.layers.terrain.draw([...worldMap.grid.hexagons.values()]);
        this.layers.overlay.draw([...worldMap.grid.hexagons.values()]);
      })
    );

    setTimeout(() => {
      // find leftmost child and use its coordinate to move container to align it with the left edge of the screen
      const leftmostChild = findLeftmostChild(this.layers.terrain.children);
      container.x = -leftmostChild.x + TILE_SIZE / 2;

      // find topmost child and use its coordinate to move container to align it with the top edge of the screen
      const topmostChild = findTopmostChild(this.layers.terrain.children);

      container.y = -topmostChild.y + TILE_SIZE / 2;
    }, 0);

    this.addSubscription(
      animateProperty(
        this,
        "alpha",
        () => +(store.activeScreen === "worldMap"),
        0.01
      )
    );
  }

  get interactiveChildren() {
    return this.alpha === 1;
  }
}
