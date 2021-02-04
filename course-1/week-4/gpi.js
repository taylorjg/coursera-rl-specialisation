const U = require('../../utils')

const configureGPI = (S, A, GAMMA, THETA) => {

  const sumOverDynamics = (V, s, a, dynamics) => {
    const values = dynamics(s, a).map(({ p, s2, r }) =>
      p * (r + GAMMA * V.get(s2)))
    return U.sum(values)
  }

  const evaluatePolicy = (V, pi, dynamics) => {
    for (; ;) {
      let delta = 0
      for (const s of S) {
        const oldValue = V.get(s)
        const a = pi.get(s)
        const newValue = sumOverDynamics(V, s, a, dynamics)
        V.set(s, newValue)
        delta = Math.max(delta, Math.abs(oldValue - newValue))
      }
      if (delta < THETA) break
    }
  }

  const improvePolicy = (V, pi, dynamics) => {
    let policyStable = true
    for (const s of S) {
      const values = A.map(a => sumOverDynamics(V, s, a, dynamics))
      const index = U.argmax(values)
      const a = A[index]
      if (a !== pi.get(s)) {
        policyStable = false
      }
      pi.set(s, a)
    }
    return policyStable
  }

  const valueIteration = (V, dynamics) => {
    for (; ;) {
      let delta = 0
      for (const s of S) {
        const oldValue = V.get(s)
        const values = A.map(a => sumOverDynamics(V, s, a, dynamics))
        const newValue = Math.max(...values)
        V.set(s, newValue)
        delta = Math.max(delta, Math.abs(oldValue - newValue))
      }
      if (delta < THETA) break
    }
  }

  const makeGreedyPolicy = (V, dynamics) => {
    const pi = new Map(S.map(s => {
      const values = A.map(a => sumOverDynamics(V, s, a, dynamics))
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
