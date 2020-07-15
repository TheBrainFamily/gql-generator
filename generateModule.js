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

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

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

  const createQuery = (queryName, hasArguments) => {
    const templateName = './templates/query.handlebars';
    const context = { queryName, moduleName, hasArguments };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/queries/`;
    const fileName = `${queryName}Query.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  const createQuerySpec = (queryName, hasArguments) => {
    const templateName = './templates/query.spec.handlebars';
    const context = { queryName, moduleName, hasArguments };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/queries/`;
    const fileName = `${queryName}Query.spec.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  if (module.queries && module.queries.length) {
    shelljs.mkdir('-p', `${projectMainPath}/src/modules/${moduleName}/graphql/queries`);
    module.queries.forEach(({ name, hasArguments, variables }) => {
      createQuery(name, hasArguments);
      createQuerySpec(name, hasArguments);
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

  const createMutationSpec = (mutationName, hasArguments) => {
    const templateName = './templates/mutation.spec.handlebars';
    const context = { mutationName, moduleName, hasArguments };
    const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/mutations/`;
    const fileName = `${mutationName}Mutation.spec.ts`;
    const keepIfExists = true;
    saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
  };

  if (module.mutations && module.mutations.length) {
    shelljs.mkdir('-p', `${projectMainPath}/src/modules/${moduleName}/graphql/mutations`);
    module.mutations.forEach(({ name, hasArguments, variables }) => {
      createMutation(name, hasArguments);
      createMutationSpec(name, hasArguments);
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


const createRoot = () => {
  const templateName = './templates/root.handlebars';
  const filePath = `${projectMainPath}/src/`;
  const fileName = `root.ts`;
  const keepIfExists = true;

  saveRenderedTemplate(templateName, {}, filePath, fileName, keepIfExists);
};

createRoot();

const createContext = () => {
  const templateName = './templates/context.handlebars';
  const filePath = `${projectMainPath}/src/`;
  const fileName = `context.ts`;
  const keepIfExists = true;

  saveRenderedTemplate(templateName, {}, filePath, fileName, keepIfExists);
};

createContext();

const createTypeResolvers = () => {
  modules.forEach(({ name, typeDefinitions, types, schemaString, queries, mutations }) => {
    let typeResolvers = [];
    if (types) {
      schemaString = schemaString.replace(/extend type/g, `type`)
      let source = new Source(schemaString);
      let schema = buildSchema(source);
      shelljs.mkdir('-p', `${projectMainPath}/src/modules/${name}/graphql/types/`);
      typeDefinitions.forEach((typeDef) => {
        let filtered = [];
        let type = schema.getType(typeDef.name);
        if (!type) {
          const newSchemaString = schemaString.replace(`extend type ${typeDef.name}`, `type ${typeDef.name}`)
          let source = new Source(newSchemaString);
          let schema = buildSchema(source);
          type = schema.getType(typeDef.name);
        }
        if (type.astNode) {
          filtered = type.astNode.fields.filter(
            (f) =>
              !f.directives.find(
                (d) =>
                  d.name.value === 'column' ||
                  d.name.value === 'id' ||
                  d.name.value === 'embedded' ||
                  d.name.value === 'external'
              )
          );
        }


        filtered.forEach(({ name: { value } }) => {
          const templateName = './templates/typeTypeResolvers.handlebars';
          let capitalizedFieldName = capitalize(value);
          const context = {
            typeName: typeDef.name,
            fieldName: value,
            moduleName: name,
            capitalizedFieldName,
          };
          const filePath = `${projectMainPath}/src/modules/${name}/graphql/types/`;
          const fileName = `${typeDef.name}${capitalizedFieldName}.ts`;
          const keepIfExists = true;

          saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
        });

        filtered.forEach(({ name: { value }, arguments }) => {
          const templateName = './templates/typeTypeResolvers.spec.handlebars';
          let capitalizedFieldName = capitalize(value);
          const context = {
            typeName: typeDef.name,
            fieldName: value,
            moduleName: name,
            hasArguments: arguments && arguments.length,
            capitalizedFieldName,
          };
          const filePath = `${projectMainPath}/src/modules/${name}/graphql/types/`;
          const fileName = `${typeDef.name}${capitalizedFieldName}.spec.ts`;
          const keepIfExists = true;

          saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
        });

        if (filtered.length) {
          typeResolvers.push({
            typeName: typeDef.name,
            fieldName: filtered.map(({ name: { value } }) => ({ name: value, capitalizedName: capitalize(value) })),
          });
        }
      });
    }
    const moduleName = name;
    const createModuleResolvers = () => {
      const templateName = './templates/moduleResolvers.handlebars';
      const context = { moduleName, queries, mutations, typeResolvers };
      const filePath = `${projectMainPath}/src/modules/${moduleName}/graphql/`;
      const fileName = `${moduleName}Resolvers.ts`;
      saveRenderedTemplate(templateName, context, filePath, fileName);
    };

    createModuleResolvers();
  });
};

createTypeResolvers();
