/**
 * This file contains layout generator for TowerDefense instance.
 */
import {
  DimensionlessHexagon,
  HexagonalGrid,
  distance,
} from "engine/utils/hexagon";
import { integer, MersenneTwister19937 } from "random-js";

export const validateConnected = (hexes: Pos[], start: Pos, dest: Pos) => {
  const visited = new Set<Pos>();
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === dest) {
      return true;
    }
    visited.add(current);
    const neighbors = hexes.filter((h) => distance(current, h) === 1);
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    });
  }
  return false;
};

/**
 * Improved version of generateLayout.
 * Generates more varied layout.
 * Guarantees that there will be at least one path from each spawn point to each base.
 * @param map
 * @param config
 * @param seed
 * @param percentOfPassableTiles
 * @returns - array of tiles that are passable
 */
export const generateLayout = <T extends DimensionlessHexagon>(
  map: HexagonalGrid<T>,
  config: { basePos: T[]; spawnPoints: T[] },
  seed = 10,
  percentOfPassableTiles = 0.5
): T[] => {
  const allTiles = [...map.hexagons.values()];
  const passableTiles = new Set<T>(allTiles);
  const rng = MersenneTwister19937.seed(seed);
  const random = (min: number, max: number) => {
    return integer(min, max)(rng);
  };
  const numberOfPassableTiles = Math.floor(
    allTiles.length * percentOfPassableTiles
  );

  let pathExists = true;
  const maxIterations = 1000;
  let iterations = 0;
  while (
    passableTiles.size > numberOfPassableTiles &&
    pathExists &&
    iterations++ < maxIterations
  ) {
    const tile = allTiles[random(0, allTiles.length - 1)];
    passableTiles.delete(tile);
    pathExists = config.spawnPoints.every((spawnPoint) => {
      return config.basePos.every((basePos) => {
        return validateConnected([...passableTiles], spawnPoint, basePos);
      });
    });
    if (!pathExists) {
      passableTiles.add(tile);
      pathExists = true;
    }
  }
  config.spawnPoints.forEach((spawnPoint) => {
    passableTiles.add(spawnPoint);
  });
  config.basePos.forEach((basePos) => {
    passableTiles.add(basePos);
  });
  return [...passableTiles];
};
