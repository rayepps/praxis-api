/**
 * 
 * WARN: This is a standalone file.
 * 
 * Because each react build produces new random
 * chuck identifiers and the number of them can
 * change as the project grows we use this func
 * to kickstart the search app from the webflow
 * page. At build time the manifest variable below 
 * is filled in with the asset-manifest.json content
 * generated from the build. When the page loads, 
 * kickstart determines which chuck js
 * and css files are needed, what their name is
 * and appends them to the dom for loading.
 * 
 * Example asset-manifest.json:
 * 
 * {
  "files": {
    "main.css": "https://uat-app.praxisco.link/static/css/main.bc3196b1.chunk.css",
    "main.js": "https://uat-app.praxisco.link/static/js/main.5cbb8d09.chunk.js",
    "main.js.map": "https://uat-app.praxisco.link/static/js/main.5cbb8d09.chunk.js.map",
    "runtime-main.js": "https://uat-app.praxisco.link/static/js/runtime-main.6495f741.js",
    "runtime-main.js.map": "https://uat-app.praxisco.link/static/js/runtime-main.6495f741.js.map",
    ...
  },
  "entrypoints": [
    "static/js/runtime-main.6495f741.js",
    "static/css/2.e730c243.chunk.css",
    "static/js/2.457427da.chunk.js",
    "static/css/main.bc3196b1.chunk.css",
    "static/js/main.5cbb8d09.chunk.js"
  ]
}
 */

const manifest = '{{manifest}}'

const cssFiles = manifest.entrypoints.filter(ep => ep.endsWith('.css'))
const jsFiles = manifest.entrypoints.filter(ep => ep.endsWith('.js'))
cssFiles.map(path => addStyle(path))
jsFiles.map(path => addScript(path))

function addScript(src) {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = src
  try {
    document.body.appendChild(script)
  } catch (err) {
    console.error(err)
  }
}

function addStyle(href) {
  const style = document.createElement('link')
  style.rel = 'stylesheet'
  style.href = href
  try {
    document.head.appendChild(style)
  } catch (err) {
    console.error(err)
  }
}