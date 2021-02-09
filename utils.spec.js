const U = require('./utils')

describe('utils', () => {

  it('range', () => {
    expect(U.range(5)).toEqual([0, 1, 2, 3, 4])
  })

  it('rangeIter', () => {
    const values = []
    for (const value of U.rangeIter(5)) {
      values.push(value)
    }
    expect(values).toEqual([0, 1, 2, 3, 4])
  })

  it('sum', () => {
    expect(U.sum([1, 2, 3, 4, 5])).toEqual(1 + 2 + 3 + 4 + 5)
  })

  it('average', () => {
    expect(U.average([1, 2, 3, 4, 5])).toEqual((1 + 2 + 3 + 4 + 5) / 5)
  })

  it('randomChoice', () => {
    const ITERS = 10000
    const TOLERANCE_PC = 10
    const xs = [1, 2, 3, 4]
    const results = U.range(ITERS).map(_ => U.randomChoice(xs))
    const occurrencesOf = a => results.reduce((count, b) => a === b ? count + 1 : count, 0)
    const range = [
      ITERS * 1 / xs.length * (100 - TOLERANCE_PC) / 100,
      ITERS * 1 / xs.length * (100 + TOLERANCE_PC) / 100 + 1
    ]
    expect(occurrencesOf(1)).toBeWithin(...range)
    expect(occurrencesOf(2)).toBeWithin(...range)
    expect(occurrencesOf(3)).toBeWithin(...range)
    expect(occurrencesOf(4)).toBeWithin(...range)
  })

  it('argmax: without ties', () => {
    const values = [2, 5, 76, 101, 57]
    expect(U.argmax(values)).toEqual(3)
  })

  it('argmax: with ties', () => {
    const values = [2, 5, 76, 101, 57, 101, 33]
    expect(U.argmax(values)).toBeOneOf([3, 5])
  })
})
