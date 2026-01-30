/**
 * factory init command
 *
 * Initialize the current directory as a Factory project.
 * Copies all necessary factory files (agents, skills, templates, policies, pipeline.yaml)
 * into the .factory/ directory, making the project self-contained.
 *
 * After initialization, attempts to launch Claude Code or OpenCode automatically.
 */

const path = require('path');
const fs = require('fs-extra');
const { spawn, execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const yaml = require('yaml');
const { generateClaudeSettings } = require('../utils/claude-settings');

/**
 * Check if directory is already a Factory project
 */
function isFactoryProject(dir) {
  const factoryDir = path.join(dir, '.factory');
  const configFile = path.join(factoryDir, 'config.yaml');
  return fs.existsSync(factoryDir) && fs.existsSync(configFile);
}

/**
 * Check if directory is empty enough to initialize
 * (allows .git, README.md, etc.)
 */
function isDirectorySafeToInit(dir) {
  const files = fs.readdirSync(dir).filter(f => {
    const name = f.toLowerCase();
    // Allow git, editor configs, and docs
    if (name === '.git' || name === '.gitignore' ||
        name === 'readme.md' || name.startsWith('.vscode') ||
        name.startsWith('.idea')) {
      return false;
    }
    return true;
  });

  // Check for existing factory directory that would conflict
  const hasFactory = fs.existsSync(path.join(dir, '.factory'));
  const hasArtifacts = fs.existsSync(path.join(dir, 'artifacts'));

  if (hasFactory || hasArtifacts) {
    return false;
  }

  return files.length === 0;
}

/**
 * Generate project config
 */
function generateConfig(name, description) {
  return {
    project: {
      name: name || path.basename(process.cwd()),
      description: description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    pipeline: {
      current_stage: null,
      completed_stages: [],
      last_checkpoint: null
    },
    settings: {
      auto_save: true,
      backup_on_error: true
    }
  };
}

/**
 * Copy directory if it exists
 */
async function copyDirectoryIfExists(source, target, spinner, label) {
  if (fs.existsSync(source)) {
    spinner.text = `Copying ${label}...`;
    await fs.copy(source, target);
    return true;
  }
  return false;
}

/**
 * Copy file if it exists
 */
async function copyFileIfExists(source, target, spinner, label) {
  if (fs.existsSync(source)) {
    spinner.text = `Copying ${label}...`;
    await fs.copy(source, target);
    return true;
  }
  return false;
}

/**
 * Check if a command is available
 */
function commandExists(cmd) {
  try {
    execSync(`${process.platform === 'win32' ? 'where' : 'which'} ${cmd}`, {
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Try to launch Claude Code with prompt
 */
async function launchClaudeCode(projectDir) {
  const prompt = '请阅读.factory/pipeline.yaml和.factory/agents/orchestrator.checkpoint.md，启动流水线，帮我将产品想法碎片转化为可运行的应用，接下来我将会输入想法碎片。注意：Agent引用的skills/和policies/文件需要先查找.factory/目录，再查找根目录。';

  // Check if claude command exists
  if (!commandExists('claude')) {
    return false;
  }

  try {
    console.log('');
    console.log(chalk.cyan('Starting Claude Code...'));

    // Run claude with prompt as argument
    // Note: .claude/settings.local.json has been generated with proper permissions
    spawn('claude', [prompt], {
      cwd: projectDir,
      stdio: 'inherit',
      shell: true,
      detached: true
    }).unref();

    console.log(chalk.green('✓ Claude Code is starting...'));
    console.log(chalk.gray('  (Please wait for the window to open)'));
    console.log('');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Try to launch OpenCode with prompt
 */
async function launchOpenCode(projectDir) {
  const prompt = '请阅读.factory/pipeline.yaml和.factory/agents/orchestrator.checkpoint.md，启动流水线，帮我将产品想法碎片转化为可运行的应用，接下来我将会输入想法碎片。注意：Agent引用的skills/和policies/文件需要先查找.factory/目录，再查找根目录。';

  // Try opencode command in PATH first (with prompt)
  if (commandExists('opencode')) {
    try {
      console.log('');
      console.log(chalk.cyan('Starting OpenCode...'));
      spawn('opencode', [prompt], {
        cwd: projectDir,
        stdio: 'inherit',
        shell: true,
        detached: true
      }).unref();

      console.log(chalk.green('✓ OpenCode is starting...'));
      console.log(chalk.gray('  (Please wait for the window to open)'));
      console.log('');
      return true;
    } catch (e) {
      // Fall through to try launching without prompt
    }
  }

  // Fallback: try to find OpenCode executable and open project
  // Only include Windows paths on Windows (LOCALAPPDATA/USERPROFILE are undefined on macOS/Linux)
  const openCodePaths = [];
  if (process.platform === 'win32') {
    if (process.env.LOCALAPPDATA) {
      openCodePaths.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'OpenCode', 'OpenCode.exe'));
    }
    if (process.env.USERPROFILE) {
      openCodePaths.push(path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Programs', 'OpenCode', 'OpenCode.exe'));
    }
  } else if (process.platform === 'darwin') {
    openCodePaths.push('/Applications/OpenCode.app/Contents/MacOS/OpenCode');
  } else {
    openCodePaths.push('/usr/bin/opencode', '/usr/local/bin/opencode');
  }

  for (const exePath of openCodePaths) {
    if (fs.existsSync(exePath)) {
      try {
        console.log('');
        console.log(chalk.cyan('Starting OpenCode...'));
        spawn(exePath, [projectDir], {
          cwd: projectDir,
          detached: true,
          stdio: 'ignore'
        }).unref();

        console.log(chalk.green('✓ OpenCode is starting...'));
        console.log(chalk.gray('  (Please wait for the window to open)'));
        console.log('');
        console.log(chalk.bold('Copy this prompt into OpenCode:'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.white(prompt));
        console.log(chalk.gray('─'.repeat(60)));
        console.log('');
        return true;
      } catch (e) {
        continue;
      }
    }
  }

  return false;
}

/**
 * Main init function
 */
module.exports = async function(factoryRoot, projectDir, options) {
  const projectName = options.name;
  const projectDesc = options.description;

  console.log('');
  console.log(chalk.bold.cyan('Agent Factory') + ' - Project Initialization');
  console.log('');

  // Check if already a Factory project
  if (isFactoryProject(projectDir)) {
    const configPath = path.join(projectDir, '.factory', 'config.yaml');
    const config = yaml.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(chalk.yellow('This directory is already a Factory project:'));
    console.log(chalk.gray(`  Name: ${config.project.name}`));
    console.log(chalk.gray(`  Created: ${config.project.created_at}`));
    console.log('');
    console.log('To reset the project, use: ' + chalk.cyan('factory reset'));
    return;
  }

  // Check directory safety
  if (!isDirectorySafeToInit(projectDir)) {
    console.log(chalk.red('Cannot initialize: directory is not empty.'));
    console.log(chalk.gray('Factory init requires an empty directory or one with only git/config files.'));
    console.log('');
    console.log('Conflicting items found:');
    const files = fs.readdirSync(projectDir);
    const conflicts = files.filter(f => {
      const lower = f.toLowerCase();
      return !['.git', '.gitignore', 'readme.md'].includes(lower) &&
             !f.startsWith('.vscode') && !f.startsWith('.idea');
    });
    conflicts.forEach(f => console.log(chalk.gray(`  - ${f}`)));
    return;
  }

  // Start initialization
  const spinner = ora('Initializing Factory project...').start();

  try {
    const factoryDir = path.join(projectDir, '.factory');

    // 1. Create .factory directory
    spinner.text = 'Creating .factory directory...';
    await fs.ensureDir(factoryDir);

    // 2. Copy factory files from global installation
    const copiedDirs = [];
    const copiedFiles = [];

    // Copy agents/
    if (await copyDirectoryIfExists(
      path.join(factoryRoot, 'agents'),
      path.join(factoryDir, 'agents'),
      spinner,
      'agents'
    )) {
      copiedDirs.push('agents/');
    }

    // Copy skills/
    if (await copyDirectoryIfExists(
      path.join(factoryRoot, 'skills'),
      path.join(factoryDir, 'skills'),
      spinner,
      'skills'
    )) {
      copiedDirs.push('skills/');
    }

    // Copy templates/
    if (await copyDirectoryIfExists(
      path.join(factoryRoot, 'templates'),
      path.join(factoryDir, 'templates'),
      spinner,
      'templates'
    )) {
      copiedDirs.push('templates/');
    }

    // Copy policies/
    if (await copyDirectoryIfExists(
      path.join(factoryRoot, 'policies'),
      path.join(factoryDir, 'policies'),
      spinner,
      'policies'
    )) {
      copiedDirs.push('policies/');
    }

    // Copy pipeline.yaml
    if (await copyFileIfExists(
      path.join(factoryRoot, 'pipeline.yaml'),
      path.join(factoryDir, 'pipeline.yaml'),
      spinner,
      'pipeline.yaml'
    )) {
      copiedFiles.push('pipeline.yaml');
    }

    // 3. Create config.yaml
    spinner.text = 'Creating project configuration...';
    const config = generateConfig(projectName, projectDesc);
    fs.writeFileSync(
      path.join(factoryDir, 'config.yaml'),
      yaml.stringify(config),
      'utf8'
    );

    // 4. Create initial state.json
    const state = {
      version: 1,
      status: 'idle',
      current_stage: null,
      completed_stages: [],
      started_at: null,
      last_updated: new Date().toISOString()
    };
    fs.writeFileSync(
      path.join(factoryDir, 'state.json'),
      JSON.stringify(state, null, 2),
      'utf8'
    );

    // 5. Generate .claude/settings.local.json for proper permissions
    spinner.text = 'Generating Claude Code permissions...';
    await generateClaudeSettings(projectDir);

    spinner.succeed('Factory project initialized!');

    // 6. Install required Claude plugins
    console.log('');
    const pluginSpinner = ora('Checking and installing required Claude plugins...').start();

    try {
      // Check if claude command is available
      if (!commandExists('claude')) {
        pluginSpinner.warn('Claude CLI not found - skipping plugin installation');
        console.log(chalk.yellow('  Install Claude Code to enable plugins: https://claude.ai/code'));
      } else {
        // Install superpowers plugin (for bootstrap stage)
        pluginSpinner.text = 'Installing superpowers plugin...';
        const superpowersScript = path.join(factoryRoot, 'cli', 'scripts', 'check-and-install-superpowers.js');
        if (fs.existsSync(superpowersScript)) {
          try {
            execSync(`node "${superpowersScript}"`, {
              cwd: projectDir,
              stdio: 'pipe'
            });
            pluginSpinner.text = 'Installing superpowers plugin... ✓';
          } catch (e) {
            pluginSpinner.text = 'Installing superpowers plugin... (failed)';
            console.log(chalk.yellow('  Note: superpowers plugin installation failed'));
            console.log(chalk.gray('  The bootstrap stage may prompt you to install it manually'));
          }
        }

        // Install ui-ux-pro-max-skill plugin (for ui stage)
        pluginSpinner.text = 'Installing ui-ux-pro-max-skill plugin...';
        const uiSkillScript = path.join(factoryRoot, 'cli', 'scripts', 'check-and-install-ui-skill.js');
        if (fs.existsSync(uiSkillScript)) {
          try {
            execSync(`node "${uiSkillScript}"`, {
              cwd: projectDir,
              stdio: 'pipe'
            });
            pluginSpinner.text = 'Installing ui-ux-pro-max-skill plugin... ✓';
          } catch (e) {
            pluginSpinner.text = 'Installing ui-ux-pro-max-skill plugin... (failed)';
            console.log(chalk.yellow('  Note: ui-ux-pro-max-skill plugin installation failed'));
            console.log(chalk.gray('  The ui stage may prompt you to install it manually'));
          }
        }

        pluginSpinner.succeed('Plugins installed!');
      }
    } catch (error) {
      pluginSpinner.warn('Plugin installation skipped');
      console.log(chalk.gray('  You can install plugins manually later'));
    }

    // Print success message
    console.log('');
    console.log(chalk.green('Project structure created:'));
    console.log(chalk.gray('  .factory/'));
    if (copiedDirs.length) {
      copiedDirs.forEach(d => console.log(chalk.gray(`    ${d}`)));
    }
    if (copiedFiles.length) {
      copiedFiles.forEach(f => console.log(chalk.gray(`    ${f}`)));
    }
    console.log(chalk.gray('    config.yaml'));
    console.log(chalk.gray('    state.json'));
    console.log('');

    // Try to launch AI assistant
    let launched = false;

    // First, try Claude Code
    if (commandExists('claude')) {
      launched = await launchClaudeCode(projectDir);
    }

    // Fallback to OpenCode
    if (!launched) {
      launched = await launchOpenCode(projectDir);
    }

    // If neither worked, show manual instructions
    if (!launched) {
      const prompt = '请阅读.factory/pipeline.yaml和.factory/agents/orchestrator.checkpoint.md，启动流水线，帮我将产品想法碎片转化为可运行的应用，接下来我将会输入想法碎片。注意：Agent引用的skills/和policies/文件需要先查找.factory/目录，再查找根目录。';
      console.log(chalk.yellow('Could not find Claude Code or OpenCode installation.'));
      console.log('');
      console.log(chalk.bold('Please install one of the following AI assistants:'));
      console.log('');
      console.log(chalk.cyan('1. Claude Code (Recommended)'));
      console.log(chalk.gray('   Install: https://claude.ai/code'));
      console.log('');
      console.log(chalk.cyan('2. OpenCode'));
      console.log(chalk.gray('   Download: https://opencode.sh'));
      console.log('');
      console.log(chalk.bold('After installation, run:'));
      console.log(chalk.cyan('  claude ' + prompt));
      console.log('');
    }

  } catch (error) {
    spinner.fail('Initialization failed');
    console.error(chalk.red('Error:'), error.message);

    // Cleanup on failure
    const factoryDir = path.join(projectDir, '.factory');
    if (fs.existsSync(factoryDir)) {
      await fs.remove(factoryDir);
    }
  }
};
