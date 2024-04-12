import { getIDToken } from 'npm:@actions/core'
import { fmt, lint } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/biome.ts'
import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { check, publish } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/deno.ts'

await connect(async client => {
  const params = {
    client,
    dir: client.host().directory('.'),
  }

  // await lint({ client })
  // await fmt({ client })
  // await check({ client, entrypoints: ['src/mod.ts', 'src/cli.ts'] })

  // const githubToken = await getIDToken()
  // const githubTokenSecret = client.setSecret('GITHUB_OIDC_TOKEN', githubToken)

  // await publish({ ...params, token: githubTokenSecret })

  await client
    .container()
    .from('denoland/deno')
    .withDirectory('/src', client.host().directory('.'))
    .withWorkdir('/src')
    .withExec(['deno', 'publish'], {
      skipEntrypoint: true,
    })
    .sync()
})
