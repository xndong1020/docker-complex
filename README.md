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