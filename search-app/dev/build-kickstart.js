/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
// import fs from 'fs'

function run() {
  const manifest = fs.readFileSync(`${__dirname}/../build/asset-manifest.json`, 'utf-8')
  const kickstartScript = fs.readFileSync(`${__dirname}/kickstart.js`, 'utf-8')
  const kickstart = kickstartScript.replace(
    /'\{\{manifest\}\}'/,
    manifest
  )
  fs.writeFileSync(`${__dirname}/../build/kickstart.js`, kickstart)
}

run()