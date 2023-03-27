globalThis.requestAnimationFrame = function (callback) {
  setTimeout(callback, 0);
};
globalThis.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
