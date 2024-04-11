type RipgrepJsonSubmatch = {
  match: { text: string }
  start: number
  end: number
}

type RipGrepJsonMatch = {
  type: 'match'
  data: {
    path: {
      text: string
    }
    lines: {
      text: string
    }
    line_number: number
    absolute_offset: number
    submatches: Array<RipgrepJsonSubmatch>
  }
}

type Match = RipGrepJsonMatch['data']

export function formatResults(output: string): Match[] {
  const stdout = output.trim()

  if (!stdout) {
    return []
  }

  return stdout
    .split('\n')
    .map(line => parseLine(line))
    .filter(jsonLine => jsonLine.type === 'match')
    .map(jsonLine => jsonLine.data)
}

function parseLine(value: string) {
  try {
    return JSON.parse(value)
  } catch (_) {
    console.error('Unable to parse line: ', value)
    return {}
  }
}
