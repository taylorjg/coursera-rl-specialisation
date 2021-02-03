const GW = require('./gridworld-utils')
const configureGPI = require('./generalised-policy-iteration')

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
const TERMINAL_STATE = 99
const S_PLUS = [...S, TERMINAL_STATE]

const TERMINAL_STATE_COORDS = [[0, 0], [3, 3]]

const GAMMA = 1
const THETA = 2 + 1e-12

const GPI = configureGPI(S, GW.A, GAMMA, THETA)

const dynamics = (s, a) => {
  if (s === TERMINAL_STATE) {
    return [{ p: 1, s2: s, r: 0 }]
  }
  const [x1, y1] = GW.stateToCoords(s)
  const [x2, y2] = GW.newCoordsAfterTakingAction(x1, y1, a)
  if (GW.coordsAreOffGrid(x2, y2)) {
    return [{ p: 1, s2: s, r: -1 }]
  }
  const s2 = GW.coordsAreTerminal(TERMINAL_STATE_COORDS, x2, y2)
    ? TERMINAL_STATE
    : GW.coordsToState(x2, y2)
  return [{ p: 1, s2, r: -1 }]
}

const main = () => {
  const V = new Map(S_PLUS.map(s => [s, 0]))
  const pi = new Map(S.map(s => [s, 0]))
  for (; ;) {
    if (GPI.improvePolicy(V, pi, dynamics)) break
    GPI.evaluatePolicy(V, pi, dynamics)
  }
  GW.printResults(S, TERMINAL_STATE)(V, pi)
}

main()
