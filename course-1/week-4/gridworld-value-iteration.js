const U = require('../../utils')
const GW = require('./gridworld-utils')

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
const TERMINAL_STATE = 99
const S_PLUS = [...S, TERMINAL_STATE]

const UP = 0
const DOWN = 1
const RIGHT = 2
const LEFT = 3
const A = [UP, DOWN, RIGHT, LEFT]

let V = new Map(S_PLUS.map(s => [s, 0]))

const GAMMA = 1
const THETA = .1

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

const nextStateAndReward = (s, a) => {
  if (s === TERMINAL_STATE) {
    return { p: 1, s2: s, r: 0 }
  }
  const [x1, y1] = stateToCoords(s)
  const [x2, y2] = newCoordsAfterTakingAction(x1, y1, a)
  if (coordsAreOffGrid(x2, y2)) {
    return { p: 1, s2: s, r: -1 }
  }
  const s2 = coordsAreTerminal(x2, y2)
    ? TERMINAL_STATE
    : coordsToState(x2, y2)
  return { p: 1, s2, r: -1 }
}

const valueIteration = () => {
  for (; ;) {
    let delta = 0
    for (const s of S) {
      const oldValue = V.get(s)
      const values = A.map(a => {
        const { p, s2, r } = nextStateAndReward(s, a)
        const value = p * (r + GAMMA * V.get(s2))
        return value
      })
      const newValue = Math.max(...values)
      V.set(s, newValue)
      delta = Math.max(delta, Math.abs(oldValue - newValue))
    }
    if (delta < THETA) break
  }
}

const main = () => {

  valueIteration()

  const pi = new Map(S.map(s => {
    const values = A.map(a => {
      const { p, s2, r } = nextStateAndReward(s, a)
      const value = p * (r + GAMMA * V.get(s2))
      return value
    })
    const index = U.argmax(values)
    const a = A[index]
    return [s, a]
  }))

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
