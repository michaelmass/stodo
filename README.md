# stodo
> Cli & package to list all your todos in a project

[![JSR](https://jsr.io/badges/@michaelmass/stodo)](https://jsr.io/@michaelmass/stodo)

## Requirements

You need to have the following installed on your system

- [Deno](https://deno.com)
- [Ripgrep](https://github.com/BurntSushi/ripgrep)

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
  dir: 'path/to/dir',
  priorities: [
    {
      name: 'high',
      marker: '!',
      priority: 10,
    },
    {
      name: 'medium',
      marker: '?',
      priority: 5,
    },
    {
      name: 'low',
      marker: '',
      priority: 0,
    },
  ],
  gitBlame: true
})

console.log(todos)
```

## Options

- `tags`: Array of tags to search for
- `comments`: Array of comment types to search for
- `globs`: Array of globs to ignore or include
- `dir`: Directory to search in
- `priorities`: Array of priorities to add to todos
  - `name`: Name of the priority
  - `marker`: Marker to search for
  - `priority`: Priority value (> 10 is high, < 5 is low, else medium)
- `gitBlame`: Boolean to enable git blame

## License

[MIT](LICENSE)
