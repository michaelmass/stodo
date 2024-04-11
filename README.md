# stodo
> Cli & package to list all your todos in a project

## Usage

You can use the cli to search for all todos in a directory

```bash
deno run --allow-run=rg jsr:@michaelmass/stodo/cli search
```

You can also use the package to search for all todos in a directory

```typescript
import { search } from 'https://deno.land/x/stodo/mod.ts'

const todos = await search({
  tags: ['todo', 'fixme', 'fix', 'bug', 'mark'],
  comments: ['//', '#'],
  globs: ['!.git/*'],
  dir: 'path/to/dir'
})

console.log(todos)
```

## Options

- `tags`: Array of tags to search for
- `comments`: Array of comment types to search for
- `globs`: Array of globs to ignore or include
- `dir`: Directory to search in

## License

[MIT](LICENSE)
