const MCU = require('./mc-utils')

describe('mc-utils', () => {

  it('makeStateActionKey', () => {
    expect(MCU.makeStateActionKey(3, 5)).toEqual('3:5')
  })

  it('initialiseStateActionMap', () => {
    const S = [0, 1, 2]
    const A = [3, 4, 5]
    const map = MCU.initialiseStateActionMap(S, A, () => 42)
    const mapEntries = Array.from(map.entries())
    expect(mapEntries).toEqual([
      ['0:3', 42],
      ['0:4', 42],
      ['0:5', 42],

      ['1:3', 42],
      ['1:4', 42],
      ['1:5', 42],

      ['2:3', 42],
      ['2:4', 42],
      ['2:5', 42],
    ])
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
})
