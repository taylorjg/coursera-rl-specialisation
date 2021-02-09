const yargs = require('yargs')

const configureGW = require('../../course-1/week-4/gw')
const MCU = require('./mc-utils')
const U = require('../../utils')

const GAMMA = 1
const EPSILON = 0.01

const generateEpisode = (pi, makeMove, s0) => {
  const MAX_EPISODE_LENGTH = 10 // in case we get stuck
  const episode = []
  let s = s0
  for (; ;) {
    const a = pi(s)
    const { s2, r, done } = makeMove(s, a)
    episode.push({ s, a, r })
    if (done || episode.length >= MAX_EPISODE_LENGTH) break
    s = s2
  }
  return episode
}

const makePolicyOverPolicyMap = policyMap => s => {
  const probDist = policyMap.get(s)
  return MCU.probDistChoice(probDist)
}

const main = () => {
  const argv = yargs
    .option('e', {
      alias: 'enhanced',
      nargs: 0,
      describe: 'Use enhanced gridworld (versus regular gridworld)',
      type: 'boolean',
      default: false
    })
    .wrap(null)
    .argv

  const GW = configureGW(argv.enhanced)
  const policyMap = MCU.makeEquiprobablePolicyMap(GW.S, GW.A)
  const pi = makePolicyOverPolicyMap(policyMap)
  const returns = MCU.initialiseStateActionMap(GW.S, GW.A, () => [0, 0])
  const Q = MCU.initialiseStateActionMap(GW.S, GW.A, () => 0)
  const MAX_EPISODES = 1_000_000
  for (const _ of U.rangeIter(MAX_EPISODES)) {
    const s0 = U.randomChoice(GW.S)
    const episode = generateEpisode(pi, GW.makeMove, s0)
    let G = 0
    const ts = U.range(episode.length)
    for (const t of ts.reverse()) {
      const { s: St, a: At, r } = episode[t]
      G = GAMMA * G + r
      const isFirstVisit = MCU.checkFirstVisit(episode, t)
      if (isFirstVisit) {
        const key = MCU.makeStateActionKey(St, At)
        const arr = returns.get(key)
        const [currentAverageReturn, currentCount] = arr
        const newCount = currentCount + 1
        const newAverageReturn = currentAverageReturn + (1 / newCount) * (G - currentAverageReturn)
        arr[0] = newAverageReturn
        arr[1] = newCount
        Q.set(key, newAverageReturn)
        const values = GW.A.map(a => Q.get(MCU.makeStateActionKey(St, a)))
        const index = U.argmax(values)
        const bestAction = GW.A[index]
        const epsilonOverNumActions = EPSILON / GW.A.length
        const newProbDist = new Map(GW.A.map(a => {
          const p = a === bestAction
            ? 1 - EPSILON + epsilonOverNumActions
            : epsilonOverNumActions
          return [a, p]
        }))
        policyMap.set(St, newProbDist)
      }
    }
  }

  const kvps = Array.from(policyMap.entries()).map(([s, probDist]) => {
    const index = U.argmax(Array.from(probDist.values()))
    const a = GW.A[index]
    return [s, a]
  })
  const greedyPolicy = new Map(kvps)

  const V = new Map(GW.S_PLUS.map(s => {
    if (greedyPolicy.has(s)) {
      const a = greedyPolicy.get(s)
      return [s, Q.get(MCU.makeStateActionKey(s, a))]
    } else {
      return [s, 0]
    }
  }))

  GW.printResults(V, greedyPolicy)
}

main()
