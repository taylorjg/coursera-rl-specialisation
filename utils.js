const range = n => Array.from(Array(n).keys())

function* rangeIter(n) {
  let value = 0
  while (value < n) {
    yield value++
  }
}

const sum = xs => xs.reduce((acc, x) => acc + x, 0)

const average = xs => sum(xs) / xs.length

const clip = (min, max, v) => Math.max(Math.min(max, v), min)

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

const toSignificantDigits = (map, significantDigits = 2) =>
  new Map(Array.from(map.entries())
    .map(([s, v]) => [s, Number(v.toPrecision(significantDigits))]))

module.exports = {
  range,
  rangeIter,
  sum,
  average,
  clip,
  randomChoice,
  argmax,
  toSignificantDigits
}
