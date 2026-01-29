#!/usr/bin/env node

/**
 * Agent Factory CLI
 *
 * A global CLI tool for initializing and running AI-powered app generation.
 *
 * Usage:
 *   factory init              - Initialize current directory as a Factory project
 *   factory run [stage]       - Run the pipeline from current or specified stage
 *   factory list              - List all Factory projects
 *   factory status            - Show current project status
 *   factory reset             - Reset current project state
 *   factory continue           - Open new Claude Code session to continue pipeline
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');

// Get the root directory of agent-factory (where this CLI is installed)
function getFactoryRoot() {
  // When installed globally, __dirname will be in the global node_modules
  // When linked locally, we need to find the project root
  const cliDir = __dirname;

  // In development (npm link), the structure is:
  // project-root/
  //   cli/
  //     bin/
  //       factory.js  (__dirname is here)
  //   agents/
  //   skills/
  // So we need to go up 2 levels from cli/bin/
  const devRoot = path.resolve(cliDir, '..', '..');
  if (fs.existsSync(path.join(devRoot, 'agents')) &&
      fs.existsSync(path.join(devRoot, 'skills'))) {
    return devRoot;
  }

  // Check one level up (in case cli/ is at root)
  const oneLevelUp = path.resolve(cliDir, '..');
  if (fs.existsSync(path.join(oneLevelUp, 'agents')) &&
      fs.existsSync(path.join(oneLevelUp, 'skills'))) {
    return oneLevelUp;
  }

  // Production mode - return the directory containing cli/
  // When installed globally, the structure might be different
  // Try to find agents/ relative to the install location
  return path.resolve(cliDir);
}

// Import commands
const initCmd = require('../commands/init');
const runCmd = require('../commands/run');
const listCmd = require('../commands/list');
const statusCmd = require('../commands/status');
const resetCmd = require('../commands/reset');
const continueCmd = require('../commands/continue');

// Version
const packageJson = require('../package.json');
program.version(packageJson.version);

// Make factoryRoot available to all commands
const factoryRoot = getFactoryRoot();
program._factoryRoot = factoryRoot;

// Init command
program
  .command('init')
  .description('Initialize current directory as a Factory project')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --description <desc>', 'Project description')
  .action((options) => initCmd(factoryRoot, process.cwd(), options));

// Run command
program
  .command('run [stage]')
  .description('Run the pipeline from current or specified stage')
  .option('-f, --force', 'Skip confirmation prompts')
  .action((stage, options) => runCmd(factoryRoot, process.cwd(), stage, options));

// List command
program
  .command('list')
  .description('List all Factory projects')
  .action(() => listCmd(factoryRoot));

// Status command
program
  .command('status')
  .description('Show current project status')
  .action(() => statusCmd(process.cwd()));

// Reset command
program
  .command('reset')
  .description('Reset current project state (keeps artifacts, resets pipeline)')
  .option('-f, --force', 'Skip confirmation')
  .action((options) => resetCmd(process.cwd(), options));

// Continue command
program
  .command('continue')
  .description('Open new Claude Code session to continue pipeline')
  .action(() => continueCmd(process.cwd()));

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
