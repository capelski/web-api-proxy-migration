FROM node:20.10.0-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY ./dist ./dist
COPY ./package.json .

RUN npm i

USER node

EXPOSE 3000
