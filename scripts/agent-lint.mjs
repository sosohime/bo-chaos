#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const requiredFiles = [
  'AGENTS.md',
  'docs/agent/ARCHITECTURE.md',
  'docs/agent/ROUTING.md',
  'docs/agent/COMMANDS.md',
  'docs/agent/QUALITY.md',
  'docs/agent/CONVENTIONS.md',
  'docs/agent/DATA_MODEL.md',
  'docs/agent/FRONTEND_DEBUG.md',
  'docs/agent/WORKFLOW.md',
  'docs/agent/SKILLS.md',
  'docs/agent/DEPLOYMENT.md',
  '.agents/templates/task-record.md',
  '.agents/tasks/active/.gitkeep',
  '.agents/tasks/archive/.gitkeep',
];

const requiredSkills = [
  'bo-chaos-task-routing',
  'bo-chaos-backend',
  'bo-chaos-admin-frontend',
  'bo-chaos-miniapp',
  'bo-chaos-doc-sync',
];

const issues = [];

function rel(file) {
  return path.join(repoRoot, file);
}

function addIssue(level, id, description, what, fix, ref) {
  issues.push({ level, id, description, what, fix, ref });
}

function readLines(file) {
  return readFileSync(rel(file), 'utf8').split(/\r?\n/);
}

function gitChangedFiles() {
  const files = new Set();

  try {
    const output = execFileSync('git', ['diff', '--name-only', 'HEAD', '--'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    for (const file of output.split(/\r?\n/).filter(Boolean)) {
      files.add(file);
    }
  } catch {
    // Fall through to the ls-files check below.
  }

  try {
    const output = execFileSync(
      'git',
      ['ls-files', '--modified', '--others', '--exclude-standard'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    );
    for (const file of output.split(/\r?\n/).filter(Boolean)) {
      files.add(file);
    }
  } catch {
    // Ignore git failures; structural checks still run.
  }

  return [...files].sort();
}

for (const file of requiredFiles) {
  if (!existsSync(rel(file))) {
    addIssue(
      'ERROR',
      'missing-agent-doc',
      `${file} is missing.`,
      'The agent harness depends on a stable L1/L2 documentation map.',
      `Create ${file} or update scripts/agent-lint.mjs if this file was intentionally removed.`,
      'AGENTS.md',
    );
  }
}

if (existsSync(rel('AGENTS.md'))) {
  const lineCount = readLines('AGENTS.md').length;
  if (lineCount > 150) {
    addIssue(
      'ERROR',
      'agents-md-too-long',
      `AGENTS.md has ${lineCount} lines; limit is 150.`,
      'AGENTS.md should be a table of contents, not the full knowledge base.',
      'Move details into docs/agent/* and keep only routing and hard rules in AGENTS.md.',
      'docs/agent/ARCHITECTURE.md',
    );
  }
}

for (const skill of requiredSkills) {
  const file = `.agents/skills/${skill}/SKILL.md`;
  if (!existsSync(rel(file))) {
    addIssue(
      'ERROR',
      'missing-repo-skill',
      `${file} is missing.`,
      'The repo-local harness needs task-specific skills so agents do not rely on generic playbooks.',
      `Create ${file} with name/description frontmatter and a concise workflow.`,
      'docs/agent/SKILLS.md',
    );
  }
}

const changed = gitChangedFiles();
const changedSet = new Set(changed);
const docsChanged = changed.filter((file) => file.startsWith('docs/agent/'));

function changedAny(prefix) {
  return changed.some((file) => file.startsWith(prefix));
}

function changedExact(file) {
  return changedSet.has(file);
}

function warnDocSync(id, description, source, requiredDoc) {
  if (changedAny(source) && !changedExact(requiredDoc)) {
    addIssue(
      'WARNING',
      id,
      description,
      `Files under ${source} changed without ${requiredDoc} changing in the same diff.`,
      `Review whether ${requiredDoc} needs an update. If not, mention why in the final response.`,
      requiredDoc,
    );
  }
}

warnDocSync(
  'backend-doc-sync',
  'Backend source changed without backend agent docs changing.',
  'apps/backend-nest/src/',
  'docs/agent/ARCHITECTURE.md',
);

warnDocSync(
  'admin-doc-sync',
  'Admin frontend source changed without frontend debug docs changing.',
  'apps/front-next-admin/src/',
  'docs/agent/FRONTEND_DEBUG.md',
);

warnDocSync(
  'miniapp-doc-sync',
  'Mini app source changed without miniapp conventions changing.',
  'apps/miniapp-taro/src/',
  'docs/agent/CONVENTIONS.md',
);

if (
  changedExact('packages/prisma-client/prisma/schema.prisma') &&
  !changedExact('docs/agent/DATA_MODEL.md')
) {
  addIssue(
    'WARNING',
    'data-model-doc-sync',
    'Prisma schema changed without DATA_MODEL.md changing.',
    'Agents use DATA_MODEL.md to avoid rereading the full schema and to preserve API contracts.',
    'Update docs/agent/DATA_MODEL.md with model, relation, status, or migration-relevant changes.',
    'docs/agent/DATA_MODEL.md',
  );
}

if (
  (changedExact('package.json') ||
    changed.some((file) => file.endsWith('/package.json')) ||
    changedExact('pnpm-workspace.yaml') ||
    changedExact('nx.json')) &&
  !changedExact('docs/agent/COMMANDS.md')
) {
  addIssue(
    'WARNING',
    'commands-doc-sync',
    'Command/config files changed without COMMANDS.md changing.',
    'Agents rely on COMMANDS.md for exact verification commands.',
    'Update docs/agent/COMMANDS.md or mention why command docs are unaffected.',
    'docs/agent/COMMANDS.md',
  );
}

if (docsChanged.length > 0 && !changedExact('AGENTS.md')) {
  addIssue(
    'WARNING',
    'agents-toc-check',
    'Agent docs changed without AGENTS.md changing.',
    'AGENTS.md is the L1 table of contents for the L2 docs.',
    'Confirm AGENTS.md still links to any new or renamed docs.',
    'AGENTS.md',
  );
}

for (const issue of issues) {
  console.log(`LINT ${issue.level} [${issue.id}]: ${issue.description}`);
  console.log(`  WHAT: ${issue.what}`);
  console.log(`  FIX:  ${issue.fix}`);
  console.log(`  REF:  ${issue.ref}`);
  console.log('');
}

const errorCount = issues.filter((issue) => issue.level === 'ERROR').length;
const warningCount = issues.filter((issue) => issue.level === 'WARNING').length;

if (errorCount === 0 && warningCount === 0) {
  console.log('agent-lint: ok');
}

if (errorCount > 0 || (warningCount > 0 && process.env.AGENT_LINT_STRICT === '1')) {
  process.exit(1);
}
