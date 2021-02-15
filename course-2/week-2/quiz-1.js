const A = 0
const B = 1
const T = 99

const ALPHA = 1
const GAMMA = 0.5

const main = () => {

  const episode = [
    { s: A, s2: B, r: 0 },
    { s: B, s2: B, r: 1 },
    { s: B, s2: T, r: 0 }
  ]

  const V = new Map([[A, 1], [B, 1], [T, 0]])

  for (const { s, s2, r } of episode) {
    const tdTarget = r + GAMMA * V.get(s2)
    const tdError = tdTarget - V.get(s)
    V.set(s, V.get(s) + ALPHA * tdError)
  }

  console.log(`Answer: (${V.get(A)}, ${V.get(B)})`)
}

main()
