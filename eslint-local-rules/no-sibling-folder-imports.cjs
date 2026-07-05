'use strict';

const path = require('path');
const fs = require('fs');

function resolveImportDir(fromDir, importSource) {
  const resolved = path.resolve(fromDir, importSource);
  try {
    if (fs.statSync(resolved).isDirectory()) return resolved;
  } catch {
    // resolved path is a file (possibly without extension) — use its dirname
  }
  return path.dirname(resolved);
}

function isAllowed(currentDir, importDir) {
  const sep = path.sep;
  const curr = currentDir.endsWith(sep) ? currentDir : currentDir + sep;
  const imp = importDir.endsWith(sep) ? importDir : importDir + sep;
  // Same directory, import is inside own subtree, or import is a proper ancestor
  return curr === imp || imp.startsWith(curr) || curr.startsWith(imp);
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
        if (typeof source !== 'string' || !source.startsWith('.')) return;

        const currentFile = context.getFilename();
        if (currentFile === '<input>') return;

        const currentDir = path.dirname(path.resolve(currentFile));
        const importDir = resolveImportDir(currentDir, source);

        if (!isAllowed(currentDir, importDir)) {
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
