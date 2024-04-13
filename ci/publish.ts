import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { publish } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/deno.ts'
import { lint } from './util.ts'

await connect(async client => {
  const dir = client.host().directory('.')

  await lint({ client, dir })
  await publish({ client, dir })
})
