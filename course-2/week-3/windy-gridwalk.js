const { plot } = require('nodeplotlib')
const U = require('../../utils')

const WIDTH = 10
const HEIGHT = 7

const WIND_STRENGTH = [0, 0, 0, 1, 1, 1, 2, 2, 1, 0]

const encodeCoords = ([x, y]) => `${x}:${y}`
const decodeCoords = s => s.split(':').map(Number)

const S = U.range(HEIGHT).flatMap(y => U.range(WIDTH).map(x => encodeCoords([x, y])))
const START = encodeCoords([0, 3])
const GOAL = encodeCoords([7, 3])

const UP = 0
const DOWN = 1
const LEFT = 2
const RIGHT = 3
const A = [UP, DOWN, LEFT, RIGHT]

const ALPHA = 0.5
const GAMMA = 1
const EPSILON = 0.1
const REWARD = -1

const Q = new Map(S.map(s => [s, new Map(A.map(a => [a, 0]))]))

const lookupQ = (s, a) => Q.get(s).get(a)
const updateQ = (s, a, v) => Q.get(s).set(a, v)

const move = (x, y, a) => {
  switch (a) {
    case UP: return [x, y - 1]
    case DOWN: return [x, y + 1]
    case LEFT: return [x - 1, y]
    case RIGHT: return [x + 1, y]
    default: throw new Error(`Unknown action ${a}`)
  }
}

const takeAction = (s, a) => {
  const [x1, y1] = decodeCoords(s)
  const [x2, y2] = move(x1, y1, a)
  const x3 = U.clip(0, WIDTH - 1, x2)
  const windStrength = WIND_STRENGTH[x3]
  const y3 = U.clip(0, HEIGHT - 1, y2 - windStrength)
  const s2 = encodeCoords([x3, y3])
  const r = REWARD
  return { s2, r }
}

const makePolicy = Q => s => {
  if (Math.random() < EPSILON) {
    return U.randomChoice(A)
  } else {
    const values = Array.from(Q.get(s).values())
    const index = U.argmax(values)
    return A[index]
  }
}

const sarsa = pi => {
  const values = []
  let timeSteps = 0
  let episodes = 0
  const MAX_EPISODES = 200
  for (const _ of U.rangeIter(MAX_EPISODES)) {
    let s = START
    let a = pi(s)
    for (; ;) {
      const { s2, r } = takeAction(s, a)
      const a2 = pi(s2)
      const oldQ = lookupQ(s, a)
      const newQ = oldQ + ALPHA * (r + GAMMA * lookupQ(s2, a2) - oldQ)
      updateQ(s, a, newQ)
      s = s2
      a = a2
      timeSteps += 1
      if (s === GOAL) {
        episodes += 1
        values.push({ timeSteps, episodes })
        break
      }
    }
  }
  return values
}

const makeGreedyPolicy = Q => s => {
  const values = Array.from(Q.get(s).values())
  const index = U.argmax(values)
  return A[index]
}

const exampleGreedyTrajectory = Q => {
  const pi = makeGreedyPolicy(Q)
  let s = START
  for (; ;) {
    let a = pi(s)
    console.log(`taking action ${a} in state "${s}"`)
    const { s2 } = takeAction(s, a)
    s = s2
    if (s === GOAL) break
  }
}

const makeLine = (values, color) => ({
  x: values.map(({ timeSteps }) => timeSteps),
  y: values.map(({ episodes }) => episodes),
  mode: 'lines',
  line: { color }
})

const main = () => {
  const pi = makePolicy(Q)
  const values = sarsa(pi)
  const line = makeLine(values, 'crimson')
  const data = [line]
  const layout = {
    width: 800,
    height: 600,
    showlegend: false,
    xaxis: {
      title: 'Time steps'
    },
    yaxis: {
      title: 'Episodes'
    }
  }
  plot(data, layout)
  exampleGreedyTrajectory(Q)
}

main()
