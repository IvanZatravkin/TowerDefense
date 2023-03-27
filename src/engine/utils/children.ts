import { DisplayObject } from "pixi.js";

export const findLeftmostChild = (children: DisplayObject[]) =>
  children.reduce(
    (leftmost, child) => (child.x < leftmost.x ? child : leftmost),
    children[0]
  );

export const findTopmostChild = (children: DisplayObject[]) =>
  children.reduce(
    (topmost, child) => (child.y < topmost.y ? child : topmost),
    children[0]
  );
