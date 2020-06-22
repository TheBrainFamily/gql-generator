#!/usr/bin/env node
const finder = require('find-package-json');
const shelljs = require('shelljs');
const { Source, buildSchema } = require('graphql');
const fs = require('fs');

const getModuleInfos = require('./parsegraphql/getModuleInfos');
const getModuleNames = require('./parsegraphql/getModuleNames');
const checkIfGitStateClean = require('./helpers/checkIfGitStateClean');
const saveRenderedTemplate = require('./helpers/saveRenderedTemplate');
checkIfGitStateClean();

const f = finder(process.cwd());
const projectMainPath = f
  .next()
  .filename.split('/')
  .filter((c) => c.indexOf('package.json') == -1)
  .join('/');

const graphqlPaths = shelljs.ls(`${projectMainPath}/src/modules/*/graphql/*.graphql`).map((p) => ({ name: p }));

const moduleNames = getModuleNames(graphqlPaths);
const modules = getModuleInfos(moduleNames);

modules.forEach((module) => {
  const moduleName = module.name;
  const createModuleResolvers = () => {
    const templateName = './templates/moduleResolvers.handlebars';
    const context = { ...module, moduleName: module.name };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/`;
    const fileName = `${moduleName}Resolvers.ts`;
    saveRenderedTemplate(templateName, context, filePath, fileName);
  };

  createModuleResolvers();

  const createQuery = (queryName, hasArguments) => {
    const templateName = './templates/query.handlebars';
    const context = { queryName, moduleName, hasArguments };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/queries/`;
    const fileName = `${queryName}Query.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  const createQuerySpec = (queryName) => {
    const templateName = './templates/query.spec.handlebars';
    const context = { queryName, moduleName };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/queries/`;
    const fileName = `${queryName}Query.spec.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  const createUseCase = (name, hasArguments, variables) => {
    const templateName = './templates/useCase.handlebars';
    const context = { name, moduleName, hasArguments, variables };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/useCases/`;
    const fileName = `${name}.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const createUseCaseSpec = (name, hasArguments, variables) => {
    const templateName = './templates/useCase.spec.handlebars';
    const context = { name, moduleName, hasArguments, variables, capitalizedName: capitalize(name) };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/useCases/`;
    const fileName = `${name}.spec.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  if (module.queries && module.queries.length) {
    shelljs.mkdir('-p', `${projectMainPath}/src/modules/${moduleName}/graphql/queries`);
    module.queries.forEach(({ name, hasArguments, variables }) => {
      createQuery(name, hasArguments);
      createUseCase(`query${name}`, hasArguments, variables);
      createUseCaseSpec(`query${name}`, hasArguments, variables);
      // createQuerySpec(name);
    });
  }

  const createMutation = (mutationName, hasArguments) => {
    const templateName = './templates/mutation.handlebars';
    const context = { mutationName, moduleName, hasArguments };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/mutations/`;
    const fileName = `${mutationName}Mutation.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  const createMutationSpec = (mutationName) => {
    const templateName = './templates/mutation.spec.handlebars';
    const context = { mutationName, moduleName };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/mutations/`;
    const fileName = `${mutationName}Mutation.spec.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  if (module.mutations && module.mutations.length) {
    shelljs.mkdir('-p', `${projectMainPath}/src/modules/${moduleName}/graphql/mutations`);
    module.mutations.forEach(({ name, hasArguments, variables }) => {
      createMutation(name, hasArguments);
      createUseCase(`mutation${name}`, hasArguments, variables);
      createUseCaseSpec(`mutation${name}`, hasArguments, variables);
      // createMutationSpec(name);
    });
  }
});

const createGlobalResolvers = () => {
  const templateName = './templates/resolvers.handlebars';
  const context = { modules };
  const filePath = `${projectMainPath}/src/graphql/`;
  const fileName = `resolvers.ts`;
  saveRenderedTemplate(templateName, context, filePath, fileName);
};

createGlobalResolvers();

const createTypes = () => {
  const templateName = './templates/types.handlebars';
  const context = { modules };
  const filePath = `${projectMainPath}/src/`;
  const fileName = `types.ts`;
  saveRenderedTemplate(templateName, context, filePath, fileName);
};

createTypes();

const createStartupConfig = () => {
  const templateName = './templates/startupConfig.handlebars';
  const context = { modules };
  const filePath = `${projectMainPath}/src/`;
  const fileName = `startupConfig.ts`;
  saveRenderedTemplate(templateName, context, filePath, fileName);
};

createStartupConfig();

const createIModuleNameContexts = () => {
  modules.forEach(({ name }) => {
    const templateName = './templates/IModuleNameContext.handlebars';
    const context = { moduleName: name };
    const filePath = `${projectMainPath}/src/modules/${name}/`;
    const fileName = `I${name}Context.ts`;
    const keepIfExists = true;

    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  });
};

createIModuleNameContexts();

const createGetModuleNameContexts = () => {
  modules.forEach(({ name }) => {
    const templateName = './templates/getModuleNameContext.handlebars';
    const context = { moduleName: name };
    const filePath = `${projectMainPath}/src/modules/${name}/`;
    const fileName = `get${name}Context.ts`;
    const keepIfExists = true;

    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  });
};

createGetModuleNameContexts();
// typeResolvers.handlebars

const createTypeResolvers = () => {
  modules.forEach(({ name, typeDefinitions, types, schemaString }) => {
    if (types) {
      // XXX TODO read this from the CLI
      const typeDef = fs.readFileSync('./schema.graphql');

      const source = new Source(typeDef);
      let schema = buildSchema(source);
      // const schema = importSchema(schemaPath, {}, { out: "GraphQLSchema" });
      const typeMap = schema.getTypeMap();

      shelljs.mkdir('-p', `${projectMainPath}/src/modules/${name}/graphql/types/`);
      const templateName = './templates/typeResolvers.handlebars';
      const context = { type: typeDefinitions };
      const filePath = `${projectMainPath}/src/modules/${name}/graphql/types/`;
      const fileName = `typeResolvers.ts`;
      const keepIfExists = false;

      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
      typeDefinitions.forEach((typeDef) => {
        let filtered = [];
        const type = schema.getType(typeDef.name);
        if (type.astNode) {
          filtered = type.astNode.fields.filter(
            (f) =>
              !f.directives.find(
                (d) =>
                  d.name.value === 'column' ||
                  d.name.value === 'id' ||
                  d.name.value === 'embedded' ||
                  d.name.value === 'link'
              )
          );
        }

        if (filtered.length) {
          shelljs.mkdir('-p', `${projectMainPath}/src/modules/${name}/graphql/types/${typeDef.name}`);
        }
        filtered.forEach(({name: {value}}) => {

          const templateName = './templates/typeTypeResolvers.handlebars';
          const context = { typeName: typeDef.name, fieldName: value, moduleName: name };
          const filePath = `${projectMainPath}/src/modules/${name}/graphql/types/${typeDef.name}`;
          const fileName = `${value}TypeResolvers.ts`;
          const keepIfExists = true;

          saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
        })
      });
    }
  });
};

createTypeResolvers();
