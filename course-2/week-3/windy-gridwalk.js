const { plot } = require('nodeplotlib')
const U = require('../../utils')

const WIDTH = 10
const HEIGHT = 7
const MAX_X = WIDTH - 1
const MAX_Y = HEIGHT - 1

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
const MAX_EPISODES = 500

const lookupQ = (Q, s, a) => Q.get(s).get(a)
const updateQ = (Q, s, a, v) => Q.get(s).set(a, v)

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
  const x3 = U.clip(0, MAX_X, x2)
  const windStrength = WIND_STRENGTH[x3]
  const y3 = U.clip(0, MAX_Y, y2 - windStrength)
  const s2 = encodeCoords([x3, y3])
  return { s2, r: -1 }
}

const makeEpsilonGreedyPolicy = Q => s => {
  if (Math.random() < EPSILON) {
    return U.randomChoice(A)
  } else {
    const values = Array.from(Q.get(s).values())
    const index = U.argmax(values)
    return A[index]
  }
}

const makeGreedyPolicy = Q => s => {
  const values = Array.from(Q.get(s).values())
  const index = U.argmax(values)
  return A[index]
}

const sarsa = () => {
  const Q = new Map(S.map(s => [s, new Map(A.map(a => [a, 0]))]))
  const values = []
  const pi = makeEpsilonGreedyPolicy(Q)
  let timeSteps = 0
  let episodes = 0
  for (const _ of U.rangeIter(MAX_EPISODES)) {
    let s = START
    let a = pi(s)
    for (; ;) {
      const { s2, r } = takeAction(s, a)
      const a2 = pi(s2)
      const oldQ = lookupQ(Q, s, a)
      const newQ = oldQ + ALPHA * (r + GAMMA * lookupQ(Q, s2, a2) - oldQ)
      updateQ(Q, s, a, newQ)
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
  return { Q, values }
}

const drawTrajectory = trajectory => {
  for (const y of U.rangeIter(HEIGHT)) {
    const chars = []
    for (const x of U.rangeIter(WIDTH)) {
      const s = encodeCoords([x, y])
      const char = trajectory.includes(s) ? '*' : '.'
      chars.push(char)
    }
    console.log(chars.join(' '))
  }
}

const exampleGreedyTrajectory = Q => {
  const pi = makeGreedyPolicy(Q)
  const trajectory = []
  let s = START
  trajectory.push(s)
  for (; ;) {
    let a = pi(s)
    const { s2 } = takeAction(s, a)
    s = s2
    trajectory.push(s)
    if (s === GOAL) break
  }
  return trajectory
}

const makeLine = (values, color) => ({
  x: values.map(({ timeSteps }) => timeSteps),
  y: values.map(({ episodes }) => episodes),
  mode: 'lines',
  line: { color }
})

const main = () => {
  const { Q, values } = sarsa()
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
  const trajectory = exampleGreedyTrajectory(Q)
  drawTrajectory(trajectory)
}

main()
