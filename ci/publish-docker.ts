import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { build, publish as publishDocker } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/docker.ts'
import { getInfinsical } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/infisical.ts'
import { context } from 'npm:@actions/github'

await connect(async client => {
  const infisical = getInfinsical({ client })

  const dockerTokenSecret = await infisical.get({
    name: 'TOKEN',
    secretPath: 'docker',
    secretName: 'dockerToken',
  })

  const dockerUsernameSecret = await infisical.get({
    name: 'USERNAME',
    secretPath: 'docker',
    secretName: 'dockerUsername',
  })

  const username = await dockerUsernameSecret.plaintext()
  const container = await build({
    client,
  })

  await publishDocker({
    container,
    password: dockerTokenSecret,
    username,
    repository: `${username}/${name}`,
    tags: getTags(context.ref),
  })
})

function removePrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}

function getTags(ref: string) {
  return ref.startsWith('refs/tags/') ? ['latest', removePrefix(removePrefix(ref, 'refs/tags/'), 'v')] : ['latest']
}
