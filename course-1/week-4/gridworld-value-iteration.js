const GW = require('./gridworld-utils')
const configureGPI = require('./generalised-policy-iteration')

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
const TERMINAL_STATE = 99
const S_PLUS = [...S, TERMINAL_STATE]

const UP = 0
const DOWN = 1
const RIGHT = 2
const LEFT = 3
const A = [UP, DOWN, RIGHT, LEFT]

const GAMMA = 1
const THETA = .1

const GPI = configureGPI(S, A, GAMMA, THETA)

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
const coordsAreTerminal = (x, y) => (x === 0 && y === 0) || (x === 3 && y === 3)
const stateToCoords = s => [s % 4, Math.floor(s / 4)]
const coordsToState = (x, y) => y * 4 + x

const dynamics = (s, a) => {
  if (s === TERMINAL_STATE) {
    return [{ p: 1, s2: s, r: 0 }]
  }
  const [x1, y1] = stateToCoords(s)
  const [x2, y2] = newCoordsAfterTakingAction(x1, y1, a)
  if (coordsAreOffGrid(x2, y2)) {
    return [{ p: 1, s2: s, r: -1 }]
  }
  const s2 = coordsAreTerminal(x2, y2)
    ? TERMINAL_STATE
    : coordsToState(x2, y2)
  return [{ p: 1, s2, r: -1 }]
}

const main = () => {

  const V = new Map(S_PLUS.map(s => [s, 0]))
  GPI.valueIteration(V, dynamics)
  const pi = GPI.makeGreedyPolicy(V, dynamics)

  console.log(`Optimal policy:`)
  GW.printMapInGrid(S, TERMINAL_STATE)(pi, a => {
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
  GW.printMapInGrid(S, TERMINAL_STATE)(V)
}

main()
