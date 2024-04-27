import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { build } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/docker.ts'

await connect(async client => {
  await build({ client })
})
