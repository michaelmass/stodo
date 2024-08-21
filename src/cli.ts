/**
 * @module
 *
 * This module contains the command line interface for the todo search command.
 *
 */
import data from '../deno.json' with { type: 'json' }
import { searchCommand } from './commands/search.ts'
import { doctorCommand } from './commands/doctor.ts'
import { Command } from './deps.ts'

await new Command().name('stodo').version(data.version).description('Command line to list all todos in a folder').command('doctor', doctorCommand).command('search', searchCommand).parse(Deno.args)
