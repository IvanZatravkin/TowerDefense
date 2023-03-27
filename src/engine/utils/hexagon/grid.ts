import { computed, makeObservable } from "mobx";
import { DimensionlessHexagon, Hexagon } from "./hexagon";
import { distance } from "./utils";
/**
 * This file contains methods and classes to work with cube-based hexagonal grids.
 */

/**
 * Map example:
 / \   / \
 /x=0\ /x=1\
 |y=0| |y=0|
 \z=0/ \z=-1/
 \/ / \\/ / \
 /x=0\ /x=1\
 |y=-1||y=-1|
 \z=1/ \z=0/
 \/    \/
 **/

const defaultFactory = (x: number, y: number, z: number) => new DimensionlessHexagon(x, y, z);

export class HexagonalGrid<H extends CubePos & { passable?: boolean } = Hexagon> {
  private static neighborCoordinates = [
    [1, -1, 0],
    [1, 0, -1],
    [0, 1, -1],
    [-1, 1, 0],
    [-1, 0, 1],
    [0, -1, 1],
  ];
  public hexagons: Map<string, H> = new Map();
  @computed
  get hexagonsArray() {
    return [...this.hexagons.values()];
  }

  constructor() {
    makeObservable(this, undefined, { proxy: false, deep: false });
  }

  public getMapKey(x: number, y: number, z: number = -(x + y)): string {
    return `${x},${y}`;
  }

  /**
   * Returns a hexagon at the given coordinates.
   */
  get(x: number, y: number, z: number = -(x + y)): H | undefined {
    return this.hexagons.get(this.getMapKey(Math.trunc(x), Math.trunc(y)));
  }

  /**
   * Returns an array of hexagons that are neighbors of the given hexagon.
   */
  getNeighbors(hexagon: { x: number; y: number; z: number }): H[] {
    const neighbors: H[] = [];
    for (const [dx, dy, dz] of HexagonalGrid.neighborCoordinates) {
      const neighbor = this.get(hexagon.x + dx, hexagon.y + dy, hexagon.z + dz);
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }

  /**
   * Finds path between two hexagons.
   */
  findPath = (start: H, end: H) => cachedFindPath(start, end, this);
}

export class CircularGrid<H extends DimensionlessHexagon = DimensionlessHexagon> extends HexagonalGrid<H> {
  /**
   * Creates a circular hexagonal grid with the given radius centered at 0,0,0.
   * @param mapRadius - radius of the grid
   * @param hexagonFactory - factory function that creates hexagons
   */
  constructor(
    public mapRadius: number,
    // @ts-ignore
    protected hexagonFactory: (x: number, y: number, z: number) => H = defaultFactory
  ) {
    super();
    // populate the map with hexagons
    for (let x = -mapRadius; x <= mapRadius; x++) {
      const y1 = Math.max(-mapRadius, -x - mapRadius);
      const y2 = Math.min(mapRadius, -x + mapRadius);
      for (let y = y1; y <= y2; y++) {
        const z = -x - y;
        const hexagon = this.hexagonFactory(x, y, z);
        this.hexagons.set(this.getMapKey(x, y, z), hexagon);
      }
    }
  }
}

export class RectangularGrid<H extends DimensionlessHexagon = DimensionlessHexagon> extends HexagonalGrid<H> {
  /**
   * Creates a rectangular hexagonal grid with the given radius centered at 0,0,0.
   * @param mapWidth - width of the grid
   * @param mapHeight - height of the grid
   * @param hexagonFactory - factory function that creates hexagons
   */
  constructor(
    public mapWidth: number,
    public mapHeight: number,
    // @ts-ignore
    public hexagonFactory: (x: number, y: number, z: number) => H = defaultFactory
  ) {
    super();
    // populate the map with hexagons
    for (let col = 0; col < mapWidth; col++) {
      // fill each column of width with mapHeight hexagons
      for (let row = 0; row < mapHeight; row++) {
        // convert row/col to cube coordinates
        const x = col - (row - (row & 1)) / 2;
        const z = row;
        const y = -x - z;
        const hexagon = this.hexagonFactory(x, y, z);
        this.hexagons.set(this.getMapKey(x, y, z), hexagon);
      }
    }
  }
}

/**
 * Finds path between two hexagons.
 */
const findPath = <H extends CubePos & { passable?: boolean }>(start: H, end: H, grid: HexagonalGrid<H>): H[] => {
  const openSet: H[] = [];
  const closedSet: H[] = [...grid.hexagons.values()].filter((h) => h.passable === false);
  const cameFrom: Map<string, H> = new Map();
  const gScore: Map<string, number> = new Map();
  const fScore: Map<string, number> = new Map();

  openSet.push(start);
  gScore.set(grid.getMapKey(start.x, start.y, start.z), 0);
  fScore.set(grid.getMapKey(start.x, start.y, start.z), distance(start, end));

  while (openSet.length > 0) {
    let current = openSet[0];
    for (const hexagon of openSet) {
      if (
        fScore.get(grid.getMapKey(hexagon.x, hexagon.y, hexagon.z))! <
        fScore.get(grid.getMapKey(current.x, current.y, current.z))!
      ) {
        current = hexagon;
      }
    }

    if (current === end) {
      return reconstructPath(cameFrom, end, grid);
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.push(current);
    for (const neighbor of grid.getNeighbors(current)) {
      if (closedSet.includes(neighbor)) {
        continue;
      }
      const tentativeGScore =
        gScore.get(grid.getMapKey(current.x, current.y, current.z))! + distance(current, neighbor);
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= gScore.get(grid.getMapKey(neighbor.x, neighbor.y, neighbor.z))!) {
        continue;
      }
      cameFrom.set(grid.getMapKey(neighbor.x, neighbor.y, neighbor.z), current);
      gScore.set(grid.getMapKey(neighbor.x, neighbor.y, neighbor.z), tentativeGScore);
      fScore.set(
        grid.getMapKey(neighbor.x, neighbor.y, neighbor.z),
        gScore.get(grid.getMapKey(neighbor.x, neighbor.y, neighbor.z))! + distance(neighbor, end)
      );
    }
  }

  return [];
};

const pathCache: WeakMap<HexagonalGrid<any>, Map<CubePos, Map<CubePos, CubePos[]>>> = new WeakMap();

const cachedFindPath: typeof findPath = <H extends CubePos & { passable?: boolean }>(
  start: H,
  end: H,
  grid: HexagonalGrid<H>
) => {
  if (!pathCache.has(grid)) {
    pathCache.set(grid, new Map());
  }
  const cache = pathCache.get(grid)!;
  if (!cache.has(start)) {
    cache.set(start, new Map());
  }
  const startCache = cache.get(start)!;
  if (!startCache.has(end)) {
    startCache.set(end, findPath(start, end, grid));
  }
  return startCache.get(end)! as H[];
};

const reconstructPath = <H extends CubePos>(cameFrom: Map<string, H>, current: H, grid: HexagonalGrid<H>): H[] => {
  const totalPath: H[] = [current];
  while (cameFrom.has(grid.getMapKey(current.x, current.y, current.z))) {
    current = cameFrom.get(grid.getMapKey(current.x, current.y, current.z))!;
    totalPath.push(current);
  }
  return totalPath;
};
