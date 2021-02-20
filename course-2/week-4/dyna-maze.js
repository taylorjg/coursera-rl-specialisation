const { plot } = require('nodeplotlib')
const U = require('../../utils')
const assert = require('assert')

const WIDTH = 9
const HEIGHT = 6
const MAX_X = WIDTH - 1
const MAX_Y = HEIGHT - 1

const encodeCoords = ([x, y]) => `${x}:${y}`
const decodeCoords = s => s.split(':').map(Number)

const MAZE = [
  '.......XG',
  '..X....X.',
  'S.X....X.',
  '..X......',
  '.....X...',
  '.........'
]

const findStateContainingChar = ch => {
  for (const x of U.rangeIter(WIDTH)) {
    for (const y of U.rangeIter(HEIGHT)) {
      if (MAZE[y][x] === ch) {
        return encodeCoords([x, y])
      }
    }
  }
  throw new Error(`Failed to find char "${ch}" in the maze`)
}

const findStatesContainingChar = ch => {
  const states = []
  for (const x of U.rangeIter(WIDTH)) {
    for (const y of U.rangeIter(HEIGHT)) {
      if (MAZE[y][x] === ch) {
        states.push(encodeCoords([x, y]))
      }
    }
  }
  if (states.length === 0) {
    throw new Error(`Failed to find char "${ch}" in the maze`)
  }
  return states
}

const START = findStateContainingChar('S')
const GOAL = findStateContainingChar('G')
const S = findStatesContainingChar('.').concat(START).concat(GOAL)
const OBSTACLES = findStatesContainingChar('X')
assert.strictEqual(S.length + OBSTACLES.length, WIDTH * HEIGHT)

const UP = 0
const DOWN = 1
const LEFT = 2
const RIGHT = 3
const A = [UP, DOWN, LEFT, RIGHT]

const ALPHA = 0.1
const EPSILON = 0.1
const GAMMA = 0.95
const MAX_EPISODES = 50
const MAX_RUNS = 30

const lookupQ = (Q, s, a) => Q.get(s).get(a)
const updateQ = (Q, s, a, v) => Q.get(s).set(a, v)

const updateM = (M, s, a, s2, r) => {
  if (M.has(s)) {
    M.get(s).set(a, { s2, r })
  } else {
    M.set(s, new Map([[a, { s2, r }]]))
  }
}
const randomM = M => {
  const sKvps = Array.from(M.entries())
  const [s, map] = U.randomChoice(sKvps)
  const aKvps = Array.from(map.entries())
  const [a, { s2, r }] = U.randomChoice(aKvps)
  return { s, a, s2, r }
}

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
  const s2Provisional = encodeCoords([x3, y3])
  const s2 = OBSTACLES.includes(s2Provisional) ? s : s2Provisional
  const r = s2 === GOAL ? 1 : 0
  return { s2, r }
}

const epsilonGreedy = (s, Q) => {
  if (Math.random() < EPSILON) {
    return U.randomChoice(A)
  } else {
    const values = Array.from(Q.get(s).values())
    const index = U.argmax(values)
    return A[index]
  }
}

const dynaQ = n => {
  const returnValues = []
  const Q = new Map(S.map(s => [s, new Map(A.map(a => [a, 0]))]))
  const M = new Map()

  let episodes = 0
  let iterations = 0
  let s = START
  for (; ;) {
    const a = epsilonGreedy(s, Q)
    const { s2, r } = takeAction(s, a)

    const oldQ = lookupQ(Q, s, a)
    const values = A.map(a => lookupQ(Q, s2, a))
    const maxValue = Math.max(...values)
    const newQ = oldQ + ALPHA * (r + GAMMA * maxValue - oldQ)
    updateQ(Q, s, a, newQ)
    updateM(M, s, a, s2, r)

    for (const _ of U.rangeIter(n)) {
      const { s, a, s2, r } = randomM(M)
      const oldQ = lookupQ(Q, s, a)
      const values = A.map(a => lookupQ(Q, s2, a))
      const maxValue = Math.max(...values)
      const newQ = oldQ + ALPHA * (r + GAMMA * maxValue - oldQ)
      updateQ(Q, s, a, newQ)
    }

    s = s2
    iterations += 1
    if (s === GOAL) {
      s = START
      episodes += 1
      returnValues.push(iterations)
      iterations = 0
      if (episodes >= MAX_EPISODES) {
        return returnValues
      }
    }
  }
}

