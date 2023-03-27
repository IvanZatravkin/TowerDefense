import { CircularGrid } from "./grid";
import { Hexagon } from "./hexagon";
import { distance } from "./utils";

describe("HexagonalGrid", () => {
  it("should return a hexagon at the given coordinates", () => {
    const grid = new CircularGrid(2);
    const hexagon = grid.get(1, -1, 0);
    expect(hexagon).toBeDefined();
    expect(hexagon?.x).toEqual(1);
    expect(hexagon?.y).toEqual(-1);
    expect(hexagon?.z).toEqual(0);
  });

  it("should return undefined if no hexagon exists at the given coordinates", () => {
    const grid = new CircularGrid(2);
    const hexagon = grid.get(3, -1, 0);
    expect(hexagon).toBeUndefined();
  });

  it("should return correct center coordinates for each neighbour of central hexagon", () => {
    const grid = new CircularGrid(1, (...coords) => new Hexagon(...coords, 10));
    const hexagon = grid.get(0, 0, 0)!;
    const neighbours = grid.getNeighbors(hexagon);
    expect(neighbours.length).toEqual(6);
    expect(hexagon.center.x).toBeCloseTo(0);
    expect(hexagon.center.y).toBeCloseTo(0);

    neighbours.forEach((neighbour) => {
      expect(distance(hexagon, neighbour)).toBeCloseTo(1);
    });
  });
});
