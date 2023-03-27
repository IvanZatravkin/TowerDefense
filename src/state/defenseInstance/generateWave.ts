import { bool, MersenneTwister19937, real } from "random-js";
import { Landscape } from "./landscape";
import { Enemy } from "./entities/enemy";
import { Weapon } from "./entities/weapon";
import { pickRandomArrayElement } from "../../utils/pickRandomArrayElement";

const makeMeleeEnemy = (params: {
  rndGenerator: MersenneTwister19937;
  wave: number;
  landscape: Landscape;
  onEnemyKilled: (e: Enemy) => void;
  spawnPoints: Pos[];
}): Enemy => {
  const minHP = 10 + params.wave * 3;
  const maxHP = 10 + params.wave * 5;
  const minSpeed = 0.5 + params.wave * 0.05;
  const maxSpeed = 0.5 + params.wave * 0.1;

  return new Enemy({
    type: "melee",
    initialHP: real(minHP, maxHP, true)(params.rndGenerator),
    speed: real(minSpeed, maxSpeed, true)(params.rndGenerator),
    landscape: params.landscape,
    onEnemyKilled: params.onEnemyKilled,
    weapon: (enemy) => new Weapon(enemy, 1, 4 + params.wave, 1),
    pos: pickRandomArrayElement(params.spawnPoints),
  });
};

const makeRangedEnemy = (params: {
  rndGenerator: MersenneTwister19937;
  wave: number;
  landscape: Landscape;
  onEnemyKilled: (e: Enemy) => void;
  spawnPoints: Pos[];
}): Enemy => {
  const hpRatio = 0.7;
  const minHP = 5 + params.wave * 1;
  const maxHP = 5 + params.wave * 2;
  const minSpeed = 0.5 + params.wave * 0.05;
  const maxSpeed = 0.5 + params.wave * 0.1;

  return new Enemy({
    type: "ranged",
    initialHP: real(minHP * hpRatio, maxHP * hpRatio, true)(params.rndGenerator),
    speed: real(minSpeed, maxSpeed, true)(params.rndGenerator),
    landscape: params.landscape,
    onEnemyKilled: params.onEnemyKilled,
    weapon: (enemy) => new Weapon(enemy, 3, 2 + params.wave * 0.5, 1),
    pos: pickRandomArrayElement(params.spawnPoints),
  });
};

export const generateWave = ({
  wave,
  rndGenerator,
  onEnemyKilled,
  landscape,
  spawnPoints,
}: {
  wave: number;
  rndGenerator: MersenneTwister19937;
  landscape: Landscape;
  onEnemyKilled: (e: Enemy) => void;
  spawnPoints: Pos[];
}): Enemy[] => {
  const count = 5 + Math.floor(wave * 1.5);
  const enemies: Enemy[] = [];
  for (let i = 0; i < count; i++) {
    const isRanged = bool()(rndGenerator);
    const enemyParams = {
      rndGenerator,
      wave,
      landscape,
      onEnemyKilled,
      spawnPoints,
    };
    const enemy = isRanged ? makeRangedEnemy(enemyParams) : makeMeleeEnemy(enemyParams);

    enemies.push(enemy);
  }
  return enemies;
};
