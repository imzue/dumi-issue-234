'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = exports.PLAIN_TEXT_EXT = exports.LOCAL_MODULE_EXT = exports.LOCAL_DEP_EXT = void 0;

function _react() {
  const data = _interopRequireDefault(require('react'));

  _react = function _react() {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require('path'));

  _path = function _path() {
    return data;
  };

  return data;
}

function _slash() {
  const data = _interopRequireDefault(require('slash'));

  _slash = function _slash() {
    return data;
  };

  return data;
}

function babel() {
  const data = _interopRequireWildcard(require('@babel/core'));

  babel = function babel() {
    return data;
  };

  return data;
}

function types() {
  const data = _interopRequireWildcard(require('@babel/types'));

  types = function types() {
    return data;
  };

  return data;
}

function _traverse() {
  const data = _interopRequireDefault(require('@babel/traverse'));

  _traverse = function _traverse() {
    return data;
  };

  return data;
}

var _moduleResolver = require('../../utils/moduleResolver');

var _watcher = require('../../utils/watcher');

var _options = require('./options');

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const LOCAL_DEP_EXT = ['.jsx', '.tsx', '.js', '.ts'];
exports.LOCAL_DEP_EXT = LOCAL_DEP_EXT;
const LOCAL_MODULE_EXT = [...LOCAL_DEP_EXT, '.json']; // local dependency extensions which will be collected

exports.LOCAL_MODULE_EXT = LOCAL_MODULE_EXT;
const PLAIN_TEXT_EXT = [
  ...LOCAL_MODULE_EXT,
  '.less',
  '.css',
  '.scss',
  '.sass',
  '.styl',
];
exports.PLAIN_TEXT_EXT = PLAIN_TEXT_EXT;

function analyzeDeps(raw, { isTSX, fileAbsPath, entryAbsPath }, totalFiles) {
  // support to pass babel transform result directly
  const ast =
    typeof raw === 'string'
      ? babel().transformSync(
          raw,
          (0, _options.getBabelOptions)({
            isTSX,
            fileAbsPath,
            transformRuntime: false,
          }),
        ).ast
      : raw;
  const files = totalFiles || {};
  const dependencies = {}; // traverse all expression

  (0, _traverse().default)(ast, {
    CallExpression(callPath) {
      const callPathNode = callPath.node; // tranverse all require statement

      if (
        types().isIdentifier(callPathNode.callee) &&
        callPathNode.callee.name === 'require' &&
        types().isStringLiteral(callPathNode.arguments[0]) &&
        callPathNode.arguments[0].value !== 'react'
      ) {
        const requireStr = callPathNode.arguments[0].value;
        /**
         * [START]
         * 在此处加判断，则不会报错
         */
        if (requireStr.includes('dumi-issue-234')) return;
        /**
         * [END]
         */
        const resolvePath = (0, _moduleResolver.getModuleResolvePath)({
          basePath: fileAbsPath,
          sourcePath: requireStr,
          extensions: LOCAL_MODULE_EXT,
        });

        const resolvePathParsed = _path().default.parse(resolvePath);

        if (resolvePath.includes('node_modules')) {
          // save external deps
          const pkg = (0, _moduleResolver.getModuleResolvePkg)({
            basePath: fileAbsPath,
            sourcePath: requireStr,
            extensions: LOCAL_MODULE_EXT,
          });
          dependencies[pkg.name] = pkg.version;
        } else if (
          // only analysis for valid local file type
          PLAIN_TEXT_EXT.includes(resolvePathParsed.ext) && // do not collect entry file
          resolvePath !== entryAbsPath && // to avoid collect alias module
          requireStr.startsWith('.')
        ) {
          // save local deps
          const fileName = (0, _slash().default)(
            _path().default.relative(fileAbsPath, resolvePath),
          ).replace(/(\.\/|\..\/)/g, ''); // to avoid circular-reference

          if (fileName && !files[fileName]) {
            files[fileName] = {
              path: requireStr,
              content: (0, _moduleResolver.getModuleResolveContent)({
                basePath: fileAbsPath,
                sourcePath: requireStr,
                extensions: LOCAL_MODULE_EXT,
              }),
            }; // continue to collect deps for dep

            if (LOCAL_DEP_EXT.includes(resolvePathParsed.ext)) {
              const result = analyzeDeps(
                files[fileName].content,
                {
                  isTSX: /\.tsx?/.test(resolvePathParsed.ext),
                  fileAbsPath: resolvePath,
                  entryAbsPath: entryAbsPath || fileAbsPath,
                },
                files,
              );
              Object.assign(files, result.files);
              Object.assign(dependencies, result.dependencies);
            } // trigger parent file change to update frontmatter when dep file change

            (0, _watcher.saveFileOnDepChange)(fileAbsPath, resolvePath);
          }
        }
      }
    },
  });
  return {
    files,
    dependencies,
  };
}

var _default = analyzeDeps;
exports.default = _default;
