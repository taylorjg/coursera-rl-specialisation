const yargs = require('yargs')

const regular = () => {
  console.log('[regular]')
}

const enhanced = () => {
  console.log('[enhanced]')
}

const regularWithValueIteration = () => {
  console.log('[regularWithValueIteration]')
}

const enhancedWithValueIteration = () => {
  console.log('[enhancedWithValueIteration]')
}

const main = () => {
  const argv = yargs
    .option('e', {
      alias: 'enhanced',
      nargs: 0,
      describe: 'Use enhanced gridworld (versus regular gridworld)'
    })
    .option('v', {
      alias: 'valueIteration',
      nargs: 0,
      describe: 'Use value iteration (versus policy evaluation / improvement)'
    })
    .wrap(null)
    .argv

  const flagsCombination = `${Boolean(argv.enhanced)}:${Boolean(argv.valueIteration)}`

  switch (flagsCombination) {
    case 'false:false': return regular()
    case 'true:false': return enhanced()
    case 'false:true': return regularWithValueIteration()
    case 'true:true': return enhancedWithValueIteration()
  }
}

main()
