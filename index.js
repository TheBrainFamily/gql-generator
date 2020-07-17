#!/usr/bin/env node
// const path = require('path');
// const program = require('commander');
//
// program
//   .option('--postinstall [value]', 'path of your graphql schema file')
//   .option('--destDirPath [value]', 'dir you want to store the generated queries')
//   .option('--depthLimit [value]', 'query depth you want to limit(The default is 100)')
//   .option('--typesPath [value]', 'path to your generated typescript file with GraphQL Types')
//   .parse(process.argv);
//
// console.log();
// const { schemaFilePath, destDirPath, typesPath, depthLimit = 100 } = program;
//
// const pathToDestDir = `${process.cwd()}${destDirPath}`;
// const pathToTypes = `${process.cwd()}${typesPath}`;
// const typesRelativePathWithExtension = path.relative(pathToDestDir, pathToTypes);
// const typesRelativePath = typesRelativePathWithExtension.replace(path.extname(typesRelativePathWithExtension), '');


require('./generateModule');
