import { action, autorun, makeObservable, observable } from "mobx";

/**
 * Slowly changes value from current to newly set
 */
export class AnimatedValue {
  @observable
  private _value: number;
  @observable
  private _targetValue: number;
  private updatedAt = Date.now();

  constructor(value: number, private readonly speed: number) {
    this._value = value;
    this._targetValue = value;
    makeObservable(this, undefined, { proxy: false });
  }

  set value(newValue: number) {
    this._targetValue = newValue;
    this.updatedAt = Date.now();
    this.startLoop();
  }

  get value(): number {
    return this._value;
  }

  private startLoop() {
    this.loop();
  }

  @action
  private loop() {
    const now = Date.now();
    const dt = now - this.updatedAt;
    const dv = this.speed * dt;
    if (Math.abs(this._value - this._targetValue) < dv) {
      this._value = this._targetValue;
    } else {
      this._value += dv * Math.sign(this._targetValue - this._value);
    }
    this.updatedAt = now;
    if (this._value !== this._targetValue) {
      requestAnimationFrame(() => this.loop());
    }
  }
}

export const animateProperty = <
  Target extends Record<string, number>,
  Property extends keyof Target
>(
  target: Target,
  property: Property,
  getValue: () => number,
  speed: number
) => {
  const animatedValue = new AnimatedValue(target[property] as number, speed);
  const unsub = [] as (() => void)[];
  unsub.push(
    autorun(() => {
      animatedValue.value = getValue();
    })
  );
  unsub.push(
    autorun(() => {
      // @ts-ignore
      target[property] = animatedValue.value;
    })
  );
  return () => unsub.forEach((u) => u());
};
