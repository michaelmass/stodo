import { fmt, lint as biomeLint } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/biome.ts'
import type { Client, Directory } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { check } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/deno.ts'

export async function lint(params: { client: Client; dir: Directory }) {
  await biomeLint(params)
  await fmt(params)
  await check({ ...params, entrypoints: ['src/mod.ts', 'src/cli.ts'] })
}
