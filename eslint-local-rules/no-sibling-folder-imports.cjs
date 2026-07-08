'use strict';

const path = require('path');
const fs = require('fs');

const ALIAS_PREFIX = '@/';

// One-directional layering for top-level src/* directories: a directory may only
// import from a strictly lower-ranked layer (e.g. `views` may import from `utils`,
// but `utils` may never import from `views`). Directories not listed here (e.g. a
// root-level file like `constants.ts`, or the test-only `testing/` mocks) are
// exempt — see the special-casing in `isAllowed` below.
const LAYER_RANK = {
  types: 0,
  themes: 0,
  data: 1,
  utils: 2,
  context: 3,
  components: 4,
  views: 5,
};

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

// A directory with no subdirectories of its own — used to distinguish a shared "leaf" folder
// (e.g. `categoryLegend/`) from a folder with further-nested internals that shouldn't be reached
// into directly (e.g. `skillsListView/`, which nests `skillItemsList/`).
function isLeafDir(dir) {
  try {
    return !fs.readdirSync(dir, { withFileTypes: true }).some((entry) => entry.isDirectory());
  } catch {
    return false;
  }
}

function isAllowed(currentDir, importDir, srcRoot) {
  const sep = path.sep;
  const curr = currentDir.endsWith(sep) ? currentDir : currentDir + sep;
  const imp = importDir.endsWith(sep) ? importDir : importDir + sep;

  // Same directory, import is inside own subtree, or import is a proper ancestor
  if (curr === imp || imp.startsWith(curr) || curr.startsWith(imp)) return true;

  // Shared leaf folder deliberately nested directly under a common ancestor (see code-style.md's
  // "lift to a common ancestor" bullet) — e.g. `views/skills/categoryLegend/` imported by cousin
  // sub-views nested under `views/skills/skillsViews/`. Two conditions keep this from also
  // permitting genuinely bad cousin imports:
  //  - `importDir`'s parent must be an ancestor of `currentDir` *above* currentDir's own immediate
  //    parent — true siblings (folders sharing their immediate parent, e.g. `skillsGraphView` and
  //    `skillsListView`) stay disallowed.
  //  - `importDir` itself must be a leaf (no subfolders of its own) — reaching directly into a
  //    cousin's nested internals (e.g. `skillsListView/skillItemsList`) stays disallowed, since
  //    `skillItemsList`'s ancestor `skillsListView` isn't a leaf.
  const importParent = path.dirname(importDir) + sep;
  const currParent = path.dirname(currentDir) + sep;
  if (importParent !== currParent && curr.startsWith(importParent) && isLeafDir(importDir)) {
    return true;
  }

  if (srcRoot === null) return false;

  const currRel = path.relative(srcRoot, currentDir);
  const impRel = path.relative(srcRoot, importDir);
  if (currRel.startsWith('..') || impRel.startsWith('..')) return false;

  const currTop = currRel.split(sep)[0];
  const impTop = impRel.split(sep)[0];

  // Utils are allowed to depend on other utils.
  if (currTop === 'utils' && impTop === 'utils') return true;

  // Root-level files (e.g. constants.ts resolve to '' here) and the test-only
  // `testing/` mocks sit outside the layering graph: anything may reach them, and
  // `testing` itself may reach into lower layers to build typed mocks.
  if (currTop === '' || impTop === '' || currTop === 'testing' || impTop === 'testing') {
    return true;
  }

  const currRank = LAYER_RANK[currTop];
  const impRank = LAYER_RANK[impTop];

  // Unrecognized top-level directories aren't part of the layering graph yet —
  // don't falsely flag them until LAYER_RANK is updated to account for them.
  if (currRank === undefined || impRank === undefined) return true;

  // A directory may only import from a strictly lower layer (e.g. `views` (5) may
  // import from `utils` (2), but `utils` may not import from `views`).
  return currRank > impRank;
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
