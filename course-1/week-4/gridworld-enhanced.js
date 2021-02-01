const rangeIter = n => Array(n).keys()

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

const toSignificantDigits = (map, significantDigits) =>
  new Map(Array.from(map.entries())
    .map(([s, v]) => [s, Number(v.toPrecision(significantDigits))]))

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

const TERMINAL_STATE = 99
const S_PLUS = [...S, TERMINAL_STATE]
const GAMMA = 1
const THETA = 2 + 1e-12

const UP = 0
const DOWN = 1
const RIGHT = 2
const LEFT = 3
const A = [UP, DOWN, RIGHT, LEFT]

let V = new Map(S_PLUS.map(s => [s, 0]))

const newCoordsAfterTakingAction = (x, y, a) => {
  switch (a) {
    case UP: return [x, y - 1]
    case DOWN: return [x, y + 1]
    case RIGHT: return [x + 1, y]
    case LEFT: return [x - 1, y]
    default: throw new Error(`[newCoordsAfterTakingAction] Unknown action "${a}"`)
  }
}

const coordsAreOffGrid = (x, y) => (x < 0 || y < 0 || x > 3 || y > 3)
const coordsAreTerminal = (x, y) => x === 0 && y === 0
const stateToCoords = s => [s % 4, Math.floor(s / 4)]
const coordsToState = (x, y) => y * 4 + x

const nextStateAndReward = (s, a) => {
  if (s === TERMINAL_STATE) {
    return { p: 1, s2: s, r: 0 }
  }
  const [x1, y1] = stateToCoords(s)
  const [x2, y2] = newCoordsAfterTakingAction(x1, y1, a)
  if (coordsAreOffGrid(x2, y2)) {
    const r = [1, 2, 3, 8, 9, 10].includes(s) ? -10 : -1
    return { p: 1, s2: s, r: r }
  }
  const s2 = coordsAreTerminal(x2, y2)
    ? TERMINAL_STATE
    : coordsToState(x2, y2)
  const r = [1, 2, 3, 8, 9, 10].includes(s2) ? -10 : -1
  return { p: 1, s2, r }
}

const evaluatePolicy = pi => {
  for (; ;) {
    let delta = 0
    for (const s of S) {
      const oldValue = V.get(s)
      const a = pi.get(s)
      const { p, s2, r } = nextStateAndReward(s, a)
      const newValue = p * (r + GAMMA * V.get(s2))
      V.set(s, newValue)
      delta = Math.max(delta, Math.abs(oldValue - newValue))
    }
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

const printMapInGrid = (map, formatValue = v => v) => {
  const w = 5
  for (const y of rangeIter(4)) {
    let line = ''
    for (const x of rangeIter(4)) {
      const tmp = y * 4 + x
      const s = S.includes(tmp) ? tmp : TERMINAL_STATE
      const value = map.has(s) ? `${formatValue(map.get(s))}` : ''
      line += value.padStart(w)
    }
    console.log(line)
  }
}

const main = () => {
  const pi = new Map(S.map(s => [s, randomChoice(A)]))
  for (; ;) {
    if (improvePolicy(pi)) break
    evaluatePolicy(pi)
  }

  console.log(`Optimal policy:`)
  printMapInGrid(pi, a => {
    switch (a) {
      case UP: return '\u2191'
      case DOWN: return '\u2193'
      case RIGHT: return '\u2192'
      case LEFT: return '\u2190'
      default: throw new Error(`[printGrid#formatValue] Unknown action "${a}"`)
    }
  })

  console.log()

  console.log(`Optimal state value function:`)
  printMapInGrid(V)
}

main()
