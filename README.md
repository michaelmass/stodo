# stodo
> Cli & package to list all your todos in a project

[![JSR](https://jsr.io/badges/@michaelmass/stodo)](https://jsr.io/@michaelmass/stodo)

## Requirements

You need to have the following installed on your system

- [Deno](https://deno.com)
- [Ripgrep](https://github.com/BurntSushi/ripgrep)
- [Jq](https://jqlang.github.io/jq)
- [Git](https://git-scm.com)

## Usage

You can use the cli to search for all todos in a directory. The following command will search for all todos in the current directory. It will also use git blame to find the author of the todo and jq to filter the output. The command will exit with a non-zero code if there are todos found with a priority greater than 5.

```bash
deno run --allow-run=rg,git,jq jsr:@michaelmass/stodo/cli search --git-blame --exit-code --jq ".[] | select(.priority > 5)"
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
  ],
  gitBlame: true
})

console.log(todos)
```

Docker is also supported

```bash
docker run -it -v path/to/folder:/src michaelmass/stodo search --format pretty -d /src # TODO! Test this command
```

## Options

- `tags`: Array of tags to search for
- `comments`: Array of comment types to search for
- `globs`: Array of globs to ignore or include
- `dir`: Directory to search in
- `priorities`: Array of priorities to add to todos
  - `name`: Name of the priority
  - `marker`: Marker to search for
  - `value`: Priority value (> 10 is high, < 5 is low, else medium)
- `gitBlame`: Boolean to enable git blame
- `jq`: Filter the output with jq
- `exitCode`: Exit with a non-zero code if there are todos found (combined with jq to filter for priority)

## License

[MIT](LICENSE)
