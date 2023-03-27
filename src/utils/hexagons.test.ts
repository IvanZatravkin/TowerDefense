import { localToCube } from "./hexagons";

describe("localToCube", () => {
  it("returns the center of the hexagon", () => {
    const result = localToCube({ x: 0, y: 0 }, 512);
    expect(result).toEqual({ x: 0, y: -0, z: 0 });
  });
  it("returns 0.5 for the coordinate that is on the left border", () => {
    const result = localToCube({ x: -256, y: 0 }, 512);
    expect(result).toEqual({ x: -0.5, y: 0.5, z: 0 });
  });

  it("returns 0.5 for the coordinate that is on the right border", () => {
    const result = localToCube({ x: 256, y: 0 }, 512);
    expect(result).toEqual({ x: 0.5, y: -0.5, z: 0 });
  });
});
