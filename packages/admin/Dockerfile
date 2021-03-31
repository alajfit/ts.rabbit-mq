FROM node:14-alpine as base

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm build

EXPOSE 8000
CMD ["node", "."]
