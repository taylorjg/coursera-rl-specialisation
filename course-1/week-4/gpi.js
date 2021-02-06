const U = require('../../utils')

const configureGPI = (S, A, GAMMA, THETA) => {

  const sumOverTransitions = (V, s, a, transitions) => {
    const values = transitions(s, a).map(({ p, s2, r }) =>
      p * (r + GAMMA * V.get(s2)))
    return U.sum(values)
  }

  const evaluatePolicy = (V, pi, transitions) => {
    for (; ;) {
      let delta = 0
      for (const s of S) {
        const oldValue = V.get(s)
        const a = pi.get(s)
        const newValue = sumOverTransitions(V, s, a, transitions)
        V.set(s, newValue)
        delta = Math.max(delta, Math.abs(oldValue - newValue))
      }
      if (delta < THETA) break
    }
  }

  const improvePolicy = (V, pi, transitions) => {
    let policyStable = true
    for (const s of S) {
      const values = A.map(a => sumOverTransitions(V, s, a, transitions))
      const index = U.argmax(values)
      const a = A[index]
      if (a !== pi.get(s)) {
        policyStable = false
      }
      pi.set(s, a)
    }
    return policyStable
  }

  const valueIteration = (V, transitions) => {
    for (; ;) {
      let delta = 0
      for (const s of S) {
        const oldValue = V.get(s)
        const values = A.map(a => sumOverTransitions(V, s, a, transitions))
        const newValue = Math.max(...values)
        V.set(s, newValue)
        delta = Math.max(delta, Math.abs(oldValue - newValue))
      }
      if (delta < THETA) break
    }
  }

  const makeGreedyPolicy = (V, transitions) => {
    const pi = new Map(S.map(s => {
      const values = A.map(a => sumOverTransitions(V, s, a, transitions))
      const index = U.argmax(values)
      const a = A[index]
      return [s, a]
    }))
    return pi
  }

  return {
    evaluatePolicy,
    improvePolicy,
    valueIteration,
    makeGreedyPolicy
  }
}

module.exports = configureGPI
