const randomChoice = xs => xs[Math.floor(Math.random() * xs.length)]

const argmax = xs => {
  let topValue = Number.NEGATIVE_INFINITY
  let ties = []
  xs.forEach((value, index) => {
    if (value > topValue) {
      topValue = value
      ties = [index]
    } else {
      if (value === topValue) {
        ties.push(index)
      }
    }
  })
  return ties.length === 1 ? ties[0] : randomChoice(ties)
}

const toSignificantDigits = (m, significantDigits) =>
  new Map(Array.from(m.entries())
    .map(([s, v]) => [s, Number(v.toPrecision(significantDigits))]))

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // {1,2,...,14}
const A = [0, 1, 2, 3] // {up, down, right, left}
const TERMINAL_STATE = 99
const S_PLUS = [...S, TERMINAL_STATE]
const GAMMA = 1
const THETA = 0.01

let V = new Map(S_PLUS.map(s => [s, 0]))

const moveTo = (x, y, a) => {
  switch (a) {
    case 0: return [x, y - 1] // up
    case 1: return [x, y + 1] // down
    case 2: return [x + 1, y] // right
    case 3: return [x - 1, y] // left
  }
}

const gridCoordsAreOffGrid = (x, y) => (x < 0 || y < 0 || x > 3 || y > 3)
const gridCoordsAreTerminal = (x, y) => (x === 0 && y === 0) || (x === 3 && y === 3)
const stateToGridCoords = s => [s % 4, Math.floor(s / 4)]
const gridCoordsToState = (x, y) => y * 4 + x

// const initialPolicy = _s => 0 // randomChoice(A)
// const greedyPolicy = s => V.get(s)

const nextStateAndReward = (s, a) => {
  if (s === TERMINAL_STATE) {
    return { p: 1, s2: s, r: 0 }
  }
  const [x1, y1] = stateToGridCoords(s)
  const [x2, y2] = moveTo(x1, y1, a)
  if (gridCoordsAreOffGrid(x2, y2)) {
    return { p: 1, s2: s, r: -1 }
  }
  const s2 = gridCoordsAreTerminal(x2, y2)
    ? TERMINAL_STATE
    : gridCoordsToState(x2, y2)
  return { p: 1, s2, r: -1 }
}

const evaluatePolicy = pi => {
  for (; ;) {
    let delta = 0
    for (const s of S) {
      const oldValue = V.get(s)
      const a = pi.get(s)
      const { p, s2, r } = nextStateAndReward(s, a)
      const newValue = (1 / A.length) * p * (r + GAMMA * V.get(s2))
      V.set(s, newValue)
      delta = Math.max(delta, Math.abs(oldValue - newValue))
    }
    console.log({ delta })
    if (delta < THETA) break
  }
}

const improvePolicy = pi => {
  let policyStable = true
  for (const s of S) {
    const values = A.map(a => {
      const { p, s2, r } = nextStateAndReward(s, a)
      const value = p * (r + GAMMA * V.get(s2))
      return value
    })
    const index = argmax(values)
    const a = A[index]
    if (a !== pi.get(s)) {
      policyStable = false
    }
    pi.set(s, a)
  }
  return policyStable
}

const main = () => {
  const pi = new Map(S_PLUS.map(s => [s, A[0]]))
  console.dir(pi)
  console.log('-'.repeat(20))
  for (; ;) {
    if (improvePolicy(pi)) break
    evaluatePolicy(pi)
  }
  console.dir(pi)
  console.dir(toSignificantDigits(V, 2))
}

main()
