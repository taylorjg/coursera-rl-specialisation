const GW = require('./gridworld-utils')
const configureGPI = require('./generalised-policy-iteration')

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
const S_PLUS = [...S, GW.TERMINAL_STATE]

const GAMMA = 1
const THETA = .1

const GPI = configureGPI(S, GW.A, GAMMA, THETA)

const main = () => {
  const V = new Map(S_PLUS.map(s => [s, 0]))
  GPI.valueIteration(V, GW.normalDynamics)
  const pi = GPI.makeGreedyPolicy(V, GW.normalDynamics)
  GW.printResults(S)(V, pi)
}

main()
