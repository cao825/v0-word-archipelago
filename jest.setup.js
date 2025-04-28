// Mock the canvas API
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  closePath: jest.fn(),
  clip: jest.fn(),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  setLineDash: jest.fn(),
  restore: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// Mock Audio
global.Audio = class {
  constructor() {
    this.play = jest.fn().mockResolvedValue()
    this.pause = jest.fn()
    this.addEventListener = jest.fn()
    this.removeEventListener = jest.fn()
  }
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})
