# Agent Configuration Guide

**Created:** January 26, 2026
**Purpose:** Document custom agent configuration with Task tool delegation

---

## Overview

Custom agents in Claude Code are defined as markdown files in `~/.claude/agents/`. Each agent has a frontmatter section specifying its configuration and a body containing its system prompt.

## Agent Configuration Format

```markdown
---
name: agent-name
description: Brief description of the agent's role and when to use it
model: claude-sonnet-4-20250514
tools: Task, Bash, Glob, Grep, Read, Edit, Write, WebFetch, WebSearch
---

# Agent Name

[System prompt and instructions...]
```

### Key Configuration Fields

- **name:** Unique identifier for the agent (used when invoking via Task tool)
- **description:** Describes the agent's role and specialties
- **model:** Which Claude model to use (claude-sonnet-4-20250514 recommended)
- **tools:** Comma-separated list of tools the agent can use

### Critical: Task Tool for Delegation

To enable an agent to spawn sub-agents and delegate work, the **Task** tool must be explicitly included in the tools list.

**Without Task tool:**
```yaml
tools: Bash, Read, Write  # Cannot delegate to sub-agents
```

**With Task tool:**
```yaml
tools: Task, Bash, Read, Write  # Can spawn and coordinate sub-agents
```

---

## Configured Agents (January 2026)

### 1. Devon Cross - CTO (devon-cross-cto)

**Location:** `~/.claude/agents/devon-cross-cto.md`

**Role:** Chief Technology Officer who coordinates all development work

**Tools:** Task, Bash, Glob, Grep, Read, Edit, Write, WebFetch, WebSearch

**Primary Responsibility:** Delegate work to division leads and coordinate complex projects

**Reports To:** User directly

**Manages:**
- Web Development Division Lead
- AI & Automation Division Lead
- Technical Consulting Division Lead

**When to Use:**
- Technical architecture decisions
- Complex multi-component projects
- Coordinating work across multiple domains
- Strategic technical planning

---

### 2. Web Development Division Lead (webdev-division-lead)

**Location:** `~/.claude/agents/webdev-division-lead.md`

**Role:** Manages all web development work (frontend, backend, full-stack)

**Tools:** Task, Bash, Glob, Grep, Read, Edit, Write, WebFetch, WebSearch

**Reports To:** Devon Cross (CTO)

**Delegates To:**
- frontend-developer
- backend-typescript-architect
- database-architect
- performance-optimizer
- test-suite-generator

**When to Use:**
- Building new pages or features
- Site structure updates
- Form handling and validation
- Database integration
- API development
- Full-stack implementation

---

### 3. AI & Automation Division Lead (ai-automation-division-lead)

**Location:** `~/.claude/agents/ai-automation-division-lead.md`

**Role:** Manages all AI integrations and automation workflows

**Tools:** Task, Bash, Glob, Grep, Read, Edit, Write, WebFetch, WebSearch

**Reports To:** Devon Cross (CTO)

**Delegates To:**
- backend-typescript-architect (for AI API integration)
- frontend-developer (for AI UI components)
- database-architect (for vector databases)

**When to Use:**
- AI-powered features (content generation, summarization, etc.)
- LLM integration (GPT-4, Claude, Gemini)
- Workflow automation
- Data processing pipelines
- Chatbots and intelligent assistants
- Semantic search

---

### 4. Technical Consulting Division Lead (technical-consulting-lead)

**Location:** `~/.claude/agents/technical-consulting-lead.md`

**Role:** Provides expert technical advisory and architecture reviews

**Tools:** Task, Bash, Glob, Grep, Read, Edit, Write, WebFetch, WebSearch

**Reports To:** Devon Cross (CTO)

**Delegates To:**
- architecture-checker
- security-auditor
- code-reviewer
- performance-optimizer
- database-architect

**When to Use:**
- Architecture reviews and assessments
- Technology selection decisions
- Modernization planning
- Technical due diligence
- Best practices consulting
- Strategic technical guidance

---

### 5. Design Reviewer (design-reviewer)

**Location:** `~/.claude/agents/design-reviewer.md`

**Role:** Comprehensive UI/UX design reviews with visual verification

**Tools:** mcp__playwright, Read, Glob, Grep, WebFetch, WebSearch

**Notes:**
- Does NOT have Task tool (cannot delegate)
- Uses Playwright MCP for visual testing
- Specialized for design review only

**When to Use:**
- UI/UX design reviews
- Visual regression testing
- Accessibility audits
- Responsive design verification

---

## Organizational Hierarchy

```
User
  └── Devon Cross (CTO)
      ├── Web Development Division Lead
      │   ├── Frontend Developer
      │   ├── Backend TypeScript Architect
      │   ├── Database Architect
      │   ├── Performance Optimizer
      │   └── Test Suite Generator
      │
      ├── AI & Automation Division Lead
      │   ├── Backend TypeScript Architect
      │   ├── Frontend Developer
      │   └── Database Architect
      │
      └── Technical Consulting Division Lead
          ├── Architecture Checker
          ├── Security Auditor
          ├── Code Reviewer
          ├── Performance Optimizer
          └── Database Architect
```

