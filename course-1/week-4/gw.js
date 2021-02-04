const U = require('../../utils')

const UP = 0
const DOWN = 1
const RIGHT = 2
const LEFT = 3
const A = [UP, DOWN, RIGHT, LEFT]

const BLUE_STATES = [1, 2, 3, 8, 9, 10]
const TERMINAL_STATE = 99

const REGULAR_TERMINAL_STATE_COORDS = [[0, 0], [3, 3]]
const ENHANCED_TERMINAL_STATE_COORDS = [[0, 0]]

const newCoordsAfterTakingAction = (x, y, a) => {
  switch (a) {
    case UP: return [x, y - 1]
    case DOWN: return [x, y + 1]
    case RIGHT: return [x + 1, y]
    case LEFT: return [x - 1, y]
    default: throw new Error(`[newCoordsAfterTakingAction] Unknown action "${a}"`)
  }
}

const coordsAreOffGrid = (x, y) => (x < 0 || y < 0 || x > 3 || y > 3)
const coordsAreTerminal = (tscs, x, y) => tscs.some(([tscx, tscy]) => x == tscx && y === tscy)
const stateToCoords = s => [s % 4, Math.floor(s / 4)]
const coordsToState = (x, y) => y * 4 + x

const regularDynamics = (s, a) => {
  const [x1, y1] = stateToCoords(s)
  const [x2, y2] = newCoordsAfterTakingAction(x1, y1, a)
  const s2 = coordsAreOffGrid(x2, y2)
    ? s
    : coordsAreTerminal(REGULAR_TERMINAL_STATE_COORDS, x2, y2)
      ? TERMINAL_STATE
      : coordsToState(x2, y2)
  return [{ p: 1, s2, r: -1 }]
}

const enhancedDynamics = (s, a) => {
  const [x1, y1] = stateToCoords(s)
  const [x2, y2] = newCoordsAfterTakingAction(x1, y1, a)
  const s2 = coordsAreOffGrid(x2, y2)
    ? s
    : coordsAreTerminal(ENHANCED_TERMINAL_STATE_COORDS, x2, y2)
      ? TERMINAL_STATE
      : coordsToState(x2, y2)
  const r = BLUE_STATES.includes(s2) ? -10 : -1
  return [{ p: 1, s2, r }]
}

const printMapInGrid = S => (map, formatValue = v => v) => {
  const w = 5
  for (const y of U.rangeIter(4)) {
    let line = ''
    for (const x of U.rangeIter(4)) {
      const tmp = y * 4 + x
      const s = S.includes(tmp) ? tmp : TERMINAL_STATE
      const value = map.has(s) ? `${formatValue(map.get(s))}` : ''
      line += value.padStart(w)
    }
    console.log(line)
  }
}

const printResults = S => (V, pi) => {

  console.log(`Optimal policy:`)
  printMapInGrid(S)(pi, a => {
    switch (a) {
      case UP: return '\u2191'
      case DOWN: return '\u2193'
      case RIGHT: return '\u2192'
      case LEFT: return '\u2190'
      default: throw new Error(`[printGrid#formatValue] Unknown action "${a}"`)
    }
  })

  console.log()

  console.log(`Optimal state value function:`)
  printMapInGrid(S)(V)
}

module.exports = {
  A,
  TERMINAL_STATE,
  regularDynamics,
  enhancedDynamics,
  printResults
}
