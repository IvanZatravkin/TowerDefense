import { Texture } from "pixi.js";

export const frameWidth = 400;
export const frameHeight = 400;
/** -1,0 - bottom left; 0,1 - top left; -1,1 - left **/
type Directions = "-1,0" | "0,1" | "-1,1";
type FrameDescription = {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};
type AnimationDescription = {
  name: string;
  "-1,1": number;
  "-1,0": number;
  "0,1": number;
};
const getFrameName = (direction: Directions, animation: string, frame: number) => `${direction}-${animation}-${frame}`;
const framesForAnimation = (
  animation: AnimationDescription,
  startY: number,
  directions: readonly Directions[],
  frameWidth: number = 400,
  frameHeight: number = 400
): { [s: string]: FrameDescription } => {
  return directions.reduce((acc, direction) => {
    const frames = animation[direction as keyof AnimationDescription];
    for (let i = 0; i < frames; i++) {
      acc[getFrameName(direction, animation.name, i)] = {
        frame: {
          x: i * frameWidth,
          y: directions.indexOf(direction) * frameHeight + startY,
          w: frameWidth,
          h: frameHeight,
        },
      };
    }
    return acc;
  }, {} as { [s: string]: FrameDescription });
};
export const makeAtlas = <T extends AnimationDescription>(
  texture: Texture,
  frameWidth: number,
  frameHeight: number,
  description: readonly T[],
  directions: readonly Directions[]
) => {
  const frames = description.reduce((acc, animation, currentIndex) => {
    const startY = currentIndex * frameHeight * 3;
    const frames = framesForAnimation(animation, startY, directions, frameWidth, frameHeight);
    return {
      ...acc,
      ...frames,
    };
  }, {} as { [s: string]: any });
  const animations = description.reduce((acc, animation) => {
    for (const direction of directions) {
      const frames = animation[direction];
      acc[`${direction}-${animation.name as T["name"]}`] = Array.from({ length: frames }, (_, i) =>
        getFrameName(direction, animation.name, i)
      );
    }
    return acc;
  }, {} as { [k in `${Directions}-${T["name"]}`]: string[] });

  return {
    frames,
    animations,
    meta: {
      format: "RGBA8888",
      size: {
        w: frameWidth * 11,
        h: frameHeight * description.length * 3,
      },
      scale: "1",
    },
  };
};
