/**
 * @module
 *
 * This module contains the command line interface for the todo search command.
 *
 */
import { Command, EnumType } from 'jsr:@cliffy/command@1.0.0-rc.4'
import { type PriorityMarker, search } from './todo.ts'
import { formats } from './format.ts'
import { formatResults } from './format.ts'
import data from '../deno.json' with { type: 'json' }

const formatType = new EnumType(formats)

await new Command()
  .name('stodo')
  .version(data.version)
  .description('Command line to list all todos in a folder')
  .command('search', 'search the for todos in the folder')
  .type('format', formatType)
  .option('-d, --dir <dir:string>', 'Directory to search for todos', { default: '.' })
  .option('-f, --format <format:format>', 'Format to output the results in', { default: 'json' })
  .option('-t, --tags <tags:string>', 'Tags to search for', { collect: true })
  .option('-g, --globs <globs:string>', 'Globs to include or exclude files', { collect: true })
  .option('-c, --comments <comments:string>', 'Comments string to look for', { collect: true })
  .option('-p, --priorities <priorities:string>', 'Priority markers to use', {
    collect: true,
    value: (value: string, previous: Array<PriorityMarker> = []): Array<PriorityMarker> => {
      const [name, marker, priority] = value.split(':')
      return [...previous, { name, marker, priority: Number.parseInt(priority) }]
    },
  })
  .option('-e, --exit-code', 'Exit with a non-zero code if there are todos found', { default: false })
  .option('--git-blame', 'Run git blame on the todos found', { default: true })
  .action(async options => {
    const results = await search(options)
    const output = formatResults(results, options.format)
    // biome-ignore lint/suspicious/noConsoleLog: This is the output of the command
    console.log(output)

    if (options.exitCode && results.length > 0) {
      Deno.exit(1)
    }
  })
  .parse(Deno.args)
