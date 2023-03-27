// add support for png imports from typescript

declare module "*.png" {
  const value: any;
  export = value;
}

declare module "*.webp" {
  const value: any;
  export = value;
}

type Pos = {
  x: number;
  y: number;
};

type Effect = {
  type: string;
  takeDamage?: (damage: number) => number;
};

interface Window {
  TILE_SIZE: number;
}

declare const TILE_SIZE: number;

type CubePos = Pos & {
  z: number;
};

type Props<T extends React.ComponentType<any> | React.ElementType> = T extends React.ComponentType<infer P>
  ? P
  : unknown;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type StyleArgs<K extends { [n: number]: any }> = UnionToIntersection<
  { [N in keyof K]: K[N] extends (x: infer P) => any ? P : never }[number]
>;

type FixStyled<Base extends React.ComponentType<any> | React.ElementType, Styles extends any[]> = React.ComponentType<
  Omit<Props<Base> & StyleArgs<Styles>, "theme">
>;

type StyledFixed = <C extends React.ComponentType<any> | React.ElementType>(
  Component: C
) => <CSS extends any[]>(...css: CSS) => FixStyled<C, CSS>;

declare module "@emotion/styled" {
  const styled: StyledFixed;
  export default styled;
}

declare module "*.frag" {
  const value: string;
  export = value;
}

declare module "*.vert" {
  const value: string;
  export = value;
}

interface ObjectConstructor {
  keys<T extends object>(o: T): (keyof T)[];
}

type Unpack<T> = T extends ReadonlyArray<infer U> ? U : T;
