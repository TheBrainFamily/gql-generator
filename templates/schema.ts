import { buildFederatedSchema } from "@apollo/federation";
import { resolvers } from "@generated/graphql/resolvers";
import typeDefs from "@generated/graphql/combineSchemas";

const schema = buildFederatedSchema([
  {
    typeDefs,
    resolvers,
  },
]);

export { schema };
