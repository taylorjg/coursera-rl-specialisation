const GW = require('./gw')
const configureGPI = require('./gpi')

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
const S_PLUS = [...S, GW.TERMINAL_STATE]

const GAMMA = 1
const THETA = 2 + 1e-12

const GPI = configureGPI(S, GW.A, GAMMA, THETA)

const main = () => {
  const V = new Map(S_PLUS.map(s => [s, 0]))
  const pi = new Map(S.map(s => [s, 0]))
  for (; ;) {
    if (GPI.improvePolicy(V, pi, GW.enhancedDynamics)) break
    GPI.evaluatePolicy(V, pi, GW.enhancedDynamics)
  }
  GW.printResults(S)(V, pi)
}

main()
