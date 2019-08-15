# Define node version for all stages
# Keep in sync with .travis.yml
FROM node:10.16.2-alpine as node

FROM node as build

COPY . /
RUN apk add --update yarn
RUN yarn install

RUN mkdir -p dist/workdir
RUN mkdir -p dist/app
RUN mv node_modules /dist/app
RUN mv src /dist/app

FROM node

COPY --from=build  --chown=node:node  /dist /
WORKDIR /workdir

# No need to run as root!
USER node

ENTRYPOINT ["node", "/app/src/cli/main.js"]