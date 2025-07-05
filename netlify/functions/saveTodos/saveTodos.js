const couchbase = require('couchbase')

const ENDPOINT = process.env.COUCHBASE_ENDPOINT
const USERNAME = process.env.COUCHBASE_USERNAME
const PASSWORD = process.env.COUCHBASE_PASSWORD
const BUCKET = process.env.COUCHBASE_BUCKET

const couchbaseClientPromise = couchbase.connect('couchbases://' + ENDPOINT, {
  username: USERNAME,
  password: PASSWORD,
  timeouts: {
    kvTimeout: 10000, // milliseconds
  },
})

const handler = async (event) => {
  // only allow PUT requests
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
    }
  }

  try {

    const cluster = await couchbaseClientPromise
    const bucket = cluster.bucket(BUCKET)
    const scope = bucket.scope(BUCKET)
    const collection = scope.collection(BUCKET)

    const result = await collection.upsert('todos', event.body)

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
