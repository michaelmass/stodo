import { Command, EnumType } from 'jsr:@cliffy/command@1.0.0-rc.4'
import { search } from './todo.ts'
import { formats } from './format.ts'
import { formatResults } from './format.ts'

const formatType = new EnumType(formats)

await new Command()
  .name('stodo')
  .version('0.1.2')
  .description('Command line to list all todos in a folder')
  .command('search', 'search the for todos in the folder')
  .type('format', formatType)
  .option('-d, --dir <dir:string>', 'Directory to search for todos', { default: '.' })
  .option('-f, --format <format:format>', 'Format to output the results in', { default: 'json' })
  .option('-t, --tags <tags:string>', 'Tags to search for', { collect: true })
  .option('-g, --globs <globs:string>', 'Globs to include or exclude files', { collect: true })
  .option('-c, --comments <comments:string>', 'Comments string to look for', { collect: true })
  .action(async options => {
    const results = await search(options)
    const output = formatResults(results, options.format)
    // biome-ignore lint/suspicious/noConsoleLog: This is the output of the command
    console.log(output)
  })
  .parse(Deno.args)
