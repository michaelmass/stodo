FROM denoland/deno:1.42.4

RUN apt-get update && apt-get install -y ripgrep jq git

WORKDIR /app

COPY src/deps.ts src/deps.ts
RUN deno cache src/deps.ts

ADD . .

RUN deno cache src/cli.ts

ENTRYPOINT [ "deno", "run", "--allow-run=rg,git,jq", "src/cli.ts"]
