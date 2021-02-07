const yargs = require('yargs')

const configureGW = require('../../course-1/week-4/gw')
const MCU = require('./mc-utils')
const U = require('../../utils')

const GAMMA = 1

const generateEpisode = (pi, makeMove, s0, a0) => {
  const MAX_EPISODE_LENGTH = 25 // in case we get stuck
  const episode = []
  const { s2, r, done } = makeMove(s0, a0)
  episode.push({ s: s0, a: a0, r })
  if (done) return episode
  let s = s2
  for (; ;) {
    const a = pi.get(s)
    const { s2, r, done } = makeMove(s, a)
    episode.push({ s, a, r })
    if (done || episode.length >= MAX_EPISODE_LENGTH) break
    s = s2
  }
  return episode
}

const main = () => {
  const argv = yargs
    .option('e', {
      alias: 'enhanced',
      nargs: 0,
      describe: 'Use enhanced gridworld (versus regular gridworld)'
    })
    .wrap(null)
    .argv

  const GW = configureGW(argv.enhanced)
  const pi = new Map(GW.S.map(s => [s, 0]))
  const returns = MCU.initialiseStateActionMap(GW.S, GW.A, () => [])
  const Q = MCU.initialiseStateActionMap(GW.S, GW.A, () => 0)
  const MAX_EPISODES = argv.enhanced ? 50000 : 10000
  for (const _ of U.rangeIter(MAX_EPISODES)) {
    const s0 = U.randomChoice(GW.S)
    const a0 = U.randomChoice(GW.A)
    const episode = generateEpisode(pi, GW.makeMove, s0, a0)
    let G = 0
    const ts = U.range(episode.length)
    for (const t of ts.reverse()) {
      const { s: St, a: At, r } = episode[t]
      G = GAMMA * G + r
      const isFirstVisit = MCU.checkFirstVisit(episode, t)
      if (isFirstVisit) {
        const key = MCU.makeStateActionKey(St, At)
        const list = returns.get(key)
        list.push(G)
        const newAverage = U.average(list)
        Q.set(key, newAverage)
        const values = GW.A.map(a => Q.get(MCU.makeStateActionKey(St, a)))
        const index = U.argmax(values)
        pi.set(St, GW.A[index])
      }
    }
  }

  const V = new Map(GW.S_PLUS.map(s => {
    if (pi.has(s)) {
      const a = pi.get(s)
      return [s, Q.get(MCU.makeStateActionKey(s, a))]
    } else {
      return [s, 0]
    }
  }))
  
  GW.printResults(V, pi)
}

main()
