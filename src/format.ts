import { stringify as stringifyYaml } from 'jsr:@std/yaml@0.221.0'
import { stringify as stringifyCsv } from 'jsr:@std/csv@0.221.0'
import { cyan, bold } from 'jsr:@std/fmt@0.221.0/colors'
import type { SearchTodosResult } from './todo.ts'

export const formats = ['json', 'jsonl', 'yaml', 'csv', 'md', 'markdown', 'pretty'] as const

type Format = (typeof formats)[number]

const resultsToJson = (results: SearchTodosResult[]): string => JSON.stringify(results, null, 2)
const resultsToJsonl = (results: SearchTodosResult[]): string => results.map(value => JSON.stringify(value)).join('\n')
const resultsToYaml = (results: SearchTodosResult[]): string => stringifyYaml(results)
const resultsToCsv = (results: SearchTodosResult[]): string => stringifyCsv(results)
const resultsToMarkdown = (results: SearchTodosResult[]): string => results.map(result => `- ${result.tag.toUpperCase()}${result.subject ? `(${result.subject})` : ''}: ${result.comment} [${result.path}#L${result.line_number}](${result.path}#L${result.line_number})`).join('\n')
const resultsToPretty = (results: SearchTodosResult[]): string => results.map(result => `${cyan(result.tag.toUpperCase())}${result.subject ? ` (${bold(result.subject)})` : ''} ${result.comment} ${result.path}#${result.line_number}`).join('\n')

const formatFuncMap: { [key in Format]: (data: SearchTodosResult[]) => string } = {
  json: resultsToJson,
  jsonl: resultsToJsonl,
  yaml: resultsToYaml,
  csv: resultsToCsv,
  md: resultsToMarkdown,
  markdown: resultsToMarkdown,
  pretty: resultsToPretty,
}

export const formatOutput = (data: SearchTodosResult[], format: Format): string => {
  const formatFunc = formatFuncMap[format]

  if (!formatFunc) {
    throw new Error(`Invalid format: ${format}`)
  }

  return formatFunc(data)
}
