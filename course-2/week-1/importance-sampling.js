const assert = require('assert')

const U = require('../../utils')

const workedExample = (bProbDist, piProbDist, bSamples) => {
  const rho = bSample => piProbDist.get(bSample) / bProbDist.get(bSample)
  const expectedValue = U.average(bSamples.map(bSample => bSample * rho(bSample)))
  console.log('bSamples:', bSamples, 'expectedValue:', expectedValue.toFixed(2))
}

const main = () => {
  const bProbDist = new Map([[1, 0.85], [2, 0.05], [3, 0.05], [4, 0.05]])
  const piProbDist = new Map([[1, 0.30], [2, 0.40], [3, 0.10], [4, 0.20]])
  assert.strictEqual(U.sum(Array.from(bProbDist.values())), 1)
  assert.strictEqual(U.sum(Array.from(piProbDist.values())), 1)
  workedExample(bProbDist, piProbDist, [1])
  workedExample(bProbDist, piProbDist, [1, 3])
  workedExample(bProbDist, piProbDist, [1, 3, 1])
}

main()
