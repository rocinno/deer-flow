# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DeerFlow (**D**eep **E**xploration and **E**fficient **R**esearch **Flow**) is a multi-agent framework for conducting deep research using language models. It integrates web search, crawling, Python code execution and other tools into a LangGraph-based workflow.

The system consists of:
1. A Python backend using LangGraph and LangChain
2. A modern web UI built with Next.js, React, and Shadcn components
3. Integration capabilities with Model Context Protocol (MCP) services

## Key Commands

### Environment Setup

```bash
# Setup Python environment with uv
uv sync

# Copy and configure environment files
cp .env.example .env
cp conf.yaml.example conf.yaml

# Install web UI dependencies
cd web
pnpm install
```

### Running the Application

```bash
# 1. Console UI (quickest way to run)
uv run main.py

# 2. Run with a specific query
uv run main.py "What factors are influencing AI adoption in healthcare?"

# 3. Run in interactive mode with built-in questions
uv run main.py --interactive

# 4. Run with custom planning parameters
uv run main.py --max_plan_iterations 3 --max_step_num 3

# 5. Start backend server
uv run server.py

# 6. Start web UI development server
cd web && pnpm dev

# 7. Run both backend and frontend together in development mode
./bootstrap.sh -d  # or bootstrap.bat -d on Windows
```

### Development Commands

```bash
# Format code with black
make format

# Run linting
make lint

# Run all tests
make test

# Run specific test file
pytest tests/integration/test_crawler.py

# Run tests with coverage
make coverage

# Debug with LangGraph Studio (Mac)
uvx --refresh --from "langgraph-cli[inmem]" --with-editable . --python 3.12 langgraph dev --allow-blocking
# or make langgraph-dev
```

## Architecture

DeerFlow implements a modular multi-agent architecture using LangGraph:

1. **Coordinator**: Entry point that manages workflow and delegates tasks to the planner
2. **Planner**: Creates structured research plans and decides when to generate reports
3. **Research Team**:
   - **Researcher**: Conducts web searches and information gathering
   - **Coder**: Handles code analysis and execution using Python REPL
4. **Reporter**: Aggregates findings and generates comprehensive research reports

Components communicate through a state-based workflow with well-defined message passing.

## Configuration

- **LLM Models**: Configure in `conf.yaml` using litellm format
- **Search Engines**: Configure in `.env` (supports Tavily, DuckDuckGo, Brave Search, Arxiv)
- **MCP Services**: Configure in settings to extend capabilities

## Testing

The project uses pytest for testing. Tests are in the `tests/` directory, organized by test type:
- Integration tests: `tests/integration/`

## Important Files

- `main.py`: CLI entry point for running the application
- `server.py`: FastAPI server for web access
- `src/workflow.py`: Defines the main agent workflow
- `src/graph/`: Contains LangGraph nodes and workflow builder
- `src/agents/`: Agent definitions and behaviors
- `src/tools/`: Tool implementations for agents (search, crawl, etc.)
- `src/prompts/`: Prompt templates for different agents
- `web/src/`: Frontend application using Next.js

## Best Practices

1. Always format code with `make format` before committing changes
2. Run tests with `make test` to ensure the application is functioning correctly
3. Keep LLM prompt changes minimal and carefully test changes to ensure consistent output
4. When modifying the graph workflow, test with LangGraph Studio to visualize execution flow
5. Use the proper LLM model tier for different agent roles (coordinator, planner, etc.)