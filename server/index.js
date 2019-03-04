const keys = require('./keys')
const cors = require('cors')
// express app setup
const express = require('express')
const app = express()
const util = require('util')

// This is a built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser
app.use(express.json())
// This is a built-in middleware function in Express. It parses incoming requests with urlencoded payloads and is based on body-parser.
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// Postgres Client Setup
const { Pool } = require('pg')
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})
pgClient.on('connect', () => {
  console.log('PG connected')
})

pgClient.on('error', () => {
  console.log('lost PG connection')
})

// redis client setup
const redis = require('redis')
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})

redisClient.on('connect', () => {
  console.log('redis connected')
})
redisClient.on('error', err => {
  console.log('lost redis connection')
})

// we make a duplication because once redisClient is being used as pub/sub, it can't be used as anything else
const redisPublisher = redisClient.duplicate()

// for initialization, we create a table named 'values', with 1 column, number
pgClient
  .query('CREATE TABLE IF NOT EXISTS values(number INT)')
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('work')
})

app.get('/values', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values')
  res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
  const hgetall = util.promisify(redisClient.hgetall)
  try {
    const values = await hgetall('values')
    res.send(values)
  } catch (e) {
    console.error(e)
  }
})

app.post('/values', async (req, res) => {
  const { index } = req.body
  if (parseInt(index) > 40) return res.status(422).send('Index too high!')
  redisClient.hset('values', index, 'Nothing yet')
  // send the index value to 'insert' channel
  redisPublisher.publish('insert', index)
  await pgClient.query('INSERT INTO values(number) VALUES($1)', [index])
  res.send({ working: true })
})

app.listen('5000', () => {
  console.log('server is listening on port: 5000')
})
