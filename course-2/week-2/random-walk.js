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

const ALPHA = 0.1
const GAMMA = 1

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
      const done = s2 === STATE_TERMINAL_LEFT || s2 === STATE_TERMINAL_RIGHT
      return { s2, r, done }

    case STATE_TERMINAL_LEFT:
    case STATE_TERMINAL_RIGHT:
      throw new Error(`Unexpected terminal state ${s}`)

    default:
      throw new Error(`Unknown state ${s}`)
  }
}

const TD0 = (pi, maxEpisodes) => {
  const V = new Map(S_PLUS.map(s => [s, s === STATE_TERMINAL_LEFT || s === STATE_TERMINAL_RIGHT ? 0 : 0.5]))
  for (const _ of U.rangeIter(maxEpisodes)) {
    let s = S0
    for (; ;) {
      const a = pi(s)
      const { s2, r, done } = takeAction(s, a)
      const v = V.get(s) + ALPHA * (r + GAMMA * V.get(s2) - V.get(s))
      V.set(s, v)
      s = s2
      if (done) break
    }
  }
  return V
}

const makeLine = (V, name, color) => ({
  x: ['A', 'B', 'C', 'D', 'E'],
  y: S.map(s => V.get(s)),
  mode: 'lines+markers',
  line: { color },
  name
})

const main = () => {
  const pi = _s => U.randomChoice(A)
  const V0 = TD0(pi, 0)
  const V1 = TD0(pi, 1)
  const V10 = TD0(pi, 10)
  const V100 = TD0(pi, 100)
  const real = new Map(U.range(5).map(n => n + 1).map(s => [s, s / 6]))
  const line0 = makeLine(V0, '0', 'grey')
  const line1 = makeLine(V1, '1', 'red')
  const line10 = makeLine(V10, '10', 'green')
  const line100 = makeLine(V100, '100', 'blue')
  const lineReal = makeLine(real, 'true values', 'black')
  const layout = {
    width: 800,
    height: 600
  }
  const data = [line0, line1, line10, line100, lineReal]
  plot(data, layout)
  console.dir(U.toSignificantDigits(V100))
}

main()
