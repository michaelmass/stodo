export async function runJq({ filter, json }: { filter: string; json: unknown[] }) {
  const args = ['-r', filter]

  const cmd = new Deno.Command('jq', { args, stdin: 'piped', stdout: 'piped', stderr: 'piped' })

  const p = cmd.spawn()

  const writer = p.stdin.getWriter()
  writer.write(new TextEncoder().encode(JSON.stringify(json)))
  writer.releaseLock()

  await p.stdin.close()

  const { stdout, stderr } = await p.output()

  const err = new TextDecoder().decode(stderr)

  if (err) {
    throw err
  }

  return new TextDecoder().decode(stdout)
}
