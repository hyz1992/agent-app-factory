# Agent Factory CLI

> Transform product ideas into runnable apps with AI-powered pipeline

Agent Factory CLI is a global command-line tool that helps you generate complete, production-ready applications from simple product descriptions. Powered by AI agents working through a structured 7-stage pipeline.

## Quick Start

```bash
# Install globally
npm install -g agent-factory

# Initialize a new project
cd my-project
factory init

# Run the pipeline
factory run
```

## Installation

### Global Installation (Recommended)

```bash
npm install -g agent-factory
```

After installation, the `factory` command is available in any directory.

### Development / Local Installation

```bash
# Clone the repository
git clone https://github.com/yourname/agent-factory-v4.git
cd agent-factory-v4/cli

# Link globally
npm link
```

## Commands

### `factory init`

Initialize the current directory as a Factory project.

```bash
factory init [options]
```

**Options:**
- `-n, --name <name>` - Project name (defaults to directory name)
- `-d, --description <desc>` - Project description

**Creates:**
- `.factory/` - Project configuration directory
- `agents/` - Symbolic link to Factory agents
- `skills/` - Symbolic link to Factory skills
- `input/` - Your product idea goes here
- `artifacts/` - Generated code and documentation

### `factory run [stage]`

Run the pipeline from the current or specified stage.

```bash
factory run [stage] [options]
```

**Arguments:**
- `stage` - Specific stage to run (bootstrap, prd, ui, tech, code, validation, preview)

**Options:**
- `-f, --force` - Skip confirmation prompts

**Example:**
```bash
factory run              # Run from current stage
factory run prd          # Run from PRD stage
factory run code --force # Run code stage without prompts
```

### `factory list`

List all Factory projects on your system.

```bash
factory list
```

Shows project names, statuses, and paths.

### `factory status`

Show detailed status of the current project.

```bash
factory status
```

Displays:
- Project information
- Pipeline status
- Stage progress
- Input file preview
- Generated artifacts

### `factory reset`

Reset the pipeline state (keeps artifacts).

```bash
factory reset [options]
```

**Options:**
- `-f, --force` - Skip confirmation prompt

## Pipeline Stages

The Agent Factory pipeline consists of 7 stages:

| Stage | Output | Description |
|-------|--------|-------------|
| **bootstrap** | `input/idea.md` | Structure your product idea |
| **prd** | `artifacts/prd/` | Generate product requirements |
| **ui** | `artifacts/ui/` | Design UI structure and prototypes |
| **tech** | `artifacts/tech/` | Define technical architecture |
| **code** | `artifacts/backend/`, `artifacts/client/` | Generate full-stack code |
| **validation** | `artifacts/validation/` | Verify code quality |
| **preview** | `artifacts/preview/` | Create deployment guides |

## Usage Workflow

1. **Initialize a project**
   ```bash
   mkdir my-app && cd my-app
   factory init
   ```

2. **Write your product idea**
   Edit `input/idea.md` with your product description.

3. **Run the pipeline**
   ```bash
   factory run
   ```

4. **Follow AI instructions**
   Copy the displayed instructions into Claude Code, Cursor, or your preferred AI assistant.

5. **Review and iterate**
   Each stage pauses for confirmation. Review outputs and proceed or retry.

## AI Assistant Integration

The CLI is designed to work with AI programming assistants:

### Claude Code (Recommended)
1. Open Claude Code in your Factory project directory
2. Run `factory run`
3. Follow the displayed instructions
4. Claude Code will auto-detect the project structure

### Cursor
1. Open Cursor in your project directory
2. Use `factory run` to get stage-specific commands
3. Paste into Cursor Composer

### OpenCode / Others
1. Follow the generic instructions displayed by `factory run`
2. The AI assistant will execute the pipeline

## Project Structure

After running `factory init`:

```
my-app/
├── .factory/              # Project configuration
│   ├── config.yaml        # Project metadata
│   └── state.json         # Pipeline state
├── agents/                # Factory agents (symlink)
├── skills/                # Factory skills (symlink)
├── input/
│   └── idea.md            # Your product idea
├── artifacts/             # Generated content
│   ├── prd/
│   ├── ui/
│   ├── tech/
│   ├── backend/
│   ├── client/
│   ├── validation/
│   └── preview/
└── pipeline/              # Pipeline state
```

## Configuration

### `.factory/config.yaml`

```yaml
project:
  name: "my-app"
  description: "My awesome app"
  created_at: "2024-01-28T10:00:00Z"
  updated_at: "2024-01-28T10:00:00Z"

pipeline:
  current_stage: null
  completed_stages: []
  last_checkpoint: null

settings:
  auto_save: true
  backup_on_error: true
```

## Troubleshooting

### "Not a Factory project"
Run `factory init` first to initialize the directory.

### Symlinks not working on Windows
Make sure you're running with administrator privileges, or the CLI will use junctions instead.

### Pipeline stuck at a stage
Use `factory status` to see current state, then `factory run <next_stage>` to skip forward.

### Want to start over?
Run `factory reset` to clear pipeline state while keeping artifacts.

## License

MIT

## Contributing

Contributions welcome! See [main repository](https://github.com/yourname/agent-factory-v4) for details.
