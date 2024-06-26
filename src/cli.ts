/**
 * @module
 *
 * This module contains the command line interface for the todo search command.
 *
 */
import data from '../deno.json' with { type: 'json' }
import { Command, EnumType } from './deps.ts'
import { formats } from './format.ts'
import { formatResults } from './format.ts'
import { runJq } from './jq.ts'
import { type PriorityMarker, type SearchResult, parseSearchResults, search } from './todo.ts'

await new Command()
  .name('stodo')
  .version(data.version)
  .description('Command line to list all todos in a folder')
  .command('search', 'search the for todos in the folder')
  .type('format', new EnumType(formats))
  .option('-d, --dir <dir:string>', 'Directory to search for todos', { default: '.' })
  .option('-f, --format <format:format>', 'Format to output the results in', { default: 'json' })
  .option('-t, --tags <tags:string>', 'Tags to search for', { collect: true })
  .option('-g, --globs <globs:string>', 'Globs to include or exclude files', { collect: true })
  .option('-c, --comments <comments:string>', 'Comments string to look for', { collect: true })
  .option('--jq <jq:string>', 'JQ query to filter search results')
  .option('-p, --priorities <priorities:string>', 'Priority markers to use', {
    collect: true,
    value: (value: string, previous: Array<PriorityMarker> = []): Array<PriorityMarker> => {
      const [name, marker, priority] = value.split(':')
      return [...previous, { name, marker, value: Number.parseInt(priority) }]
    },
  })
  .option('-e, --exit-code', 'Exit with a non-zero code if there are todos found', { default: false })
  .option('--git-blame', 'Run git blame on the todos found', { default: true })
  .action(async options => {
    const results = await search(options)

    const { output, count } = await getOutput(results, options)

    // biome-ignore lint/suspicious/noConsoleLog: This is the output of the command
    console.log(output)

    if (options.exitCode && count > 0) {
      Deno.exit(1)
    }
  })
  .parse(Deno.args)

async function getOutput(results: SearchResult[], { format, jq }: { format: (typeof formats)[number]; jq?: string }): Promise<{ output: string; count: number }> {
  if (jq) {
    const jqOutput = await runJq({ filter: jq, json: results })

    if (format === 'json') {
      const count = countJqResults(jqOutput)
      return { output: jqOutput, count }
    }

    const jqResults = parseSearchResults(JSON.parse(jqOutput))

    return { output: formatResults(jqResults, format), count: jqResults.length }
  }

  const output = formatResults(results, format)

  return { output, count: results.length }
}

function countJqResults(results: string): number {
  const data: unknown = JSON.parse(results)

  if (Array.isArray(data)) {
    return data.length
  }

  if (typeof data === 'object') {
    if (data === null) {
      return 0
    }

    return Object.keys(data).length
  }

  if (!data) {
    return 0
  }

  if (typeof data === 'number') {
    return data
  }

  if (typeof data === 'string') {
    return data.length
  }

  return 0
}
