#!/usr/bin/env node

/**
 * Claude Superpowers 插件检查和安装脚本
 * 跨平台支持: Windows, macOS, Linux
 *
 * 使用方式：
 *   - node scripts/check-and-install-superpowers.js
 *   - npm run install:superpowers
 */

const { execSync } = require('child_process');

const PLUGIN_NAME = 'superpowers';
const PLUGIN_SCOPE = 'superpowers-marketplace';
const PLUGIN_ID = `${PLUGIN_NAME}@${PLUGIN_SCOPE}`;
const PLUGIN_MARKETPLACE = 'obra/superpowers-marketplace';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(icon, message, color = 'reset') {
  console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
}

function error(message) {
  log('❌', message, 'red');
}

function success(message) {
  log('✅', message, 'green');
}

function warning(message) {
  log('⚠️ ', message, 'yellow');
}

function info(message) {
  log('ℹ️ ', message, 'blue');
}

/**
 * 执行命令并返回输出
 */
function executeCommand(command, silent = false) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    return output.trim();
  } catch (err) {
    if (!silent) {
      error(`命令执行失败: ${command}`);
    }
    return null;
  }
}

/**
 * 检查插件是否已安装
 */
function isPluginInstalled() {
  info('检查 superpowers 插件...');

  const output = executeCommand('claude plugin list', true);
  if (!output) {
    return false;
  }

  return output.includes(PLUGIN_ID) || output.includes(PLUGIN_NAME);
}

/**
 * 添加插件到市场
 */
function addToMarketplace() {
  info(`从 Claude 插件市场添加 ${PLUGIN_MARKETPLACE}...`);

  const result = executeCommand(
    `claude plugin marketplace add ${PLUGIN_MARKETPLACE}`,
    true
  );

  if (result) {
    success('插件已添加到市场');
    return true;
  } else {
    warning('添加插件失败，可能已在市场中 (继续尝试安装)');
    return true;
  }
}

/**
 * 安装插件
 */
function installPlugin() {
  info(`安装 ${PLUGIN_ID}...`);

  const result = executeCommand(
    `claude plugin install ${PLUGIN_ID}`,
    false
  );

  if (result !== null) {
    success('插件安装成功');
    return true;
  } else {
    error('插件安装失败');
    return false;
  }
}

/**
 * 验证插件已安装
 */
function verifyPlugin() {
  info('验证插件安装...');

  const output = executeCommand('claude plugin list', true);
  if (!output) {
    error('无法验证插件（插件列表查询失败）');
    return false;
  }

  const isInstalled = output.includes(PLUGIN_ID) || output.includes(PLUGIN_NAME);
  const isEnabled = output.includes('enabled') && (output.includes(PLUGIN_ID) || output.includes(PLUGIN_NAME));

  if (isInstalled) {
    if (isEnabled) {
      success('插件验证成功，已启用');
    } else {
      warning('插件已安装但未启用，尝试重新安装...');
      return installPlugin();
    }
    return true;
  } else {
    error('插件验证失败，未找到已安装的插件');
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('');
  info('Claude Superpowers 插件管理器');
  console.log('');

  try {
    // 检查 claude 命令是否可用
    try {
      executeCommand('claude --version', true);
    } catch (err) {
      error('找不到 claude 命令，请确保已安装 Claude CLI');
      process.exit(1);
    }

    // 检查插件是否已安装
    if (isPluginInstalled()) {
      success('superpowers 插件已安装');
      console.log('');
      return;
    }

    // 开始安装流程
    console.log('');
    warning('superpowers 插件未安装，正在自动安装...');
    console.log('');

    // 添加到市场
    addToMarketplace();
    console.log('');

    // 安装插件
    if (!installPlugin()) {
      process.exit(1);
    }
    console.log('');

    // 验证安装
    if (verifyPlugin()) {
      console.log('');
      success('插件安装和验证完成！');
      console.log('');
      info('你可以开始使用 Superpowers Brainstorm 技能了');
      process.exit(0);
    } else {
      console.log('');
      error('插件验证失败');
      process.exit(1);
    }
  } catch (err) {
    console.log('');
    error(`发生错误: ${err.message}`);
    process.exit(1);
  }
}

main();
