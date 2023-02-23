FROM docker.io/node:18-slim

RUN apt-get update
RUN apt-get install -y git
RUN ln -sv /usr/local/bin/node /bin/node
RUN npm i -g pnpm

RUN mkdir /src/
WORKDIR /src/

COPY . /src/

RUN cp .env.docker .env
RUN pnpm install
RUN pnpm prisma generate

CMD [ "/bin/sh", "-c", "pnpm prisma migrate reset --force --skip-generate && pnpm start" ]
