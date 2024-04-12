import { bold, cyan, red, stringifyCsv, stringifyYaml, yellow } from './deps.ts'
import type { PriorityMarker, SearchResult } from './todo.ts'

/** The list of formats available to format the results of the search */
export const formats = ['json', 'jsonl', 'yaml', 'yml', 'csv', 'md', 'markdown', 'pretty'] as const

/** type of all allowed formats */
export type Format = (typeof formats)[number]

const prettyFormatPriority = (priority?: PriorityMarker): string => {
  if (!priority) {
    return ''
  }

  if (priority.value >= 8) {
    return red(priority.name)
  }

  if (priority.value >= 5) {
    return yellow(priority.name)
  }

  return cyan(priority.name)
}

const columns = [['path'], ['line_number'], ['line'], ['tag'], ['comment'], ['subject'], ['priority', 'name'], ['priority', 'marker'], ['priority', 'priority']]

const resultsToJson = (results: SearchResult[]): string => JSON.stringify(results, null, 2)
const resultsToJsonl = (results: SearchResult[]): string => results.map(value => JSON.stringify(value)).join('\n')
const resultsToYaml = (results: SearchResult[]): string => stringifyYaml(JSON.parse(JSON.stringify(results)))
const resultsToCsv = (results: SearchResult[]): string => stringifyCsv(results, { columns, headers: false })
const resultsToMarkdown = (results: SearchResult[]): string =>
  results
    .map(
      result =>
        `- ${result.tag.toUpperCase()}${result.subject ? `(${result.subject})` : ''}: ${result.comment} [${result.path}#L${result.line_number}](${result.path}#L${result.line_number}) ${
          result.priority ? `[${result.priority.name}]` : ''
        }`,
    )
    .join('\n')
const resultsToPretty = (results: SearchResult[]): string =>
  results
    .map(
      result =>
        `${cyan(result.tag.toUpperCase())}${result.subject ? ` (${bold(result.subject)})` : ''} ${result.comment} ${result.path}#${result.line_number} ${prettyFormatPriority(result.priority)}`,
    )
    .join('\n')

const formatFuncMap: { [key in Format]: (data: SearchResult[]) => string } = {
  json: resultsToJson,
  jsonl: resultsToJsonl,
  yaml: resultsToYaml,
  yml: resultsToYaml,
  csv: resultsToCsv,
  md: resultsToMarkdown,
  markdown: resultsToMarkdown,
  pretty: resultsToPretty,
}

/** This function formats the result of a todo search with a specific format */
export function formatResults(data: SearchResult[], format: Format): string {
  const formatFunc = formatFuncMap[format]

  if (!formatFunc) {
    throw new Error(`Invalid format: ${format}`)
  }

  return formatFunc(data)
}
