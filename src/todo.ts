import { z } from 'npm:zod@3.22.4'
import { gitBlame } from './git.ts'
import { formatResults } from './ripgrep.ts'
import { trimPrefix } from './string.ts'

/** default values for the tags parameter */
export const defaultTags = ['todo', 'fixme', 'fix', 'bug', 'mark', 'note']

/** default values for the comments parameter */
export const defaultComments = ['//', '#']

/** default values for the globs parameter */
export const defaultGlobs = ['!.git/*']

/** default values for the priority markers */
export const defaultPriorityMarkers: PriorityMarker[] = [
  {
    name: 'urgent',
    marker: '!!',
    value: 10,
  },
  {
    name: 'high',
    marker: '!',
    value: 8,
  },
  {
    name: 'medium',
    marker: '?',
    value: 5,
  },
  {
    name: 'low',
    marker: '',
    value: 0,
  },
]

/** type of the priority marker */
export type PriorityMarker = {
  name: string
  marker: string
  value: number
}

/** type of the search function parameters */
export type SearchParams = {
  tags?: string[]
  comments?: string[]
  globs?: string[]
  dir?: string
  priorities?: PriorityMarker[]
  gitBlame?: boolean
}

/** type for the git info from a todo */
export type GitInfo = {
  message: string
  commit: string
  previousCommit: string
  author: string
  authorMail: string
  authorTime: string
  authorTimezone: string
  committer: string
  committerMail: string
  committerTime: string
  committerTimezone: string
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
  git?: GitInfo
}

const searchResultSchema = z.object({
  path: z.string(),
  line_number: z.number(),
  line: z.string(),
  tag: z.string(),
  comment: z.string().optional(),
  subject: z.string().optional(),
  priority: z
    .object({
      name: z.string(),
      marker: z.string(),
      value: z.number(),
    })
    .optional(),
  git: z
    .object({
      message: z.string(),
      commit: z.string(),
      previousCommit: z.string(),
      author: z.string(),
      authorMail: z.string(),
      authorTime: z.string(),
      authorTimezone: z.string(),
      committer: z.string(),
      committerMail: z.string(),
      committerTime: z.string(),
      committerTimezone: z.string(),
    })
    .optional(),
})

/** This function parses unknown data into search results */
export const parseSearchResults = (data: unknown): SearchResult[] => {
  try {
    return searchResultSchema.array().parse(data) as SearchResult[]
  } catch (error) {
    throw new Error(`Failed to parse search results: ${error}`)
  }
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
export async function search({
  gitBlame: gitBlameEnabled = false,
  comments = defaultComments,
  tags = defaultTags,
  globs = defaultGlobs,
  priorities = defaultPriorityMarkers,
  dir = '.',
}: SearchParams = {}): Promise<SearchResult[]> {
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

  const resultPromises = results
    .map(result => {
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
        line: result.lines.text.trim(),
        tag,
        comment: (comment.startsWith(':') ? comment.substring(1).trim() : comment) || undefined,
        subject,
        priority,
      }
    })
    .map(async result => ({
      ...result,
      git: gitBlameEnabled ? await gitBlame({ dir, result }) : undefined,
    }))

  return Promise.all(resultPromises)
}
