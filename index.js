const fs = require('fs')
const _ = require('underscore')
const moment = require('moment')

const getValidWords = (current, target, words) => {
  const isValid = word => {
    let diff = 0
    for (let i = word.length; i--;) {
      if (word[i] !== current[i]) {
        ++diff
      }

      if (diff > 1) {
        return false
      }
    }

    return diff === 1
  }

  let result = words.filter(isValid)

  if (~result.indexOf(target)) {
    return [target]
  }

  return result
}

function SearchNode (current, target, words) {
  let chains = []
  let complete = false
  let result = [current]
  let nextWords = _.without(words, current)

  this.process = () => {
    const startWords = getValidWords(current, target, nextWords)
    chains = startWords.map(w => [current, w])
    nextWords = _.without(nextWords, ...startWords)

    while (!complete) {
      for (let i = chains.length; i--;) {
        const chain = chains[i]
        const validWords = getValidWords(chain[chain.length - 1], target, nextWords)

        if (validWords.length) {
          const nextChains = []

          for (let j = validWords.length; j--;) {
            const nextChain = [...chain, validWords[j]]

            if (nextChain[nextChain.length - 1] === target) {
              complete = true
              result = nextChain
              break
            }

            nextChains.push(nextChain)
          }

          if (complete) {
            break
          }

          chains.splice(i, 1, ...nextChains)
          nextWords = _.without(nextWords, ...validWords)
        } else {
          chains.splice(i, 1)
        }
      }

      if (!chains.length) {
        complete = true
      }
    }

    return result
  }
}

const search = (words, cb) => {
  const first = process.env.FIRST
  const second = process.env.SECOND

  if (!first || !second || first.length !== second.length) {
    return cb('Invalid Arguments')
  }

  const validWords = words.filter(x => x.length === first.length)

  console.log(first, second)

  const result = new SearchNode(first, second, validWords).process()

  if (result[result.length - 1] !== second) {
    return cb(`Couldn't get from ${first} to ${second}`)
  }

  cb(null, result)
}

fs.readFile('dictionary.txt', (err, data) => {
  if (err) {
    throw err
  }

  const words = data.toString().split('\r\n').map(w => w.toLowerCase())
  const start = moment()

  search(words, (err, result) => {
    if (err) {
      return console.error(err)
    }

    console.log(result.reduce((c, n) => `${c} => ${n}`), '')

    const finish = moment()
    console.log(`${moment.duration(finish.diff(start)).as('milliseconds')} milliseconds to complete`)
  })
})
