FROM node:14-alpine

RUN apk update && apk add bash

WORKDIR /app
COPY package.json /app

RUN yarn install

COPY . /app

EXPOSE 8000
CMD ["./wait-for-it.sh" , "rabbitmq:5672" , "--strict" , "--timeout=300" , "--" , "npm", "run", "dev"]
