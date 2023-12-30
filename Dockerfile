FROM node:alpine

RUN npm install -g nodemon

RUN apk add --no-cache git openssh

RUN mkdir /app

ARG PORT

ENV PORT $PORT

WORKDIR /app

RUN npm cache clean --force

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --silent

COPY tsconfig.json ./

COPY . ./

VOLUME [ "/app" ]

EXPOSE 8000

CMD ["npm", "run", "dev"]
