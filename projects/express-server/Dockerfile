FROM node:20.10.0-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY ./index.js .
COPY ./package.json .

RUN npm i

USER node

EXPOSE 3000
