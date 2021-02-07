const U = require('./utils')

describe('utils', () => {

  it('range', () => {
    expect(U.range(5)).toEqual([0, 1, 2, 3, 4])
  })

  it('sum', () => {
    expect(U.sum([1, 2, 3, 4, 5])).toEqual(1 + 2 + 3 + 4 + 5)
  })

  it('average', () => {
    expect(U.average([1, 2, 3, 4, 5])).toEqual((1 + 2 + 3 + 4 + 5) / 5)
  })

  it('argmax: without ties', () => {
    const values = [2, 5, 76, 101, 57]
    expect(U.argmax(values)).toEqual(3)
  })

  it('argmax: with ties', () => {
    const values = [2, 5, 76, 101, 57, 101, 33]
    expect([3, 5]).toContain(U.argmax(values))
  })
})
