const U = require('../../utils')

const UP = 0
const DOWN = 1
const RIGHT = 2
const LEFT = 3
const A = [UP, DOWN, RIGHT, LEFT]

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
const coordsAreTerminal = (TERMINAL_STATE_COORDS, x, y) =>
  TERMINAL_STATE_COORDS.some(([tscx, tscy]) => x == tscx && y === tscy)
const stateToCoords = s => [s % 4, Math.floor(s / 4)]
const coordsToState = (x, y) => y * 4 + x

const printMapInGrid = (S, TERMINAL_STATE) => (map, formatValue = v => v) => {
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

const printResults = (S, TERMINAL_STATE) => (V, pi) => {

  console.log(`Optimal policy:`)
  printMapInGrid(S, TERMINAL_STATE)(pi, a => {
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
  printMapInGrid(S, TERMINAL_STATE)(V)
}

module.exports = {
  UP, DOWN, LEFT, RIGHT,
  A,
  newCoordsAfterTakingAction,
  coordsAreOffGrid,
  coordsAreTerminal,
  stateToCoords,
  coordsToState,
  printResults
}
