A complex docker project using React as front-end, Express as back-end API, PostgreSQL as database and Redis as messaging queue

```yaml
version: '3'
services:
  postgres:
    image: 'postgres:latest'
  redis:
    image: 'redis:latest'
  nginx: 
    restart: always
    build:
      context: ./nginx
      dockerfile: Dockerfile.dev
    ports:
      - '3050:80'
  api:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    volumes:
      - /app/node_modules
      - ./server:/app
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - PGUSER=postgres
      - PGHOST=postgres
      - PGDATABASE=postgres
      - PGPASSWORD=postgres_password
      - PGPORT=5432
  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    volumes:
      - /app/node_modules
      - ./client:/app
  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile.dev
    volumes:
      - /app/node_modules
      - ./worker:/app
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379

```

For dev and prod build:

## `Client` project

`dev`
Dockerfile.dev
```yaml
FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["npm","start"] # use webpack dev server
```

`prod`
Dockerfile - 2 steps, firstly build then copy build files to nginx server for serving static files. *This nginx container is dedicated to this project only!*

```yaml
FROM node:alpine as builder

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["npm","run", "build"]

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
```

nginx/default.conf
```
server {
    listen 3000;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
    }
}
```


## `API` project
`dev`

Dockerfile.dev
```yaml
FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

# for dev env, use nodemon
CMD ["npm", "run", "dev"]

```

`prod`
Dockerfile
```
FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
```

## `worker` project
`dev`
Dockerfile.dev
```yaml
FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

# for dev env, use nodemon
CMD ["npm", "run", "dev"]
```

`prod`
Dockerfile
```yaml
FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
```

## `nginx` project
`dev` and  `prod` use same config

default.conf
```
# upstream defines a group of server
upstream client {
    server client:3000;
}

upstream api {
    server api:4000;
}

server {
    listen 80;

    location / {
        proxy_pass http://client;
    }

    location /sockjs-node {
        proxy_pass http://client;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    location /api {
        rewrite /api/(.*) /$1 break;
        proxy_pass http://api;
    }
}
```

same settings for Dockerfile and Dockerfile.dev
```yaml
FROM nginx

COPY ./default.conf /etc/nginx/conf.d/
```

