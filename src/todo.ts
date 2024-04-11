import { formatResults } from './ripgrep.ts'
import { trimPrefix } from './string.ts'

/** default values for the tags parameter */
export const defaultTags = ['todo', 'fixme', 'fix', 'bug', 'mark']

/** default values for the comments parameter */
export const defaultComments = ['//', '#']

/** default values for the globs parameter */
export const defaultGlobs = ['!.git/*']

/** type of the search function parameters */
export type SearchParams = {
  tags?: string[]
  comments?: string[]
  globs?: string[]
  dir?: string
}

/** type of the search function result */
export type SearchResult = {
  path: string
  line_number: number
  line: string
  tag: string
  comment?: string
  subject?: string
}

/**
 * This function searches for todos in a directory
 * @param comments - The comments format to look for
 * @param tags - The tags to look for
 * @param globs - The globs to include or exclude files
 * @param dir - The directory to search in
 * @returns The list of todos found
 */
export async function search({ comments = defaultComments, tags = defaultTags, globs = defaultGlobs, dir = '.' }: SearchParams = {}): Promise<SearchResult[]> {
  const todoRegex = `(?:${comments.join('|')})[\\s]*(${tags.join('|')}).*$`

  const args = ['--json', '-i', '--hidden']

  for (const glob of globs) {
    args.push('--glob', glob)
  }

  args.push(todoRegex)

  const cmd = new Deno.Command('rg', { args, cwd: dir })

  const { stdout, stderr } = await cmd.output()

  const err = new TextDecoder().decode(stderr)

  if (err) {
    throw err
  }

  const out = new TextDecoder().decode(stdout)

  const results = formatResults(out)

  return results.map(result => {
    const rawText = (result.submatches?.[0]?.match?.text ?? '').trim()

    const text = comments.reduce((acc, comment) => trimPrefix(acc, comment), rawText).trim()
    const lowercaseText = text.toLowerCase()

    const tag = tags.find(tag => lowercaseText.startsWith(tag))

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
      comment: (comment.startsWith(':') ? comment.substring(1).trim() : comment) || undefined,
      subject,
    }
  })
}
