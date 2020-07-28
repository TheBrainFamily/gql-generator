#!/usr/bin/env node
const fs = require("fs");

const program = require('commander');
const shelljs = require('shelljs');

program
  .option('--create <name>', 'Create a new app - pass a name')
  .option('--codeGen', 'Generate code')
  .parse(process.argv);

const { create, codeGen } = program;

const scaffoldDir = `${process.cwd()}/${create}`;

if (create) {
  if (fs.existsSync(scaffoldDir)) {
    console.log(`Path: ${scaffoldDir} already exists. Can't create a new app in an already existing path.`)
    process.exit(1)
  }
  shelljs.cp('-R', `${__dirname}/scaffold`, `${scaffoldDir}`)
  shelljs.exec(`cd ${create} && git init .`)
  console.log(`\n${create} created successfully!`)
  console.log(`run:
   cd ${create}
   npm install`)
   console.log('and start hacking! :-)')
  process.exit(1)
}


if (codeGen) {
  require("./generateModule")
}
