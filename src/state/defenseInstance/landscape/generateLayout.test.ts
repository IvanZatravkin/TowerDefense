import { Hexagon, CircularGrid, RectangularGrid } from "engine/utils/hexagon";
import { generateLayout, validateConnected } from "./generateLayout";

describe("generateLayout", () => {
  it("should generate layout for RectangularGrid", () => {
    const map = new RectangularGrid(
      10,
      10,
      (...coords) => new Hexagon(...coords, 1)
    );
    const config = {
      basePos: [map.get(0, 0, 0)!],
      spawnPoints: [map.get(9, -9, 0)!],
    };
    const passableTiles = generateLayout(map, config);
    expect(
      validateConnected(passableTiles, config.spawnPoints[0], config.basePos[0])
    ).toBe(true);
  });

  it("should generate layout for RectangularGrid 2", () => {
    const map = new RectangularGrid(
      10,
      10,
      (...coords) => new Hexagon(...coords, 1)
    );
    const config = {
      basePos: [map.get(0, 0, 0)!],
      spawnPoints: [map.get(0, -2, 2)!],
    };
    const passableTiles = generateLayout(map, config);
    expect(
      validateConnected(passableTiles, config.spawnPoints[0], config.basePos[0])
    ).toBe(true);
  });

  it("should generate layout for CircularGrid", () => {
    const map = new CircularGrid(5, (...coords) => new Hexagon(...coords, 25));
    const config = {
      basePos: [map.get(0, 0, 0)!],
      spawnPoints: [map.get(4, -4, 0)!],
    };
    const passableTiles = generateLayout(map, config);
    expect(
      validateConnected(passableTiles, config.spawnPoints[0], config.basePos[0])
    ).toBe(true);
  });

  it("should generate layout for RectangularGrid with multiple bases", () => {
    const map = new RectangularGrid(
      10,
      10,
      (...coords) => new Hexagon(...coords, 1)
    );
    const config = {
      basePos: [map.get(0, 0, 0)!, map.get(0, -5, 5)!],
      spawnPoints: [map.get(9, -9, 0)!],
    };
    const passableTiles = generateLayout(map, config);
    expect(
      validateConnected(passableTiles, config.spawnPoints[0], config.basePos[0])
    ).toBe(true);
    expect(
      validateConnected(passableTiles, config.spawnPoints[0], config.basePos[1])
    ).toBe(true);
  });
});
