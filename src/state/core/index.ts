/**
 * Core state
 * Contains all the state that is not specific to any screen
 * Like researches, upgrades, etc
 */

import { action, makeObservable, observable } from "mobx";

export class Core {
  @observable
  public researchState: ResearchState = new ResearchState();

  constructor() {
    makeObservable(this, undefined, { deep: false, proxy: false });
  }

  @action
  public addResearch(research: Research) {
    this.researches.push(research);
  }
}

/**
 * Research
 */
class Research {
  @observable
  public name: string;

  constructor(name: string) {
    this.name = name;
    makeObservable(this, undefined, { deep: false, proxy: false });
  }
}
