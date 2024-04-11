import { formatResults } from './ripgrep.ts'
import { trimPrefix } from './string.ts'

/** default values for the tags parameter */
export const defaultTags = ['todo', 'fixme', 'fix', 'bug', 'mark', 'note']

/** default values for the comments parameter */
export const defaultComments = ['//', '#']

/** default values for the globs parameter */
export const defaultGlobs = ['!.git/*']

/** default values for the priority markers */
export const defaultPriorityMarkers = [
  {
    name: 'high',
    marker: '!',
    prioriy: 10,
  },
  {
    name: 'medium',
    marker: '?',
    prioriy: 5,
  },
  {
    name: 'low',
    marker: '',
    prioriy: 0,
  },
] as const satisfies PriorityMarker[]

/** type of the priority marker */
export type PriorityMarker = {
  name: string
  marker: string
  prioriy: number
}

/** type of the search function parameters */
export type SearchParams = {
  tags?: string[]
  comments?: string[]
  globs?: string[]
  dir?: string
  priorities?: PriorityMarker[]
}

/** type of the search function result */
export type SearchResult = {
  path: string
  line_number: number
  line: string
  tag: string
  comment?: string
  subject?: string
  priority?: PriorityMarker
}

/**
 * This function searches for todos in a directory
 * @param comments - The comments format to look for
 * @param tags - The tags to look for
 * @param globs - The globs to include or exclude files
 * @param dir - The directory to search in
 * @param priorities - The priority markers to use
 * @returns The list of todos found
 */
export async function search({ comments = defaultComments, tags = defaultTags, globs = defaultGlobs, priorities = defaultPriorityMarkers, dir = '.' }: SearchParams = {}): Promise<SearchResult[]> {
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

    const priority = priorities.find(priority => textWithoutTag.startsWith(priority.marker))

    const textWithoutPriority = priority ? textWithoutTag.substring(priority.marker.length).trim() : textWithoutTag

    const parentEndIndex = textWithoutPriority.indexOf(')')
    const asSubject = textWithoutPriority.startsWith('(') && parentEndIndex !== -1

    const subject = asSubject ? textWithoutPriority.substring(1, parentEndIndex).trim() : undefined
    const comment = asSubject ? textWithoutPriority.substring(parentEndIndex + 1).trim() : textWithoutPriority

    return {
      path: result.path.text,
      line_number: result.line_number,
      line: result.lines.text,
      tag,
      comment: (comment.startsWith(':') ? comment.substring(1).trim() : comment) || undefined,
      subject,
      priority,
    }
  })
}
