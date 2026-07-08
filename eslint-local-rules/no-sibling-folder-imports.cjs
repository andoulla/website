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

// KNOWN GAP (as of the Skills radar chart work, 2026-07-08): this function only allows a true
// ancestor/descendant relationship (below) or a strictly-lower top-level layer (LAYER_RANK below).
// It has no notion of "a shared leaf folder deliberately placed under a common ancestor within the
// same top-level directory" — e.g. `src/views/skills/categoryLegend/` is meant to be importable by
// both `src/views/skills/skillsViews/skillsGraphView/skillsBarChart/` and
// `src/views/skills/skillsViews/skillsRadarView/skillsRadarChart/`, but neither of those is an
// ancestor of `categoryLegend/` (they're cousins under `views/skills/`), so this currently reports
// a warning for that legitimate case. `code-style.md` already documents this as the intended
// pattern (see its "lift to a common ancestor" bullet) — the rule just doesn't enforce it yet.
//
// To fix: add a case that allows `importDir` when its *parent* directory is an ancestor of
// `currentDir` (i.e. `importDir`'s parent equals some directory on the path from `srcRoot` down to
// `currentDir`) — this covers "shared folder nested directly under a common ancestor". Do NOT just
// allow any import whose target's parent is an ancestor of the importer without further
// restriction: that would also permit genuinely bad cousin imports, e.g.
// `skillsGraphView` reaching directly into `skillsListView`'s internals, because
// `skillsListView`'s parent (`skillsViews/`) is also an ancestor of `skillsGraphView`. The two
// cases need to be told apart — e.g. by only allowing it when `importDir` is a *leaf* (no further
// nested view/chart subfolders of its own) — before loosening this.
function isAllowed(currentDir, importDir, srcRoot) {
  const sep = path.sep;
  const curr = currentDir.endsWith(sep) ? currentDir : currentDir + sep;
  const imp = importDir.endsWith(sep) ? importDir : importDir + sep;

  // Same directory, import is inside own subtree, or import is a proper ancestor
  if (curr === imp || imp.startsWith(curr) || curr.startsWith(imp)) return true;

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
