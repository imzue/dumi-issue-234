const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../script/dependencies.js');
const replace = path.resolve(
  __dirname,
  '../node_modules/@umijs/preset-dumi/lib/transformer/demo/dependencies.js',
);

console.log('source', source);
console.log('replace', replace);

fs.writeFileSync(replace, fs.readFileSync(source));
