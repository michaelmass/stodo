import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { lint } from './util.ts'

await connect(async client => {
  await lint(client)
})
