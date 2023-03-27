import { action, computed, makeObservable, observable } from "mobx";
import { Hexagon } from "engine/utils/hexagon";

const TILE_SIZE = 1; // state is responsible for logic only, scale can be set in presentation layer
const identity = <T>(x: T) => x;

export class Base extends Hexagon implements Pos {
  initialHP: number;
  @observable
  currentHP: number;
  pos: Pos;
  private activeEffects: Set<Effect> = new Set();

  constructor(initialHp: number, pos: Pos) {
    super(pos.x, pos.y, -(pos.x + pos.y), TILE_SIZE);
    this.initialHP = initialHp;
    this.currentHP = initialHp;
    this.pos = pos;
    makeObservable(this, undefined, { deep: false, proxy: false });
  }

  @computed
  public get isDestroyed(): boolean {
    return this.currentHP <= 0;
  }

  @action
  public takeDamage(damage: number) {
    damage = [...this.activeEffects].reduce((damage, effect) => (effect.takeDamage || identity)(damage), damage);
    this.currentHP -= damage;
    this.currentHP = Math.max(0, this.currentHP);
  }

  @action
  public addEffect(effect: Effect) {
    this.activeEffects.add(effect);
  }

  @action
  public removeEffect(effect: Effect) {
    this.activeEffects.delete(effect);
  }

  @action
  destroy() {
    this.currentHP = 0;
  }

  @action
  heal(amount: number) {
    this.currentHP += amount;
    this.currentHP = Math.min(this.currentHP, this.initialHP);
  }
}