const dynaQRuns = n => {
  const allRunsValues = []
  for (const _ of U.rangeIter(MAX_RUNS)) {
    const singleRunValues = dynaQ(n)
    allRunsValues.push(singleRunValues)
  }
  return U.range(MAX_EPISODES).map(episodeIndex => U.average(allRunsValues.map(values => values[episodeIndex])))
}

// const makeGreedyPolicy = Q => s => {
//   const values = Array.from(Q.get(s).values())
//   const index = U.argmax(values)
//   return A[index]
// }

// const showPath = pi => {
//   const path = []
//   let s = START
//   path.push(s)
//   for (; ;) {
//     const a = pi(s)
//     const { s2 } = takeAction(s, a)
//     s = s2
//     path.push(s)
//     if (s === GOAL) break
//   }
//   console.dir(path)
// }

// const showGreedyActions = pi => {
//   for (const y of U.rangeIter(HEIGHT)) {
//     const chars = []
//     for (const x of U.rangeIter(WIDTH)) {
//       const s = encodeCoords([x, y])
//       if (OBSTACLES.includes(s)) {
//         chars.push('\u2588')
//         continue
//       }
//       if (s === GOAL) {
//         chars.push('G')
//         continue
//       }
//       const a = pi(s)
//       if (s === START) {
//         switch (a) {
//           case UP: chars.push('\u21E7'); break
//           case DOWN: chars.push('\u21E9'); break
//           case LEFT: chars.push('\u21E6'); break
//           case RIGHT: chars.push('\u21E8'); break
//           default: throw new Error(`Unknown action ${a}`)
//         }
//         continue
//       }
//       switch (a) {
//         case UP: chars.push('\u2191'); break
//         case DOWN: chars.push('\u2193'); break
//         case LEFT: chars.push('\u2190'); break
//         case RIGHT: chars.push('\u2192'); break
//         default: throw new Error(`Unknown action ${a}`)
//       }
//     }
//     console.log(chars.join(' '))
//   }
// }

const makeLine = (values, name, color) => ({
  x: values.map((_, index) => index + 2),
  y: values,
  mode: 'lines',
  line: { color },
  name
})

const makeAnnotation = (x, y, ax, ay, line) => ({
  xanchor: 'left',
  x,
  y,
  ax,
  ay,
  text: line.name,
  showarrow: true,
  arrowcolor: line.line.color,
  font: {
    color: line.line.color
  }
})

const main = () => {
  const values1 = dynaQRuns(0)
  const values2 = dynaQRuns(5)
  const values3 = dynaQRuns(50)

  const line1 = makeLine(values1.slice(1), '0 planning steps<br />(direct RL only)', 'steelblue')
  const line2 = makeLine(values2.slice(1), '5 planning steps', 'forestgreen')
  const line3 = makeLine(values3.slice(1), '50 planning steps', 'crimson')
  const data = [line1, line2, line3]
  const layout = {
    width: 800,
    height: 600,
    showlegend: false,
    xaxis: {
      title: 'Episodes',
      range: [2, MAX_EPISODES]
    },
    yaxis: {
      title: 'Steps per episode'
    },
    annotations: [
      makeAnnotation(5, line1.y[3], 100, -100, line1),
      makeAnnotation(3, line2.y[1], 200, -100, line2),
      makeAnnotation(3, line3.y[1], 300, -100, line3)
    ]
  }
  plot(data, layout)
}

main()
