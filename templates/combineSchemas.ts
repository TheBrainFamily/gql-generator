import {  loadTypedefsSync } from "@graphql-tools/load";
import {
  GraphQLFileLoader,
  GraphQLFileLoaderOptions,
} from "@graphql-tools/graphql-file-loader";
import { mergeTypeDefs } from "@graphql-tools/merge";

import shelljs from "shelljs";

const graphqlPaths = shelljs.ls(
  `${__dirname}/../../src/modules/*/graphql/*.graphql`
);

const mainSchema = `${__dirname}/../../src/graphql/schema.graphql`;
const allSchemas = graphqlPaths
  .concat(mainSchema)
  .concat(`${__dirname}/genericDataModelSchema.graphql`)
  .concat(`${__dirname}/frameworkSchema.graphql`);

class ExtendedGraphQLFileLoader extends GraphQLFileLoader {
  handleFileContent(
    rawSDL: string,
    pointer: string,
    options: GraphQLFileLoaderOptions
  ) {
    if (pointer.indexOf("schema.graphql") > -1) {
      const newSdl = rawSDL
        .replace("type Query", "")
        .replace("type Mutation", "");
      return super.handleFileContent(newSdl, pointer, options);
    }
    const newSdl = rawSDL
      .replace("extend type Query", "type Query")
      .replace("extend type Mutation", "type Mutation");
    // .replace(/extend type/g, "type");
    return super.handleFileContent(newSdl, pointer, options);
  }
}

const schema = mergeTypeDefs(
  loadTypedefsSync(allSchemas, {
    loaders: [new ExtendedGraphQLFileLoader()],
    assumeValidSDL: true, // this will bypass validation
  }).map((s) => s.document)
);

export default schema;
