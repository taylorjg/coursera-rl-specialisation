const yargs = require('yargs')

const configureGW = require('./gw')
const configureGPI = require('./gpi')

const GAMMA = 1

const policyIteration = enhanced => {
  console.log(`policy iteration (${enhanced ? 'enhanced' : 'regular'} gridworld)`)
  const GW = configureGW(enhanced)
  const THETA = 2 + 1e-12
  const GPI = configureGPI(GW.S, GW.A, GAMMA, THETA)
  const V = new Map(GW.S_PLUS.map(s => [s, 0]))
  const pi = new Map(GW.S.map(s => [s, 0]))
  for (; ;) {
    if (GPI.improvePolicy(V, pi, GW.transitions)) break
    GPI.evaluatePolicy(V, pi, GW.transitions)
  }
  GW.printResults(V, pi)
}

const valueIteration = enhanced => {
  console.log(`value iteration (${enhanced ? 'enhanced' : 'regular'} gridworld)`)
  const GW = configureGW(enhanced)
  const THETA = 0.1
  const GPI = configureGPI(GW.S, GW.A, GAMMA, THETA)
  const V = new Map(GW.S_PLUS.map(s => [s, 0]))
  GPI.valueIteration(V, GW.transitions)
  const pi = GPI.makeGreedyPolicy(V, GW.transitions)
  GW.printResults(V, pi)
}

const main = () => {
  const argv = yargs
    .option('e', {
      alias: 'enhanced',
      nargs: 0,
      describe: 'Use enhanced gridworld (versus regular gridworld)'
    })
    .option('v', {
      alias: 'valueIteration',
      nargs: 0,
      describe: 'Use value iteration (versus policy iteration)'
    })
    .wrap(null)
    .argv

  argv.valueIteration
    ? valueIteration(argv.enhanced)
    : policyIteration(argv.enhanced)
}

main()
