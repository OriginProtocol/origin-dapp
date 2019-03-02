/*
 * Implementation of the Origin Growth GraphQL server.
 * Uses the Apollo framework: https://www.apollographql.com/server
 */
require('dotenv').config()

const { getUserAuthenticationStatus } = require('../resources/authentication')

try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const { ApolloServer } = require('apollo-server-express')
const cors = require('cors')
const express = require('express')
const promBundle = require('express-prom-bundle')

const enums = require('../enums')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const app = express()
app.use(cors())

const bundle = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})
app.use(bundle)

// Start ApolloServer by passing type definitions and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  resolvers,
  typeDefs,
  // Always enable GraphQL playground and schema introspection, regardless of NODE_ENV value.
  introspection: true,
  playground: true,
  context: async context => {
    let countryCode = null
    const headers = context.req.headers
    /* TODO: this needs to be tested on production that google rightly sets X-AppEngine-Country
     */
    if (headers) {
      countryCode = headers['X-AppEngine-Country'] || null
    }

    let authStatus = enums.GrowthParticipantAuthenticationStatus.NotEnrolled
    if (headers.authorization) {
      try {
        const authToken = JSON.parse(headers.authorization).growth_auth_token
        authStatus = await getUserAuthenticationStatus(authToken)
      } catch(e) {
        console.error('Error authenticating user: ', e)
      }
    }

    return {
      ...context,
      countryCode,
      authentication: authStatus
    }
  }
})

server.applyMiddleware({ app })

const port = process.env.PORT || 4001

app.listen({ port: port }, () =>
  console.log(
    `Apollo server ready at http://localhost:${port}${server.graphqlPath}`
  )
)
