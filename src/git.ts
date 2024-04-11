import type { SearchResult, GitInfo } from './todo.ts'

type BlameParams = {
  dir: string
  result: SearchResult
}

export async function gitBlame({ dir, result }: BlameParams): Promise<GitInfo | undefined> {
  const args = ['blame', '-t', '-l', '-p', '--incremental', '-L', `${result.line_number},+1`, result.path]

  const cmd = new Deno.Command('git', { args, cwd: dir })

  const { stdout, stderr } = await cmd.output()

  const err = new TextDecoder().decode(stderr)

  if (err) {
    return
  }

  const out = new TextDecoder().decode(stdout).split('\n')

  const git = {
    commit: out[0].split(' ')[0],
    author: '',
    authorMail: '',
    authorTime: '',
    authorTimezone: '',
    committer: '',
    committerMail: '',
    committerTime: '',
    committerTimezone: '',
    message: '',
    previousCommit: '',
  }

  const lines = out.slice(1, -1)

  for (const line of lines) {
    const [key, ...values] = line.split(' ')

    const value = values.join(' ')

    if (key === 'author') {
      git.author = value
    } else if (key === 'author-mail') {
      git.authorMail = value
    } else if (key === 'author-time') {
      git.authorTime = value
    } else if (key === 'author-tz') {
      git.authorTimezone = value
    } else if (key === 'committer') {
      git.committer = value
    } else if (key === 'committer-mail') {
      git.committerMail = value
    } else if (key === 'committer-time') {
      git.committerTime = value
    } else if (key === 'committer-tz') {
      git.committerTimezone = value
    } else if (key === 'summary') {
      git.message = value
    } else if (key === 'previous') {
      git.previousCommit = values[0]
    }
  }

  return git
}
