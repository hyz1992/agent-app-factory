/**
 * factory status command
 *
 * Show detailed status of the current Factory project.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const yaml = require('yaml');

/**
 * Check if directory has artifacts
 */
function checkArtifacts(projectDir) {
  const artifactsDir = path.join(projectDir, 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    return [];
  }

  const artifacts = [];
  const stages = ['prd', 'ui', 'tech', 'backend', 'client', 'validation', 'preview'];

  for (const stage of stages) {
    const stagePath = path.join(artifactsDir, stage);
    if (fs.existsSync(stagePath)) {
      const files = fs.readdirSync(stagePath);
      artifacts.push({ stage, fileCount: files.length });
    }
  }

  return artifacts;
}

/**
 * Check for input idea
 */
function checkInput(projectDir) {
  const ideaFile = path.join(projectDir, 'input', 'idea.md');
  if (!fs.existsSync(ideaFile)) {
    return { exists: false };
  }

  const content = fs.readFileSync(ideaFile, 'utf8');
  const lines = content.split('\n');
  const preview = lines.slice(0, 5).join('\n').substring(0, 200);

  return {
    exists: true,
    lineCount: lines.length,
    preview: preview + (content.length > 200 ? '...' : '')
  };
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Get directory size
 */
function getDirSize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  let total = 0;
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      total += getDirSize(itemPath);
    } else {
      total += stat.size;
    }
  }

  return total;
}

/**
 * Main status function
 */
module.exports = async function(projectDir) {
  console.log('');
  console.log(chalk.bold.cyan('Agent Factory') + ' - Project Status');
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

  // Read config and state
  const config = yaml.parse(fs.readFileSync(configFile, 'utf8'));
  let state = { status: 'unknown' };

  if (fs.existsSync(stateFile)) {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  }

  // Display project info
  console.log(chalk.bold('Project:'));
  console.log(chalk.gray('  Name: ') + chalk.white(config.project?.name || path.basename(projectDir)));
  if (config.project?.description) {
    console.log(chalk.gray('  Description: ') + chalk.white(config.project.description));
  }
  console.log(chalk.gray('  Path: ') + chalk.cyan(projectDir));
  console.log(chalk.gray('  Created: ') + chalk.white(config.project?.created_at || 'Unknown'));
  console.log('');

  // Display pipeline status
  console.log(chalk.bold('Pipeline:'));
  const statusColors = {
    idle: chalk.gray,
    running: chalk.cyan,
    waiting_for_confirmation: chalk.yellow,
    paused: chalk.yellow,
    failed: chalk.red,
    completed: chalk.green
  };
  const statusColor = statusColors[state.status] || chalk.white;
  const statusLabel = {
    idle: 'Not Started',
    running: 'Running',
    waiting_for_confirmation: 'Waiting for Confirmation',
    paused: 'Paused',
    failed: 'Failed',
    completed: 'Completed'
  };
  console.log(chalk.gray('  Status: ') + statusColor(statusLabel[state.status] || state.status));

  if (state.current_stage) {
    console.log(chalk.gray('  Current Stage: ') + chalk.cyan(state.current_stage));
  }

  if (state.completed_stages && state.completed_stages.length > 0) {
    console.log(chalk.gray('  Completed: ') + chalk.green(state.completed_stages.join(', ')));
  }
  console.log('');

  // Display stages progress
  const allStages = ['bootstrap', 'prd', 'ui', 'tech', 'code', 'validation', 'preview'];
  console.log(chalk.bold('Progress:'));
  for (const stage of allStages) {
    const isCompleted = state.completed_stages?.includes(stage);
    const isCurrent = state.current_stage === stage;
    const icon = isCompleted ? chalk.green('✓') : (isCurrent ? chalk.cyan('→') : chalk.gray('○'));
    const label = isCompleted ? chalk.green(stage) : (isCurrent ? chalk.cyan.bold(stage) : chalk.gray(stage));
    console.log(chalk.gray('  ') + icon + ' ' + label);
  }
  console.log('');

  // Display input status
  console.log(chalk.bold('Input:'));
  const input = checkInput(projectDir);
  if (input.exists) {
    console.log(chalk.gray('  File: ') + chalk.white('input/idea.md'));
    console.log(chalk.gray('  Lines: ') + chalk.white(input.lineCount));
    if (input.preview) {
      console.log(chalk.gray('  Preview:'));
      console.log(chalk.gray('    ') + input.preview.split('\n').join('\n    '));
    }
  } else {
    console.log(chalk.gray('  No input file found.'));
  }
  console.log('');

  // Display artifacts
  console.log(chalk.bold('Artifacts:'));
  const artifacts = checkArtifacts(projectDir);
  if (artifacts.length > 0) {
    for (const artifact of artifacts) {
      const size = getDirSize(path.join(projectDir, 'artifacts', artifact.stage));
      console.log(chalk.gray('  ') + chalk.green('✓') + ' ' + artifact.stage + chalk.gray(` (${artifact.fileCount} files, ${formatSize(size)})`));
    }
  } else {
    console.log(chalk.gray('  No artifacts generated yet.'));
  }
  console.log('');

  // Display links
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray('Commands:'));
  console.log(chalk.gray('  ') + chalk.cyan('factory run') + chalk.gray('     - Run pipeline'));
  console.log(chalk.gray('  ') + chalk.cyan('factory run <stage>') + chalk.gray(' - Run from stage'));
  console.log(chalk.gray('  ') + chalk.cyan('factory reset') + chalk.gray('  - Reset pipeline state'));
  console.log('');
};
