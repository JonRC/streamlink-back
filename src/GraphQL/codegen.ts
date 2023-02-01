import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'src/GraphQL/**/*.graphql',
  generates: {
    'src/GraphQL/generated.ts': {
      config: {
        useIndexSignature: true
      },
      plugins: ['typescript', 'typescript-resolvers']
    }
  }
}

export default config
