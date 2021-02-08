const configureGW = require('../../course-1/week-4/gw')
const MCU = require('./mc-utils')
const U = require('../../utils')

const GAMMA = 1

const generateEpisode = (pi, makeMove, s0) => {
  const episode = []
  let s = s0
  for (; ;) {
    const a = pi(s)
    const { s2, r, done } = makeMove(s, a)
    episode.push({ s, a, r })
    if (done) break
    s = s2
  }
  return episode
}

const main = () => {
  const GW = configureGW(false)
  const pi = MCU.makeEquiprobablePolicy(GW.S, GW.A)
  const s0 = U.randomChoice(GW.S)
  const episode = generateEpisode(pi, GW.makeMove, s0)
  console.dir(episode)
  // To be continued...
}

main()
