import { formatResults } from './ripgrep.ts'
import { trimPrefix } from './string.ts'

const defaultTags = ['todo', 'fixme', 'fix', 'bug', 'mark']
const defaultComments = ['//', '#']

type ListTodosParams = {
  tags?: string[]
  comments?: string[]
}

export const listTodos = async ({ comments = defaultComments, tags = defaultTags }: ListTodosParams = {}) => {
  const todoRegex = `(?:${comments.join('|')})[\\s]*(${tags.join('|')}).*$`

  const cmd = new Deno.Command('rg', {
    args: [
      '--json',
      '-i',
      '--hidden',
      '--glob',
      '!.git/*',
      todoRegex,
    ],
  });

  const { stdout, stderr } = await cmd.output()

  const err = new TextDecoder().decode(stderr)

  if (err) {
    console.error(err)
    return
  }

  const out = new TextDecoder().decode(stdout)

  const results = formatResults(out)

  return results.map((result) => {
    const rawText = (result.submatches?.[0]?.match?.text ?? '').trim()

    const text = comments.reduce((acc, comment) => trimPrefix(acc, comment), rawText).trim()
    const lowercaseText = text.toLowerCase()

    const tag = tags.find((tag) => lowercaseText.startsWith(tag))

    if (!tag) {
      throw new Error(`Unable to find tag in line: ${text}`)
    }

    const textWithoutTag = text.substring(tag.length).trim()

    const parentEndIndex = textWithoutTag.indexOf(')')
    const asSubject = textWithoutTag.startsWith('(') && parentEndIndex !== -1

    const subject = asSubject ? textWithoutTag.substring(1, parentEndIndex).trim() : undefined
    const comment = asSubject ? textWithoutTag.substring(parentEndIndex + 1).trim() : textWithoutTag

    return {
      path: result.path.text,
      line_number: result.line_number,
      line: result.lines.text,
      tag,
      comment: comment ? comment : undefined,
      subject,
    }
  })
}
