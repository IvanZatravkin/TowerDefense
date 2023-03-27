import { Store } from "./index";

global.requestAnimationFrame = ((callback: any) => {
  setTimeout(callback, 0);
}) as any;

class MockTile {
  controlledBy = 0;
  setOwner(owner: number) {
    this.controlledBy = owner;
  }
}

describe("Store", () => {
  it("start instance", () => {
    const store = new Store();
    store.startInstance();
    expect(store.activeScreen).toBe("defenseInstance");
    expect(store.defenseInstance).not.toBeNull();
  });

  // no winning anymore
  test.skip("end instance, player wins", () => {
    const store = new Store();
    const parentTile = new MockTile() as any;
    store.startInstance();
    store.defenseInstance!.forceWin();
    store.endInstance();
    expect(store.activeScreen).toBe("worldMap");
    expect(store.defenseInstance).toBeNull();
    expect(parentTile.controlledBy).toBe(1);
  });

  it("end instance, player loses", () => {
    const store = new Store();
    const parentTile = new MockTile() as any;
    store.startInstance();
    store.defenseInstance!.forceLose();
    store.endInstance();
    expect(store.activeScreen).toBe("worldMap");
    expect(store.defenseInstance).toBeNull();
    expect(parentTile.controlledBy).toEqual(0);
  });
});
