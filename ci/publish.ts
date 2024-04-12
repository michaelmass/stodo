import { getIDToken } from 'npm:@actions/core'
import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { publish } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/deno.ts'
import { lint } from './util.ts'

await connect(async client => {
  await lint(client)

  const githubToken = await getIDToken()
  const githubTokenSecret = client.setSecret('GITHUB_OIDC_TOKEN', githubToken)

  await publish({ client, token: githubTokenSecret })
})