---

## Usage Examples

### Example 1: Delegating to Devon for Multi-Domain Project

```typescript
// User invokes Devon for a complex feature
User: "Build a user authentication system with OAuth"

// Devon delegates to multiple specialists in parallel
Devon uses Task tool to spawn:
- database-architect: Design auth tables and RLS policies
- backend-typescript-architect: Implement OAuth flow
- frontend-developer: Build login/signup UI
- security-auditor: Review implementation

Devon coordinates results and reports back
```

### Example 2: Web Dev Lead for Frontend Work

```typescript
// User invokes Web Dev Lead for a new feature
User: "Create a user profile page with edit functionality"

// Web Dev Lead delegates in parallel
Web Dev Lead uses Task tool to spawn:
- database-architect: Create user_profiles table
- backend-typescript-architect: Build API endpoints
- frontend-developer: Create UI components
- test-suite-generator: Write tests

Web Dev Lead ensures integration and reports completion
```

### Example 3: AI Lead for Content Generation

```typescript
// User invokes AI Lead for an AI feature
User: "Add AI-powered blog post generator"

// AI Lead delegates specific tasks
AI Lead uses Task tool to spawn:
- backend-typescript-architect: Create AI server action
- frontend-developer: Build UI with streaming

AI Lead designs prompts, implements orchestration, reports back
```

---

## How to Create New Agents

### 1. Create Agent File

Create a new `.md` file in `~/.claude/agents/`:

```bash
# Example: Create a new deployment specialist agent
touch ~/.claude/agents/deployment-specialist.md
```

### 2. Define Agent Configuration

Use this template:

```markdown
---
name: your-agent-name
description: What this agent does and when to use it
model: claude-sonnet-4-20250514
tools: Task, Bash, Glob, Grep, Read, Edit, Write, WebFetch, WebSearch
---

# Your Agent Name

You are a **[Role]** specializing in [area of expertise].

## Your Expertise
[List key skills and knowledge areas]

## Core Responsibilities
[What this agent is responsible for]

## Delegation
[If this agent can delegate, specify which sub-agents it uses]

## Communication Style
[How this agent should communicate]
```

### 3. Restart Claude Code

Agent changes take effect on next session start.

### 4. Test the Agent

```typescript
// Invoke via Task tool
Task(
  subagent_type: "your-agent-name",
  description: "Brief description",
  prompt: "Detailed instructions..."
)
```

---

## Troubleshooting

### Agent Can't Spawn Sub-Agents

**Problem:** Agent reports "I don't have access to the Task tool"

**Solution:**
1. Check agent's `.md` file in `~/.claude/agents/`
2. Ensure `tools:` line includes `Task`
3. Restart Claude Code session

### Agent Not Found

**Problem:** "Agent 'agent-name' not found"

**Solution:**
1. Verify file exists in `~/.claude/agents/agent-name.md`
2. Check `name:` in frontmatter matches exactly
3. Restart Claude Code session

### Agent Has Wrong Tools

**Problem:** Agent can't use a specific tool

**Solution:**
1. Add tool to `tools:` line in frontmatter
2. Available tools: Task, Bash, Glob, Grep, Read, Edit, Write, WebFetch, WebSearch, SlashCommand, mcp__*
3. Restart Claude Code session

---

## Best Practices

### 1. Tool Selection

- **Always include Task** for agents that coordinate work
- **Include Bash** for agents that need to run commands
- **Include Read/Write/Edit** for agents that work with files
- **Include WebFetch/WebSearch** for agents that need external information

### 2. Agent Design

- **Single Responsibility:** Each agent should have a clear, focused purpose
- **Clear Delegation:** Document which sub-agents this agent uses
- **Detailed Instructions:** Provide comprehensive system prompts
- **Examples:** Include examples of common scenarios

### 3. Organizational Structure

- **Hierarchy:** Maintain clear reporting structure
- **Specialization:** Create specialized agents for specific domains
- **Coordination:** Use coordinating agents (like Devon) for complex projects

---

## Agent Configuration Files

All agent files are located in: `~/.claude/agents/`

**Current agents:**
- `devon-cross-cto.md` - CTO and coordinator
- `webdev-division-lead.md` - Web development manager
- `ai-automation-division-lead.md` - AI/automation manager
- `technical-consulting-lead.md` - Consulting and architecture
- `design-reviewer.md` - UI/UX design reviews

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-26 | 1.0 | Created custom agents with Task tool delegation |

---

**For questions or updates to agent configurations, modify the `.md` files in `~/.claude/agents/` and restart Claude Code.**
