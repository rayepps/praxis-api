// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

function run() {
  const manifest = fs.readFileSync(`${__dirname}/../build/asset-manifest.json`, 'utf-8')
  const kickstartScriptRaw = fs.readFileSync(`${__dirname}/kickstart.js`, 'utf-8')
  const kickstartScript = kickstartScriptRaw.replace(
    /'\{\{manifest\}\}'/,
    manifest
  )
  fs.writeFileSync(`${__dirname}/kickstart.js`, kickstartScript)
}

run()