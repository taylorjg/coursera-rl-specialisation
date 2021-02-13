const { plot } = require('nodeplotlib')
const { count } = require('yargs')
const U = require('../../utils')

const STATE_TERMINAL_LEFT = 0
const STATE_A = 1
const STATE_B = 2
const STATE_C = 3
const STATE_D = 4
const STATE_E = 5
const STATE_TERMINAL_RIGHT = 6

const S = [STATE_A, STATE_B, STATE_C, STATE_D, STATE_E]
const S_PLUS = [STATE_TERMINAL_LEFT, ...S, STATE_TERMINAL_RIGHT]
const S0 = STATE_C

const LEFT = 0
const RIGHT = 1
const A = [LEFT, RIGHT]

const GAMMA = 1

const isTerminalState = s =>
  s === STATE_TERMINAL_LEFT || s === STATE_TERMINAL_RIGHT

const move = (s, a) => {
  switch (a) {
    case LEFT: return s - 1
    case RIGHT: return s + 1
    default: throw new Error(`Unknown action ${a}`)
  }
}

const takeAction = (s, a) => {
  switch (s) {
    case STATE_A:
    case STATE_B:
    case STATE_C:
    case STATE_D:
    case STATE_E:
      const s2 = move(s, a)
      const r = s2 === STATE_TERMINAL_RIGHT ? 1 : 0
      const done = isTerminalState(s2)
      return { s2, r, done }

    case STATE_TERMINAL_LEFT:
    case STATE_TERMINAL_RIGHT:
      throw new Error(`Unexpected terminal state ${s}`)

    default:
      throw new Error(`Unknown state ${s}`)
  }
}

// -------------------- TD0 --------------------

const TD0 = (pi, alpha, episodes, cb) => {
  const V = new Map(S_PLUS.map(s => [s, isTerminalState(s) ? 0 : 0.5]))
  for (const _ of U.rangeIter(episodes)) {
    let s = S0
    for (; ;) {
      const a = pi(s)
      const { s2, r, done } = takeAction(s, a)
      const v = V.get(s) + alpha * (r + GAMMA * V.get(s2) - V.get(s))
      V.set(s, v)
      s = s2
      if (done) {
        cb(V)
        break
      }
    }
  }
}

// -------------------- MC --------------------

const generateEpisode = pi => {
  const episode = []
  let s = S0
  for (; ;) {
    const a = pi(s)
    const { s2, r, done } = takeAction(s, a)
    episode.push({ s, a, r })
    if (done) break
    s = s2
  }
  return episode
}

const MC = (pi, alpha, episodes, cb) => {
  const V = new Map(S_PLUS.map(s => [s, isTerminalState(s) ? 0 : 0.5]))
  for (const _ of U.rangeIter(episodes)) {
    const episode = generateEpisode(pi)
    let G = 0
    const ts = U.range(episode.length)
    for (const t of ts.reverse()) {
      const { s, r } = episode[t]
      G = GAMMA * G + r
      const v = V.get(s) + alpha * (G - V.get(s))
      V.set(s, v)
    }
    cb(V)
  }
}

// -------------------- runs over given prediction method --------------------

const rms = (V1, V2) => {
  const v1 = S.map(s => {
    const v1 = V1.get(s)
    const v2 = V2.get(s)
    return Math.pow(v1 - v2, 2)
  })
  const v2 = U.average(v1)
  const v3 = Math.sqrt(v2)
  return v3
}

const doRun = (predictionMethod, alpha, episodes) => {
  const pi = _s => U.randomChoice(A)
  const values = []
  const trueValues = new Map(S.map(s => [s, s / 6]))
  predictionMethod(pi, alpha, episodes, V => { values.push(rms(V, trueValues)) })
  return values
}

const doRuns = (predictionMethod, alpha, runs) => {
  const EPISODES = 100
  const runningAverages = Array(EPISODES).fill(0)
  const counts = Array(EPISODES).fill(0)
  for (const run of U.rangeIter(runs)) {
    const values = doRun(predictionMethod, alpha, EPISODES)
    values.forEach((value, index) => {
      const currentAverage = runningAverages[index]
      const oldCount = counts[index]
      const newCount = oldCount + 1
      runningAverages[index] = currentAverage + (1 / newCount) * (value - currentAverage)
      counts[index] = newCount
    })
  }
  return runningAverages
}

// -------------------- plot helpers --------------------

const makeLine = (values, name, color, additionalLineAttributes) => ({
  x: values.map((_, index) => index + 1),
  y: values,
  mode: 'lines',
  line: { color, ...additionalLineAttributes },
  name
})

const makeAnnotation = (x, line) => ({
  x,
  y: line.y[x],
  text: line.name,
  showarrow: false
})

// -------------------- main --------------------

const main = () => {

  const RUNS = 100

  const td0Values1 = doRuns(TD0, 0.1, RUNS)
  const td0Values2 = doRuns(TD0, 0.15, RUNS)
  const td0Values3 = doRuns(TD0, 0.05, RUNS)
  const line1 = makeLine(td0Values1, 'α=0.1', 'cyan')
  const line2 = makeLine(td0Values2, 'α=0.15', 'cyan')
  const line3 = makeLine(td0Values3, 'α=0.05', 'cyan')

  const mcValues1 = doRuns(MC, 0.01, RUNS)
  const mcValues2 = doRuns(MC, 0.02, RUNS)
  const mcValues3 = doRuns(MC, 0.03, RUNS)
  const mcValues4 = doRuns(MC, 0.04, RUNS)
  const line4 = makeLine(mcValues1, 'α=0.01', 'red', { width: 0.5 })
  const line5 = makeLine(mcValues2, 'α=0.02', 'red', { dash: 'dash' })
  const line6 = makeLine(mcValues3, 'α=0.03', 'red', { dash: 'dot' })
  const line7 = makeLine(mcValues4, 'α=0.04', 'red')

  const data = [line1, line2, line3, line4, line5, line6, line7]
  const layout = {
    width: 800,
    height: 600,
    showlegend: false,
    annotations: [
      makeAnnotation(70, line1),
      makeAnnotation(75, line2),
      makeAnnotation(80, line3),
      makeAnnotation(20, line4),
      makeAnnotation(40, line5),
      makeAnnotation(60, line6),
      makeAnnotation(80, line7)
    ]
  }
  plot(data, layout)
}

main()
