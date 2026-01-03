FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=./libs/database/prisma/schema.prisma

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

RUN npm run build ${APP_NAME}

CMD node dist/apps/${APP_NAME}/main