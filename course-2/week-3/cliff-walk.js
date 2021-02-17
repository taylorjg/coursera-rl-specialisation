const { plot } = require('nodeplotlib')
const U = require('../../utils')

const WIDTH = 12
const HEIGHT = 4
const MAX_X = WIDTH - 1
const MAX_Y = HEIGHT - 1

const encodeCoords = ([x, y]) => `${x}:${y}`
const decodeCoords = s => s.split(':').map(Number)

const S = U.range(HEIGHT).flatMap(y => U.range(WIDTH).map(x => encodeCoords([x, y])))
const START = encodeCoords([0, MAX_Y])
const GOAL = encodeCoords([MAX_X, MAX_Y])
const CLIFF = U.range(WIDTH)
  .map(x => encodeCoords([x, MAX_Y]))
  .filter(s => s !== START && s !== GOAL)

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
  const [x3, y3] = [U.clip(0, MAX_X, x2), U.clip(0, MAX_Y, y2)]
  const s2 = encodeCoords([x3, y3])
  if (CLIFF.includes(s2)) {
    return { s2: START, r: -100 }
  }
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
  const totalRewards = []
  const pi = makeEpsilonGreedyPolicy(Q)
  for (const _ of U.rangeIter(MAX_EPISODES)) {
    let s = START
    let totalReward = 0
    let a = pi(s)
    for (; ;) {
      const { s2, r } = takeAction(s, a)
      totalReward += r
      const a2 = pi(s2)
      const oldQ = lookupQ(Q, s, a)
      const newQ = oldQ + ALPHA * (r + GAMMA * lookupQ(Q, s2, a2) - oldQ)
      updateQ(Q, s, a, newQ)
      s = s2
      a = a2
      if (s === GOAL) {
        totalRewards.push(totalReward)
        break
      }
    }
  }
  return { Q, totalRewards }
}

const Qlearning = () => {
  const Q = new Map(S.map(s => [s, new Map(A.map(a => [a, 0]))]))
  const totalRewards = []
  const pi = makeEpsilonGreedyPolicy(Q)
  for (const _ of U.rangeIter(MAX_EPISODES)) {
    let s = START
    let totalReward = 0
    for (; ;) {
      let a = pi(s)
      const { s2, r } = takeAction(s, a)
      totalReward += r
      const oldQ = lookupQ(Q, s, a)
      const values = A.map(a => lookupQ(Q, s2, a))
      const maxValue = Math.max(...values)
      const newQ = oldQ + ALPHA * (r + GAMMA * maxValue - oldQ)
      updateQ(Q, s, a, newQ)
      s = s2
      if (s === GOAL) {
        totalRewards.push(totalReward)
        break
      }
    }
  }
  return { Q, totalRewards }
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

const makeLine = (values, name, color) => ({
  x: values.map(({ x }) => x),
  y: values.map(({ y }) => y),
  mode: 'lines',
  line: { color },
  name
})

const makeAnnotation = (x, y, line) => ({
  x,
  y,
  text: line.name,
  showarrow: false,
  arrowcolor: line.line.color,
  font: {
    color: line.line.color
  }
})

const smoothValues = values => {
  const WINDOW_SIZE = 50
  const numValues = values.length
  return U.range(numValues - WINDOW_SIZE).map(startIndex => {
    const endIndex = startIndex + WINDOW_SIZE
    const window = values.slice(startIndex, endIndex)
    const x = endIndex
    const y = U.average(window)
    return { x, y }
  })
}

const main = () => {
  const { Q: Q1, totalRewards: values1 } = sarsa()
  const { Q: Q2, totalRewards: values2 } = Qlearning()

  const line1 = makeLine(smoothValues(values1), 'Sarsa', 'steelblue')
  const line2 = makeLine(smoothValues(values2), 'Q-learning', 'crimson')
  const data = [line1, line2]
  const layout = {
    width: 800,
    height: 600,
    showlegend: false,
    xaxis: {
      title: 'Episodes',
      range: [0, 500]
    },
    yaxis: {
      title: 'Sum of rewards during episode'
    },
    annotations: [
      makeAnnotation(250, -10, line1),
      makeAnnotation(250, -80, line2)
    ]
  }

  plot(data, layout)
  const trajectory1 = exampleGreedyTrajectory(Q1)
  drawTrajectory(trajectory1)

  console.log()

  const trajectory2 = exampleGreedyTrajectory(Q2)
  drawTrajectory(trajectory2)
}

main()
