/**
 * factory reset command
 *
 * Reset the pipeline state while keeping artifacts.
 * Useful for re-running the pipeline from the beginning.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const yaml = require('yaml');
const inquirer = require('inquirer');

/**
 * Confirm reset with user
 */
async function confirmReset() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Reset pipeline state? (Artifacts will be kept)',
      default: false
    }
  ]);
  return answers.confirm;
}

/**
 * Main reset function
 */
module.exports = async function(projectDir, options) {
  console.log('');
  console.log(chalk.bold.cyan('Agent Factory') + ' - Reset Pipeline');
  console.log('');

  // Check if this is a Factory project
  const factoryDir = path.join(projectDir, '.factory');
  const configFile = path.join(factoryDir, 'config.yaml');
  const stateFile = path.join(factoryDir, 'state.json');

  if (!fs.existsSync(factoryDir) || !fs.existsSync(configFile)) {
    console.log(chalk.yellow('Not a Factory project.'));
    console.log(chalk.gray('Run ' + chalk.cyan('factory init') + ' first to initialize this directory.'));
    console.log('');
    return;
  }

  // Read current state
  let state = { status: 'unknown', completed_stages: [] };
  if (fs.existsSync(stateFile)) {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  }

  // Show current state
  console.log(chalk.gray('Current state:'));
  console.log(chalk.gray('  Status: ') + chalk.white(state.status));
  if (state.completed_stages && state.completed_stages.length > 0) {
    console.log(chalk.gray('  Completed: ') + chalk.white(state.completed_stages.join(', ')));
  }
  console.log('');

  // Confirm unless --force
  if (!options.force) {
    const confirmed = await confirmReset();
    if (!confirmed) {
      console.log(chalk.gray('Reset cancelled.'));
      console.log('');
      return;
    }
  }

  // Create new state
  const newState = {
    version: 1,
    status: 'idle',
    current_stage: null,
    completed_stages: [],
    started_at: null,
    last_updated: new Date().toISOString()
  };

  // Write new state
  fs.writeFileSync(stateFile, JSON.stringify(newState, null, 2), 'utf8');

  // Update config pipeline section
  const config = yaml.parse(fs.readFileSync(configFile, 'utf8'));
  config.pipeline = {
    current_stage: null,
    completed_stages: [],
    last_checkpoint: null
  };
  fs.writeFileSync(configFile, yaml.stringify(config), 'utf8');

  console.log(chalk.green('✓ Pipeline state reset.'));
  console.log('');
  console.log(chalk.gray('Run ' + chalk.cyan('factory run') + ' to start from the beginning.'));
  console.log('');
};
