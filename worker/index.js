const keys = require('./keys')
const redis = require('redis')

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})

// we make a duplication because once redisClient is being used as pub/sub, it can't be used as anything else
const sub = redisClient.duplicate()

// worker module will be responsible for actually calculating
// Fibonacci number
// function for calculating Fibonacci number
const fib = index => {
  if (index < 2) return 1
  return fib(index - 1) + fib(index - 2)
}

sub.on('message', (channel, message) => {
  redisClient.set('values', fib(parseInt(message)))
})

// subscribe to 'insert' event
sub.subscribe('insert')
