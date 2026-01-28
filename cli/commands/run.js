/**
 * factory run command
 *
 * Run the Agent Factory pipeline from the current or specified stage.
 * Displays instructions for AI assistants to execute the pipeline.
 *
 * All factory files are now in .factory/ directory, making the project self-contained.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const yaml = require('yaml');

/**
 * Find the pipeline.yaml file
 * First checks .factory/, then falls back to project root or global
 */
function findPipelineConfig(projectDir, factoryRoot) {
  // Check in .factory/ directory (new location)
  const factoryPipeline = path.join(projectDir, '.factory', 'pipeline.yaml');
  if (fs.existsSync(factoryPipeline)) {
    return factoryPipeline;
  }

  // Check in project root (for backward compatibility)
  const locations = [
    path.join(projectDir, 'pipeline.yaml'),
    path.join(projectDir, 'pipeline', 'pipeline.yaml'),
    path.join(projectDir, 'agents', 'pipeline.yaml'),
  ];

  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      return loc;
    }
  }

  // Fallback: use global factory pipeline.yaml
  const globalPipeline = path.join(factoryRoot, 'pipeline.yaml');
  if (fs.existsSync(globalPipeline)) {
    return globalPipeline;
  }

  return null;
}

/**
 * Find the orchestrator file
 */
function findOrchestratorFile(projectDir, factoryRoot) {
  // Check in .factory/agents/ (new location)
  const factoryOrchestrator = path.join(projectDir, '.factory', 'agents', 'orchestrator.checkpoint.md');
  if (fs.existsSync(factoryOrchestrator)) {
    return factoryOrchestrator;
  }

  // Check in project agents/ (backward compatibility)
  const projectOrchestrator = path.join(projectDir, 'agents', 'orchestrator.checkpoint.md');
  if (fs.existsSync(projectOrchestrator)) {
    return projectOrchestrator;
  }

  // Fallback: use global
  const globalOrchestrator = path.join(factoryRoot, 'agents', 'orchestrator.checkpoint.md');
  if (fs.existsSync(globalOrchestrator)) {
    return globalOrchestrator;
  }

  return null;
}

/**
 * Read factory state
 */
function readState(projectDir) {
  const stateFile = path.join(projectDir, '.factory', 'state.json');
  if (fs.existsSync(stateFile)) {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  }
  return {
    version: 1,
    status: 'idle',
    current_stage: null,
    completed_stages: [],
    started_at: null,
    last_updated: null
  };
}

/**
 * Update factory state
 */
