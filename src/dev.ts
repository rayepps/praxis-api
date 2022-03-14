import { getFunctionMap, start, lambdaFrameworkMapper } from '@exobase/local'

const whitelist = [
  // 'enrichEventOnChange'
]

const functions = getFunctionMap(process.cwd())

start({
  port: process.env.PORT,
  framework: lambdaFrameworkMapper,
  functions: (whitelist.length > 0 ? functions.filter(f => whitelist.includes(f.function)) : functions).map((f) => {
    return { ...f,
      func: require(f.paths.import).default
    }
  })
}, (p) => {
  console.log(`API running at http://localhost:${p}`)
})