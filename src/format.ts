import { stringify as stringifyYaml } from 'jsr:@std/yaml@0.221.0'
import { stringify as stringifyCsv } from 'jsr:@std/csv@0.221.0'
import { cyan, bold } from 'jsr:@std/fmt@0.221.0/colors'
import type { SearchResult } from './todo.ts'

export const formats = ['json', 'jsonl', 'yaml', 'csv', 'md', 'markdown', 'pretty'] as const

type Format = (typeof formats)[number]

const resultsToJson = (results: SearchResult[]): string => JSON.stringify(results, null, 2)
const resultsToJsonl = (results: SearchResult[]): string => results.map(value => JSON.stringify(value)).join('\n')
const resultsToYaml = (results: SearchResult[]): string => stringifyYaml(results)
const resultsToCsv = (results: SearchResult[]): string => stringifyCsv(results)
const resultsToMarkdown = (results: SearchResult[]): string => results.map(result => `- ${result.tag.toUpperCase()}${result.subject ? `(${result.subject})` : ''}: ${result.comment} [${result.path}#L${result.line_number}](${result.path}#L${result.line_number})`).join('\n')
const resultsToPretty = (results: SearchResult[]): string => results.map(result => `${cyan(result.tag.toUpperCase())}${result.subject ? ` (${bold(result.subject)})` : ''} ${result.comment} ${result.path}#${result.line_number}`).join('\n')

const formatFuncMap: { [key in Format]: (data: SearchResult[]) => string } = {
  json: resultsToJson,
  jsonl: resultsToJsonl,
  yaml: resultsToYaml,
  csv: resultsToCsv,
  md: resultsToMarkdown,
  markdown: resultsToMarkdown,
  pretty: resultsToPretty,
}

/** This function formats the result of a todo search with a specific format */
export const formatResults = (data: SearchResult[], format: Format): string => {
  const formatFunc = formatFuncMap[format]

  if (!formatFunc) {
    throw new Error(`Invalid format: ${format}`)
  }

  return formatFunc(data)
}
