## Dockerfile.dev for local dev
```yaml
FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["npm","start"]
```

## Build 
```bash
docker build -f Dockerfile.dev .
```

## Run 
```
docker run -p 3000:3000 -d 3f2c34e75818

```

`docker-compose.yml` file for dev
```yaml
version: '3'
services:
  client:
    image: isdance/docker-compose-client
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - /app/node_modules/
      - .:/app
```
