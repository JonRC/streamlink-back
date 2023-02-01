import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { loadFiles } from '@graphql-tools/load-files'
import { mergeResolvers } from '@graphql-tools/merge'

import * as Express from './Express'

export const init = async () => {
  const schema = await loadFiles('src/GraphQL/**/*.graphql')

  const queryResolvers = await loadFiles('src/GraphQL/Query/**/*.ts', {
    extractExports: queryResolver => {
      if (queryResolver.default) return false
      return { Query: queryResolver }
    }
  })

  const mutationResolvers = await loadFiles('src/GraphQL/Mutation/**/*.ts', {
    extractExports: mutationResolver => {
      if (mutationResolver.default) return false
      return { Mutation: mutationResolver }
    }
  })

  const resolvers = mergeResolvers([...queryResolvers, ...mutationResolvers])

  const apolloServer = new ApolloServer({
    typeDefs: schema,
    resolvers
  })

  await apolloServer.start()
  Express.app.use(expressMiddleware(apolloServer))
}
