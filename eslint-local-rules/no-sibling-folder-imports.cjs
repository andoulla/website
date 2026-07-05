'use strict';

const path = require('path');
const fs = require('fs');

const ALIAS_PREFIX = '@/';

function resolveImportDir(fromDir, importSource, srcRoot) {
  const resolved =
    importSource.startsWith(ALIAS_PREFIX) && srcRoot !== null
      ? path.resolve(srcRoot, importSource.slice(ALIAS_PREFIX.length))
      : path.resolve(fromDir, importSource);
  try {
    if (fs.statSync(resolved).isDirectory()) return resolved;
  } catch {
    // resolved path is a file (possibly without extension) — use its dirname
  }
  return path.dirname(resolved);
}

function findSrcRoot(dir) {
  let current = dir;
  while (true) {
    if (path.basename(current) === 'src') return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function isAllowed(currentDir, importDir, srcRoot) {
  const sep = path.sep;
  const curr = currentDir.endsWith(sep) ? currentDir : currentDir + sep;
  const imp = importDir.endsWith(sep) ? importDir : importDir + sep;

  // Same directory, import is inside own subtree, or import is a proper ancestor
  if (curr === imp || imp.startsWith(curr) || curr.startsWith(imp)) return true;

  // Crossing between two different top-level src/* directories (e.g. utils -> types,
  // views -> components) is the codebase's intended layering. Only a common ancestor
  // deeper than src/ itself (a true sibling-folder reach) stays disallowed.
  if (srcRoot === null) return false;

  const currRel = path.relative(srcRoot, currentDir);
  const impRel = path.relative(srcRoot, importDir);
  if (currRel.startsWith('..') || impRel.startsWith('..')) return false;

  return currRel.split(sep)[0] !== impRel.split(sep)[0];
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow imports from sibling or cousin folders; move shared code to a common ancestor instead.',
    },
    messages: {
      noSiblingFolder:
        'Import from "{{source}}" crosses into a sibling folder. Move the shared code to a common ancestor instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') return;
        if (!source.startsWith('.') && !source.startsWith(ALIAS_PREFIX)) return;

        const currentFile = context.getFilename();
        if (currentFile === '<input>') return;

        const currentDir = path.dirname(path.resolve(currentFile));
        const srcRoot = findSrcRoot(currentDir);
        const importDir = resolveImportDir(currentDir, source, srcRoot);

        if (!isAllowed(currentDir, importDir, srcRoot)) {
          context.report({
            node,
            messageId: 'noSiblingFolder',
            data: { source },
          });
        }
      },
    };
  },
};
