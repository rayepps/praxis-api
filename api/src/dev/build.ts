import fs from 'fs-extra'
import shell from '../core/util/shell'

const root = __dirname.replace('/src/dev', '')
const build = `${root}/build`
const zip = `${root}/notforglory-api.zip`

async function main () {

    // 
    // Clean up build directory
    //
    try { await fs.remove(build) } catch (err) {}
    await fs.mkdir(build)

    //
    // Add files and install dependencies
    //
    const [err] = await shell.command('yarn transpile', { cwd: root })
    if (err) process.exit(err)
    await fs.copy(`${root}/package.json`, `${build}/package.json`)
    await fs.copy(`${root}/yarn.lock`, `${build}/yarn.lock`)
    await shell.command('yarn --prod', { cwd: build })

    //
    // Clean up old zip
    //
    try { await fs.remove(zip) } catch (err) {}

    //
    // Generate new zip
    //
    await shell.command(`zip -q -r ${zip} *`, { cwd: build })
}

main()