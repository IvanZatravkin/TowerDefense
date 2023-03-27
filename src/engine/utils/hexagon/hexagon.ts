import { Point } from "pixi.js";

export class DimensionlessHexagon {
  constructor(public x: number, public y: number, public z = -x - y) {
    if (x + y + z !== 0) {
      throw new Error("Cube coordinates must add to 0");
    }
  }
}

/**
 * Hexagonal grid cell.
 * Accepts a cube coordinate and a radius.
 * Represent a pointy-topped hexagon.
 */
export class Hexagon extends DimensionlessHexagon {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public radius: number
  ) {
    super(x, y, z);
  }

  get width(): number {
    return this.radius;
  }

  get height(): number {
    return this.radius;
  }

  /**
   * Returns the center of the hexagon in pixels relative to 0,0,0 hexagon.
   */
  get center() {
    const x = this.width * (this.x + this.z / 2);
    const y = this.height * this.z * 0.75;
    return new Point(x, y);
  }

  /**
   * Returns points of the hexagon in the world space.
   */
  get coords(): Point[] {
    const center = this.center;
    return this.points.map((point) => {
      return new Point(point.x + center.x, point.y + center.y);
    });
  }

  /**
   * Returns points of the hexagon in the object space.
   */
  get points(): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i - 30;
      const angleRad = (Math.PI / 180) * angleDeg;
      points.push(
        new Point(
          ((this.radius / 2) * Math.cos(angleRad)) / 0.86,
          (this.radius / 2) * Math.sin(angleRad)
        )
      );
    }
    return points;
  }

  public static fromDimensionless(
    dimensionless: DimensionlessHexagon,
    radius: number
  ) {
    return new Hexagon(
      dimensionless.x,
      dimensionless.y,
      dimensionless.z,
      radius
    );
  }
}
