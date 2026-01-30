/**
 * Claude Code Settings Generator
 *
 * Generates .claude/settings.local.json with proper permissions
 * for Factory pipeline execution, instead of using --dangerously-skip-permissions
 */

const path = require('path');
const fs = require('fs-extra');

/**
 * Platform-specific path patterns for permissions
 */
function getPathPatterns() {
  const platform = process.platform;

  if (platform === 'win32') {
    // Windows paths like d:\, C:\, etc.
    const drive = process.cwd().charAt(0).toLowerCase(); // e.g., 'd'
    return [
      `Read(//${drive}/**)`,
      `Read(//${drive.toUpperCase()}/**)`,
      `Write(//${drive}/**)`,
      `Write(//${drive.toUpperCase()}/**)`,
      `Glob(//${drive}/**)`,
      `Glob(//${drive.toUpperCase()}/**)`
    ];
  } else {
    // Unix paths
    return [
      `Read(${process.cwd()}/**)`,
      `Write(${process.cwd()}/**)`,
      `Glob(${process.cwd()}/**)`
    ];
  }
}

/**
 * Generate permissions whitelist for Factory pipeline
 */
function generatePermissions(projectDir) {
  const platform = process.platform;
  const isWindows = platform === 'win32';

  // Platform-specific path patterns
  let pathPatterns = [];
  if (isWindows) {
    // Extract drive letter from project dir
    const match = projectDir.match(/^([A-Z]):/i);
    if (match) {
      const drive = match[1].toLowerCase();
      pathPatterns = [
        `Read(//${drive}/**)`,
        `Read(//${drive.toUpperCase()}/**)`,
        `Write(//${drive}/**)`,
        `Write(//${drive.toUpperCase()}/**)`,
        `Glob(//${drive}/**)`,
        `Glob(//${drive.toUpperCase()}/**)`
      ];
    }
  } else {
    pathPatterns = [
      `Read(${projectDir}/**)`,
      `Write(${projectDir}/**)`,
      `Glob(${projectDir}/**)`
    ];
  }

  return {
    permissions: {
      allow: [
        // ========== File Operations ==========
        // Read permissions for project files
        ...pathPatterns.filter(p => p.startsWith('Read')),

        // Write permissions for project files
        ...pathPatterns.filter(p => p.startsWith('Write')),

        // Glob permissions for file search
        ...pathPatterns.filter(p => p.startsWith('Glob')),

        // Edit permissions (inline file editing)
        ...pathPatterns.filter(p => p.startsWith('Write')).map(p =>
          p.replace('Write(', 'Edit(').replace(')**', '*,**)')
        ),

        // ========== Git Operations ==========
        'Bash(git add:*)',
        'Bash(git commit:*)',
        'Bash(git status:*)',
        'Bash(git diff:*)',
        'Bash(git log:*)',
        'Bash(git checkout:*)',
        'Bash(git branch:*)',
        'Bash(git remote:*)',
        'Bash(git fetch:*)',
        'Bash(git pull:*)',
        'Bash(git push:*)',
        'Bash(git reset:*)',
        'Bash(git restore:*)',
        'Bash(git rm:*)',
        'Bash(git mv:*)',
        'Bash(git submodule add:*)',
        'Bash(git submodule update:*)',

        // ========== Directory/Listing Operations ==========
        isWindows ? 'Bash(dir:*)' : 'Bash(ls:*)',
        isWindows ? 'Bash(dir /s:*)' : 'Bash(ls -la:*)',
        'Bash(tree:*)',
        'Bash(pwd:*)',
        'Bash(cd:*)',
        'Bash(head:*)',
        'Bash(tail:*)',

        // ========== Generic Bash (allow all bash commands) ==========
        // Note: Bash permission doesn't support patterns or wildcards
        'Bash',

        // ========== Build Tools ==========
        'Bash(npm install:*)',
        'Bash(npm ci:*)',
        'Bash(npm run:*)',
        'Bash(npm test:*)',
        'Bash(npm build:*)',
        'Bash(npm dev:*)',
        'Bash(npx:*)',
        'Bash(yarn install:*)',
        'Bash(yarn add:*)',
        'Bash(yarn build:*)',
        'Bash(pnpm install:*)',
        'Bash(pnpm build:*)',

        // ========== TypeScript ==========
        'Bash(tsc:*)',
        'Bash(npx tsc:*)',
        'Bash(npx type-check:*)',

        // ========== Database (Prisma) ==========
        'Bash(npx prisma validate:*)',
        'Bash(npx prisma generate:*)',
        'Bash(npx prisma migrate dev:*)',
        'Bash(npx prisma migrate reset:*)',
        'Bash(npx prisma db seed:*)',
        'Bash(npx prisma db push:*)',
        'Bash(npx prisma studio:*)',
        'Bash(prisma:*)',

        // ========== Python (for ui-ux-pro-max) ==========
        'Bash(python:*)',
        'Bash(python3:*)',
        'Bash(py:*)',
        'Bash(pip install:*)',
        'Bash(pip3 install:*)',
        'Bash(set PYTHONIOENCODING=utf-8)',

        // ========== File Operations (Bash) ==========
        isWindows ? 'Bash(del:*)' : 'Bash(rm:*)',
        isWindows ? 'Bash(md:*)' : 'Bash(mkdir:*)',
        isWindows ? 'Bash(move:*)' : 'Bash(mv:*)',
        isWindows ? 'Bash(copy:*)' : 'Bash(cp:*)',
        'Bash(mkdir:*)',
        'Bash(touch:*)',
        'Bash(cat:*)',
        'Bash(head:*)',
        'Bash(tail:*)',
        'Bash(echo:*)',
        'Bash(wc:*)',

        // ========== Testing ==========
        'Bash(vitest:*)',
        'Bash(npx vitest:*)',
        'Bash(jest:*)',
        'Bash(npx jest:*)',
        'Bash(test:*)',

        // ========== Factory CLI ==========
        'Bash(factory:*)',
        'Bash(factory init:*)',
        'Bash(factory run:*)',
        'Bash(factory status:*)',
        'Bash(factory continue:*)',
        'Bash(factory reset:*)',
        'Bash(npx factory:*)',
        'Bash(node:*)',

        // ========== Docker ==========
        'Bash(docker compose:*)',
        'Bash(docker-compose:*)',
        'Bash(docker ps:*)',
        'Bash(docker build:*)',
        'Bash(docker run:*)',

        // ========== Web Operations ==========
        'WebFetch(domain:github.com)',
        'WebFetch(domain:api.github.com)',
        'WebFetch(domain:raw.githubusercontent.com)',
        'WebFetch(domain:npmjs.org)',
        'WebFetch(domain:registry.npmjs.org)',
        'WebFetch(domain:www.npmjs.com)',
        // Note: WebSearch doesn't support wildcards, so specific search terms must be requested at runtime

        // ========== Skills (Plugins) ==========
        // Superpowers skills (for brainstorming in bootstrap stage)
        'Skill(superpowers:brainstorming)',
        'Skill(superpowers:dispatching-parallel-agents)',
        'Skill(superpowers:executing-plans)',
        'Skill(superpowers:finishing-a-development-branch)',
        'Skill(superpowers:receiving-code-review)',
        'Skill(superpowers:requesting-code-review)',
        'Skill(superpowers:subagent-driven-development)',
        'Skill(superpowers:systematic-debugging)',
        'Skill(superpowers:test-driven-development)',
        'Skill(superpowers:using-git-worktrees)',
        'Skill(superpowers:using-superpowers)',
        'Skill(superpowers:verification-before-completion)',
        'Skill(superpowers:writing-plans)',
        'Skill(superpowers:writing-skills)',

        // UI/UX Pro Max skills (for design system generation in UI stage)
        'Skill(ui-ux-pro-max)',

        // Allow all other skills for extensibility
        'Skill(*)',

        // ========== Additional Utilities ==========
        'Bash(curl:*)',
        'Bash(wget:*)',
        'Bash(sha256sum:*)',
        'Bash(shasum:*)',
        'Bash(test:*)',
        'Bash(which:*)',
        'Bash(where:*)',
        'Bash(xargs:*)',
        'Bash(find:*)',
        'Bash(grep:*)',
        'Bash(rg:*)',
        isWindows ? 'Bash(type:*)' : 'Bash(less:*)',
        'Bash(more:*)'
      ]
    },
    // Additional settings for Factory
    features: {
      // Enable auto-save for better UX
      autoSave: true,
      // Disable telemetry for privacy
      telemetry: false
    }
  };
}

/**
 * Generate and write .claude/settings.local.json
 * @param {string} projectDir - Project directory path
 * @returns {boolean} - Success status
 */
async function generateClaudeSettings(projectDir) {
  try {
    const claudeDir = path.join(projectDir, '.claude');
    const settingsFile = path.join(claudeDir, 'settings.local.json');

    // Create .claude directory if it doesn't exist
    await fs.ensureDir(claudeDir);

    // Generate settings
    const settings = generatePermissions(projectDir);

    // Write settings file
    await fs.writeJson(settingsFile, settings, { spaces: 2 });

    return true;
  } catch (error) {
    console.error('Failed to generate Claude settings:', error.message);
    return false;
  }
}

/**
 * Check if .claude/settings.local.json exists and is valid
 * @param {string} projectDir - Project directory path
 * @returns {boolean} - Existence status
 */
function claudeSettingsExist(projectDir) {
  const settingsFile = path.join(projectDir, '.claude', 'settings.local.json');
  return fs.existsSync(settingsFile);
}

module.exports = {
  generateClaudeSettings,
  claudeSettingsExist,
  generatePermissions
};
