/**
 * factory continue command
 *
 * Opens a new Claude Code window with the continuation prompt.
 * This allows users to continue the pipeline in a fresh session to save tokens.
 */

const path = require('path');
const fs = require('fs-extra');
const { spawn, execSync } = require('child_process');
const chalk = require('chalk');
const yaml = require('yaml');
const { generateClaudeSettings, claudeSettingsExist } = require('../utils/claude-settings');

/**
 * Check if command is available
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
 * Try to launch Claude Code with continuation prompt
 */
async function launchClaudeCode(projectDir, nextStage, completedStages) {
  const stagesList = completedStages.length > 0
    ? `已完成阶段: ${completedStages.join(', ')}`
    : '开始新流水线';

  const originPrompt = `请继续执行流水线。${stagesList}。
注意：
1. 必须先读取对应的 .agent.md 文件
2. 严格按照文件中的步骤执行，特别是自动检测和安装插件的步骤
3. Agent 引用的 skills/ 和 policies/ 文件需要先查找 .factory/ 目录，再查找根目录`;

  //TODO 去掉prompt的换行符和空格，避免命令行问题
  const prompt = originPrompt.split(/\s+/).join('').trim();

  // Always regenerate Claude settings to ensure latest permissions
  await generateClaudeSettings(projectDir);

  if (!commandExists('claude')) {
    return false;
  }

  try {
    console.log('');
    console.log(chalk.cyan('Starting new Claude Code session...'));

    // Note: .claude/settings.local.json provides proper permissions
    spawn('claude', [prompt], {
      cwd: projectDir,
      stdio: 'inherit',
      shell: true,
      detached: true
    }).unref();

    console.log(chalk.green('✓ 新 Claude Code 窗口已启动'));
    console.log(chalk.gray('  (Please wait for the window to open)'));
    console.log('');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Main continue function
 */
module.exports = async function(projectDir) {
  console.log('');
  console.log(chalk.bold.cyan('Agent Factory') + ' - Continue in New Session');
  console.log('');

  // Check if this is a Factory project
  const factoryDir = path.join(projectDir, '.factory');
  const stateFile = path.join(factoryDir, 'state.json');
  const configFile = path.join(factoryDir, 'config.yaml');
  const pipelineFile = path.join(factoryDir, 'pipeline.yaml');

  if (!fs.existsSync(factoryDir) || !fs.existsSync(stateFile)) {
    console.log(chalk.yellow('Not a Factory project or no pipeline in progress.'));
    console.log(chalk.gray('Run ' + chalk.cyan('factory init') + ' first to initialize a project.'));
    console.log('');
    return;
  }

  // Read state
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  const config = yaml.parse(fs.readFileSync(configFile, 'utf8'));

  // Display current status
  console.log(chalk.bold('Pipeline Status:'));
  console.log(chalk.gray('─'.repeat(40)));
  if (config.project) {
    console.log(chalk.gray('Project: ') + chalk.white(config.project.name));
  }

  const statusColors = {
    idle: chalk.gray,
    running: chalk.cyan,
    waiting_for_confirmation: chalk.yellow,
    paused: chalk.yellow,
    failed: chalk.red,
    completed: chalk.green
  };

  const statusLabels = {
    idle: 'Not Started',
    running: 'Running',
    waiting_for_confirmation: 'Waiting',
    paused: 'Paused',
    failed: 'Failed',
    completed: 'Completed'
  };

  const displayStatus = statusLabels[state.status] || state.status;
  console.log(chalk.gray('Status: ') + (statusColors[state.status] || chalk.white)(displayStatus));

  if (state.current_stage) {
    console.log(chalk.gray('Current Stage: ') + chalk.cyan(state.current_stage));
  }

  if (state.completed_stages && state.completed_stages.length > 0) {
    console.log(chalk.gray('Completed: ') + chalk.green(state.completed_stages.join(', ')));
  }

  console.log('');

  // Try to launch Claude Code
  const launched = await launchClaudeCode(projectDir, state.current_stage, state.completed_stages || []);

  if (!launched) {
    console.log(chalk.yellow('Could not find Claude Code installation.'));
    console.log('');
    console.log(chalk.bold('Install Claude Code from:'));
    console.log(chalk.cyan('  https://claude.ai/code'));
    console.log('');
    console.log(chalk.bold('After installation, run:'));
    console.log(chalk.cyan('  claude 请继续执行流水线'));
    console.log('');
  }
};
