type Axial = {
  x: number;
  y: number;
};
type Cube = Axial & {
  z?: number;
};

export const distance = (
  { x: x1, y: y1, z: z1 = -(x1 + y1) }: Cube,
  { x: x2, y: y2, z: z2 = -(x2 + y2) }: Cube
) => {
  return (Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2)) / 2;
};

export const rowCol2Cube = (row: number, col: number) => {
  const x = col - (row - (row & 1)) / 2;
  const z = row;
  const y = -x - z;
  return { x, y, z };
};

export const cube2RowCol = (x: number, y: number, z: number = -x - y) => {
  const col = x + (z - (z & 1)) / 2;
  const row = z;
  return { row, col };
};
