const U = require('../../utils')

const printMapInGrid = (S, TERMINAL_STATE) => (map, formatValue = v => v) => {
  const w = 5
  for (const y of U.rangeIter(4)) {
    let line = ''
    for (const x of U.rangeIter(4)) {
      const tmp = y * 4 + x
      const s = S.includes(tmp) ? tmp : TERMINAL_STATE
      const value = map.has(s) ? `${formatValue(map.get(s))}` : ''
      line += value.padStart(w)
    }
    console.log(line)
  }
}

module.exports = {
  printMapInGrid
}