function updateState(projectDir, updates) {
  const stateFile = path.join(projectDir, '.factory', 'state.json');
  const state = readState(projectDir);
  Object.assign(state, updates, { last_updated: new Date().toISOString() });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

/**
 * Detect which AI assistant is running
 */
function detectAIAssistant() {
  const env = process.env;

  // Claude Code detection
  if (env.CLAUDE_CODE || env.ANTHROPIC_API_KEY) {
    return 'claude-code';
  }

  // Cursor detection
  if (env.CURSOR || env.CURSOR_API_KEY) {
    return 'cursor';
  }

  // OpenCode detection
  if (env.OPENCODE || env.OPENCODE_VERSION) {
    return 'opencode';
  }

  return 'unknown';
}

/**
 * Get the assistant-specific instructions
 * Uses relative paths when files are in .factory/
 */
function getAssistantInstructions(assistant, projectDir, factoryRoot, state, requestedStage) {
  const pipelineFile = findPipelineConfig(projectDir, factoryRoot);
  const orchestratorFile = findOrchestratorFile(projectDir, factoryRoot);
  const configFile = path.join(projectDir, '.factory', 'config.yaml');
  const ideaFile = path.join(projectDir, 'input', 'idea.md');

  let instructions = '';

  if (assistant === 'claude-code') {
    instructions += '\n' + chalk.cyan.bold('🤖 Claude Code Instructions:\n');
    instructions += chalk.gray('─'.repeat(50)) + '\n\n';
    instructions += 'This is an Agent Factory project. To execute the pipeline:\n\n';
    instructions += '1. Read the pipeline definition:\n';
    instructions += chalk.cyan('   Read(' + pipelineFile + ')\n\n');
    instructions += '2. Read the orchestrator agent:\n';
    instructions += chalk.cyan('   Read(' + orchestratorFile + ')\n\n');
    instructions += '3. Read the project config:\n';
    instructions += chalk.cyan('   Read(' + configFile + ')\n\n');

    if (fs.existsSync(ideaFile)) {
      instructions += '4. Read the product idea:\n';
      instructions += chalk.cyan('   Read(' + ideaFile + ')\n\n');
    }

    instructions += chalk.gray('Note: When agents reference skills/ or policies/, check .factory/ first, then root directory.\n\n');
    instructions += 'Then execute the pipeline starting from: ';
    instructions += chalk.bold(requestedStage || state.current_stage || 'bootstrap') + '\n\n';

  } else if (assistant === 'cursor') {
    instructions += '\n' + chalk.cyan.bold('🤖 Cursor Instructions:\n');
    instructions += chalk.gray('─'.repeat(50)) + '\n\n';
    instructions += 'This is an Agent Factory project. Use Cursor Composer to:\n\n';
    instructions += '1. @ReadFile ' + pipelineFile + '\n';
    instructions += '2. @ReadFile ' + orchestratorFile + '\n';
    instructions += '3. @ReadFile ' + configFile + '\n';
    instructions += chalk.gray('   (Note: Check .factory/ first for skills/policies/ references)\n');
    instructions += '4. Execute the pipeline from: ' + (requestedStage || state.current_stage || 'bootstrap') + '\n\n';

  } else {
    instructions += '\n' + chalk.cyan.bold('🤖 AI Assistant Instructions:\n');
    instructions += chalk.gray('─'.repeat(50)) + '\n\n';
    instructions += 'This is an Agent Factory project. Please:\n\n';
    instructions += '1. Read ' + pipelineFile + '\n';
    instructions += '2. Read ' + orchestratorFile + '\n';
    instructions += '3. Read ' + configFile + '\n';
    if (fs.existsSync(ideaFile)) {
      instructions += '4. Read ' + ideaFile + '\n';
    }
    instructions += '5. Execute the pipeline from: ' + (requestedStage || state.current_stage || 'bootstrap') + '\n\n';
    instructions += chalk.gray('Note: Check .factory/ first for skills/policies/ references, then root directory.\n\n');
  }

  return instructions;
}

/**
 * Display pipeline status
 */
function displayStatus(state, config) {
  console.log('');
  console.log(chalk.bold('Pipeline Status:'));
  console.log(chalk.gray('─'.repeat(40)));

  if (config && config.project) {
    console.log(chalk.gray('Project: ') + chalk.white(config.project.name));
  }

  const statusColor = {
    idle: chalk.gray,
    running: chalk.cyan,
    waiting_for_confirmation: chalk.yellow,
    paused: chalk.yellow,
    failed: chalk.red,
    completed: chalk.green
  };

  const statusLabel = {
    idle: 'Not Started',
    running: 'Running',
    waiting_for_confirmation: 'Waiting',
    paused: 'Paused',
    failed: 'Failed',
    completed: 'Completed'
  };

  const displayStatus = statusLabel[state.status] || state.status;
  console.log(chalk.gray('Status: ') + (statusColor[state.status] || chalk.white)(displayStatus));

  if (state.current_stage) {
    console.log(chalk.gray('Current Stage: ') + chalk.cyan(state.current_stage));
  }

  if (state.completed_stages && state.completed_stages.length > 0) {
    console.log(chalk.gray('Completed: ') + chalk.green(state.completed_stages.join(', ')));
  }

  console.log('');
}

/**
 * Main run function
 */
module.exports = async function(factoryRoot, projectDir, requestedStage, options) {
  // Check if this is a Factory project
  const factoryDir = path.join(projectDir, '.factory');
  const configFile = path.join(factoryDir, 'config.yaml');

  if (!fs.existsSync(factoryDir) || !fs.existsSync(configFile)) {
    console.log('');
    console.log(chalk.yellow('Not a Factory project.'));
    console.log(chalk.gray('Run ' + chalk.cyan('factory init') + ' first to initialize this directory.'));
    console.log('');
    return;
  }

  // Read config and state
  const config = yaml.parse(fs.readFileSync(configFile, 'utf8'));
  const state = readState(projectDir);

  // Display header
  console.log('');
  console.log(chalk.bold.cyan('Agent Factory') + ' - Pipeline Runner');
  console.log('');

  // Display current status
  displayStatus(state, config);

  // Find pipeline.yaml
  const pipelineFile = findPipelineConfig(projectDir, factoryRoot);
  if (!pipelineFile) {
    console.log(chalk.red('Error: pipeline.yaml not found!'));
    console.log(chalk.gray('Expected locations:'));
    console.log(chalk.gray('  - .factory/pipeline.yaml'));
    console.log(chalk.gray('  - pipeline.yaml'));
    console.log(chalk.gray('  - pipeline/pipeline.yaml'));
    console.log(chalk.gray('  - ' + path.join(factoryRoot, 'pipeline.yaml')));
    return;
  }

  // Determine which stage to run
  let targetStage = requestedStage;
  if (!targetStage) {
    if (state.current_stage) {
      targetStage = state.current_stage;
    } else if (state.completed_stages && state.completed_stages.length > 0) {
      // Pipeline already completed, show summary
      console.log(chalk.green.bold('✓ Pipeline completed!'));
      console.log(chalk.gray('All stages: ') + state.completed_stages.join(', '));
      console.log('');
      console.log('To restart, use: ' + chalk.cyan('factory run <stage>'));
      console.log('');
      return;
    } else {
      targetStage = 'bootstrap';
    }
  }

  // Detect AI assistant
  const assistant = detectAIAssistant();

  // Update state to running
  updateState(projectDir, {
    status: 'running',
    current_stage: targetStage
  });

  // Display assistant-specific instructions
  const instructions = getAssistantInstructions(assistant, projectDir, factoryRoot, state, targetStage);
  console.log(instructions);

  // Display manual instructions
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.bold('Manual Execution Steps:\n'));
  console.log('1. Open your AI Assistant (Claude Code, Cursor, etc.)');
  console.log('2. Copy and paste the instructions above');
  console.log('3. The AI will execute the pipeline stage by stage');
  console.log('');

  // Show available stages if pipeline.yaml is readable
  try {
    const pipelineContent = fs.readFileSync(pipelineFile, 'utf8');
    const stageMatches = pipelineContent.matchAll(/^(\w+):\s*$/gm);
    const stages = [...stageMatches].map(m => m[1]).filter(s =>
      ['bootstrap', 'prd', 'ui', 'tech', 'code', 'validation', 'preview'].includes(s)
    );

    if (stages.length > 0) {
      console.log(chalk.gray('Available stages:'));
      stages.forEach((stage, i) => {
        const isCompleted = state.completed_stages && state.completed_stages.includes(stage);
        const isCurrent = state.current_stage === stage;
        const icon = isCompleted ? chalk.green('✓') : (isCurrent ? chalk.cyan('→') : chalk.gray('○'));
        console.log(chalk.gray(`  ${icon} ${stage}`));
      });
      console.log('');
    }
  } catch (e) {
    // Ignore parsing errors
  }

  console.log(chalk.gray('─'.repeat(50)));
  console.log('');
  console.log(chalk.cyan('Ready!') + ' Follow the instructions above to continue.');
  console.log('');
};
