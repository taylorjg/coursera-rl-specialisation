const GW = require('./gridworld-utils')
const configureGPI = require('./generalised-policy-iteration')

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
const TERMINAL_STATE = 99
const S_PLUS = [...S, TERMINAL_STATE]

const TERMINAL_STATE_COORDS = [[0, 0]]

const GAMMA = 1
const THETA = 0.1

const GPI = configureGPI(S, GW.A, GAMMA, THETA)

const dynamics = (s, a) => {
  if (s === TERMINAL_STATE) {
    return [{ p: 1, s2: s, r: 0 }]
  }
  const [x1, y1] = GW.stateToCoords(s)
  const [x2, y2] = GW.newCoordsAfterTakingAction(x1, y1, a)
  if (GW.coordsAreOffGrid(x2, y2)) {
    const r = [1, 2, 3, 8, 9, 10].includes(s) ? -10 : -1
    return [{ p: 1, s2: s, r: r }]
  }
  const s2 = GW.coordsAreTerminal(TERMINAL_STATE_COORDS, x2, y2)
    ? TERMINAL_STATE
    : GW.coordsToState(x2, y2)
  const r = [1, 2, 3, 8, 9, 10].includes(s2) ? -10 : -1
  return [{ p: 1, s2, r }]
}

const main = () => {
  const V = new Map(S_PLUS.map(s => [s, 0]))
  GPI.valueIteration(V, dynamics)
  const pi = GPI.makeGreedyPolicy(V, dynamics)
  GW.printResults(S, TERMINAL_STATE)(V, pi)
}

main()
