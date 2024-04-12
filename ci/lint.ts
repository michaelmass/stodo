import { fmt, lint } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/biome.ts'
import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { check } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/deno.ts'

await connect(async client => {
  await lint({ client })
  await fmt({ client })
  await check({ client, entrypoints: ['src/mod.ts', 'src/cli.ts'] })
})
