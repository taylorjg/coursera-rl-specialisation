const { plot } = require('nodeplotlib')
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

const generateEpisode = pi => {
  const episode = []
  let s = S0
  for (; ;) {
    const a = pi(s)
    const { s2, r, done } = takeAction(s, a)
    episode.push({ s, s2, r })
    if (done) break
    s = s2
  }
  return episode
}

const batchTD0 = (V, alpha, incrementsMap) => episode => {
  episode.forEach(({ s, s2, r }) => {
    const increment = alpha * (r + GAMMA * V.get(s2) - V.get(s))
    incrementsMap.set(s, incrementsMap.get(s) + increment)
  })
}

const batchMC = (V, alpha, incrementsMap) => episode => {
  let G = 0
  const ts = U.range(episode.length)
  for (const t of ts.reverse()) {
    const { s, r } = episode[t]
    G = GAMMA * G + r
    const increment = alpha * (G - V.get(s))
    incrementsMap.set(s, incrementsMap.get(s) + increment)
  }
}

const processBatch = (predictionMethod, V, alpha, episodes) => {

  const incrementsMap = new Map(S_PLUS.map(s => [s, 0]))
  episodes.forEach(predictionMethod(V, alpha, incrementsMap))

  for (const [s, increment] of incrementsMap) {
    if (!isTerminalState(s)) {
      V.set(s, V.get(s) + increment)
    }
  }

  return Math.max(...incrementsMap.values())
}

const processBatchManyTimes = (predictionMethod, V, alpha, episodes) => {
  for (; ;) {
    const maxIncrement = processBatch(predictionMethod, V, alpha, episodes)
    if (maxIncrement < 1e-4) break
  }
}

const doEpisodes = (predictionMethod, pi, alpha, maxEpisodes, cb) => {
  const V = new Map(S_PLUS.map(s => [s, isTerminalState(s) ? 0 : 0.5]))
  const episodes = []
  for (const _ of U.rangeIter(maxEpisodes)) {
    const episode = generateEpisode(pi)
    episodes.push(episode)
    processBatchManyTimes(predictionMethod, V, alpha, episodes)
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

const doRun = (predictionMethod, alpha, maxEpisodes) => {
  const pi = _s => U.randomChoice(A)
  const values = []
  const trueValues = new Map(S.map(s => [s, s / 6]))
  doEpisodes(predictionMethod, pi, alpha, maxEpisodes, V => { values.push(rms(V, trueValues)) })
  return values
}

const doRuns = (predictionMethod, alpha, maxRuns) => {
  const MAX_EPISODES = 100
  const runningAverages = Array(MAX_EPISODES).fill(0)
  const counts = Array(MAX_EPISODES).fill(0)
  for (const _ of U.rangeIter(maxRuns)) {
    const values = doRun(predictionMethod, alpha, MAX_EPISODES)
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
  showarrow: true,
  arrowcolor: line.line.color,
  font: {
    color: line.line.color
  }
})

// -------------------- main --------------------

const main = () => {

  const ALPHA = 1e-4
  const MAX_RUNS = 100

  const values1 = doRuns(batchTD0, ALPHA, MAX_RUNS)
  const values2 = doRuns(batchMC, ALPHA, MAX_RUNS)
  const line1 = makeLine(values1, 'TD', 'steelblue')
  const line2 = makeLine(values2, 'MC', 'crimson')
  const data = [line1, line2]
  const layout = {
    width: 800,
    height: 600,
    showlegend: false,
    xaxis: {
      title: 'Walks / Episodes'
    },
    yaxis: {
      title: 'RMS error, averaged over states',
      range: [0, 0.3]
    },
    annotations: [
      makeAnnotation(20, line1),
      makeAnnotation(40, line2)
    ]
  }
  plot(data, layout)
}

main()
