import { fmt, lint as biomeLint } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/biome.ts'
import type { Client } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { check } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/deno.ts'

export async function lint(client: Client) {
  await biomeLint({ client })
  await fmt({ client })
  await check({ client, entrypoints: ['src/mod.ts', 'src/cli.ts'] })
}
