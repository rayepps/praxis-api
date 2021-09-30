import { spawn } from 'child_process'


type CommandOptions = {
    cwd?: string | null
    quiet?: boolean, 
    buffer?: boolean,
    onErr?: null | ((err: string) => void)
    onOut?: null | ((str: string) => void)
}

export const command = async (cmd: string, { 
  cwd = null, 
  quiet = false, 
  buffer = false,
  onErr = null,
  onOut = null
}: CommandOptions = {}): Promise<[number | null, string]> => new Promise((res) => {

  const parts = cmd.split(' ') // [ 'yarn', 'install', '--silent', '--prod' ]
  const args = parts.slice(1) // [ install', '--silent', '--prod' ]
  const program = parts[0] // 'yarn'
  const child = spawn(program, args, { cwd, shell: true })
  
  const outBuffer: string[] = []

  const onStd = (type: 'out' | 'err') => (buf: Buffer) => {
    const str = buf.toString()
    if (buffer) outBuffer.push(str)
    if (!quiet) console.log(str)
    if (type === 'err') onErr?.(str)
    if (type === 'out') onOut?.(str)
  }

  child.stdout.on('data', onStd('out'))
  child.stderr.on('data', onStd('err'))
  child.on('close', (code) => {
    if (code > 0) res([code, outBuffer.join('')])
    else res([null, outBuffer.join('')])
  })
})

export default {
    command
}