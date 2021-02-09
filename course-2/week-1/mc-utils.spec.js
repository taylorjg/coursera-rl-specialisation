const MCU = require('./mc-utils')
const U = require('../../utils')

describe('mc-utils', () => {

  it('makeStateActionKey', () => {
    expect(MCU.makeStateActionKey(3, 5)).toEqual('3:5')
  })

  it('initialiseStateActionMap', () => {
    const S = [0, 1, 2]
    const A = [3, 4, 5]
    const Q = MCU.initialiseStateActionMap(S, A, () => 42)
    expect(Q).toEqual(new Map([
      ['0:3', 42],
      ['0:4', 42],
      ['0:5', 42],
      ['1:3', 42],
      ['1:4', 42],
      ['1:5', 42],
      ['2:3', 42],
      ['2:4', 42],
      ['2:5', 42]
    ]))
  })

  it('checkFirstVisit: (s, a) does not appear earlier', () => {
    const episode = [
      { s: 0, a: 4, r: 0 },
      { s: 1, a: 5, r: 0 },
      { s: 2, a: 6, r: 0 },
      { s: 3, a: 7, r: 0 }
    ]
    const isFirstVisit = MCU.checkFirstVisit(episode, 3)
    expect(isFirstVisit).toBeTruthy()
  })

  it('checkFirstVisit: (s, a) does appear earlier', () => {
    const episode = [
      { s: 0, a: 4, r: 0 },
      { s: 3, a: 7, r: 0 },
      { s: 2, a: 6, r: 0 },
      { s: 3, a: 7, r: 0 }
    ]
    const isFirstVisit = MCU.checkFirstVisit(episode, 3)
    expect(isFirstVisit).toBeFalsy()
  })

  it('probDistChoice', () => {
    const ITERS = 10000
    const TOLERANCE_PC = 10
    const probDist = new Map([[1, 0.1], [2, 0.8], [3, 0.1]])
    const results = U.range(ITERS).map(_ => MCU.probDistChoice(probDist))
    const occurrencesOf = a => results.reduce((count, b) => a === b ? count + 1 : count, 0)
    const makeRange = p => [
      ITERS * p * (100 - TOLERANCE_PC) / 100,
      ITERS * p * (100 + TOLERANCE_PC) / 100 + 1
    ]
    expect(occurrencesOf(1)).toBeWithin(...makeRange(probDist.get(1)))
    expect(occurrencesOf(2)).toBeWithin(...makeRange(probDist.get(2)))
    expect(occurrencesOf(3)).toBeWithin(...makeRange(probDist.get(3)))
  })

  it('makeEquiprobablePolicyMap', () => {
    const S = [0, 1, 2]
    const A = [3, 4, 5, 6, 7]
    const policyMap = MCU.makeEquiprobablePolicyMap(S, A)
    expect(policyMap).toEqual(new Map([
      [0, new Map([[3, 0.2], [4, 0.2], [5, 0.2], [6, 0.2], [7, 0.2]])],
      [1, new Map([[3, 0.2], [4, 0.2], [5, 0.2], [6, 0.2], [7, 0.2]])],
      [2, new Map([[3, 0.2], [4, 0.2], [5, 0.2], [6, 0.2], [7, 0.2]])]
    ]))
  })
})
