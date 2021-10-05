const fs = require('fs-extra')


const BUILD_DIR = `${__dirname}/build`

async function main() {

    const routesFiles = await fs.readFile(`${__dirname}/src/components/Routes.tsx`, 'utf-8')
    const matches = routesFiles.matchAll(/path=\"(.+)\"/g)
    for (const match of matches) {
        const [, path] = match
        if (path === '/') continue
        await fs.ensureDir(`${BUILD_DIR}${path}`)
        await fs.copy(`${BUILD_DIR}/index.html`, `${BUILD_DIR}${path}/index.html`)
    }
}

main().catch(console.error)