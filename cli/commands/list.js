/**
 * factory list command
 *
 * List all Factory projects found in common locations.
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const chalk = require('chalk');
const yaml = require('yaml');

/**
 * Find all Factory projects
 */
function findFactoryProjects() {
  const projects = [];

  // Common project directories
  const searchPaths = [
    path.join(os.homedir(), 'Projects'),
    path.join(os.homedir(), 'Desktop'),
    path.join(os.homedir(), 'Documents'),
    os.homedir(),
  ];

  // Also search current directory and up to 3 levels up
  let currentDir = process.cwd();
  for (let i = 0; i < 4; i++) {
    searchPaths.push(currentDir);
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }

  // Filter to unique, existing paths
  const uniquePaths = [...new Set(searchPaths)].filter(p => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  // Search for .factory directories
  for (const searchPath of uniquePaths) {
    try {
      const items = fs.readdirSync(searchPath, { withFileTypes: true });

      for (const item of items) {
        if (item.isDirectory()) {
          const itemPath = path.join(searchPath, item.name);
          const factoryDir = path.join(itemPath, '.factory');

          // Check if it's a Factory project
          const configFile = path.join(factoryDir, 'config.yaml');
          if (fs.existsSync(factoryDir) && fs.existsSync(configFile)) {
            try {
              const config = yaml.parse(fs.readFileSync(configFile, 'utf8'));
              const stateFile = path.join(factoryDir, 'state.json');
              let state = { status: 'unknown' };

              if (fs.existsSync(stateFile)) {
                state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
              }

              projects.push({
                name: config.project?.name || item.name,
                path: itemPath,
                description: config.project?.description || '',
                status: state.status || 'unknown',
                currentStage: state.current_stage || null,
                completedStages: state.completed_stages || [],
                createdAt: config.project?.created_at || null,
              });
            } catch (e) {
              // Skip invalid projects
            }
          }
        }
      }
    } catch (e) {
      // Skip directories we can't read
    }
  }

  return projects;
}

/**
 * Format status with icon
 */
function formatStatus(project) {
  const icons = {
    idle: chalk.gray('○'),
    running: chalk.cyan('◉'),
    waiting_for_confirmation: chalk.yellow('◐'),
    paused: chalk.yellow('◐'),
    failed: chalk.red('✖'),
    completed: chalk.green('✓'),
    unknown: chalk.gray('?')
  };

  return icons[project.status] || icons.unknown;
}

/**
 * Main list function
 */
module.exports = async function(factoryRoot) {
  console.log('');
  console.log(chalk.bold.cyan('Agent Factory') + ' - Projects');
  console.log('');

  const projects = findFactoryProjects();

  if (projects.length === 0) {
    console.log(chalk.yellow('No Factory projects found.'));
    console.log('');
    console.log('Create a new project with: ' + chalk.cyan('factory init'));
    console.log('');
    return;
  }

  // Sort by status (running first) then by name
  projects.sort((a, b) => {
    const statusOrder = { running: 0, waiting_for_confirmation: 1, paused: 1, failed: 2, completed: 3, idle: 4 };
    const aStatus = statusOrder[a.status] ?? 5;
    const bStatus = statusOrder[b.status] ?? 5;
    if (aStatus !== bStatus) return aStatus - bStatus;
    return a.name.localeCompare(b.name);
  });

  console.log(chalk.gray('Found ') + chalk.white.bold(projects.length) + chalk.gray(' project(s):\n'));

  for (const project of projects) {
    const statusIcon = formatStatus(project);

    console.log(statusIcon + ' ' + chalk.bold(project.name));

    if (project.description) {
      console.log(chalk.gray('  ' + project.description));
    }

    console.log(chalk.gray('  Path: ') + chalk.cyan(project.path));

    if (project.currentStage) {
      console.log(chalk.gray('  Stage: ') + chalk.cyan(project.currentStage));
    } else if (project.completedStages.length > 0) {
      console.log(chalk.gray('  Completed: ') + chalk.green(project.completedStages.join(', ')));
    }

    console.log('');
  }

  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray('Work on a project:') + ' cd ' + chalk.cyan('<path>') + chalk.gray(' && ') + chalk.cyan('factory run'));
  console.log('');
};
