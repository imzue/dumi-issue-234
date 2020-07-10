# dumi-issue-234

dumi [issue: 234](https://github.com/umijs/dumi/issues/234) 复现

## Getting Started

1. Install dependencies,

```bash
$ npm i
```

2. Start the dev server,

```bash
$ npm start
```

Result:

```
ERROR [dumi]: cannot resolve module dumi-issue-234/lib/Foo from /workspace/dumi-issue-234/src/Foo/index.md
ERROR  Failed to compile with 1 errors
error  in ./src/Foo/index.md
Module build failed (from ./node_modules/@umijs/preset-dumi/lib/loader/index.js):
Error: Can't resolve 'dumi-issue-234/lib/Foo' in 'D:\Files\Workspace\github.com\dumi-issue-234\src\Foo'
  etc...
```

3. 尝试简单修复

```bash
$ node ./script/fix.js
```

Result: success
