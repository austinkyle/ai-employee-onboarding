# AI Employee Onboarding Automation

## Project Overview

This project automates the employee onboarding process using AI. It orchestrates tasks such as provisioning accounts, sending welcome communications, scheduling orientation, collecting documents, and tracking completion — reducing manual HR effort and ensuring a consistent experience for every new hire.

---

## The WAT Framework

This project is organised around three interlocking layers:

```
W — Workflows   Step-by-step procedures that orchestrate the work
A — Agent       Claude Code — the AI that reads, plans, and executes
T — Tools       Scripts and integrations the agent uses to get things done
```

### W — Workflows
Workflows live in `/workflows/`. Each file is a numbered, step-by-step procedure written in plain Markdown. A workflow describes *what* needs to happen and *in what order*, but delegates the *how* to Tools. Workflows are the source of truth for business logic.

Examples:
- `workflows/new-hire-onboarding.md` — end-to-end onboarding sequence
- `workflows/offboarding.md` — account revocation and exit checklist
- `workflows/it-provisioning.md` — device and software setup steps

### A — Agent (Claude Code)
The Agent is Claude Code. At the start of every session it reads this file, then reads any relevant workflow(s) to understand the task at hand. The Agent:
- Interprets workflow steps and decides which tools to invoke
- Reads and writes files in `/temp/` as scratch space
- Never hard-codes secrets — always reads from `.env`
- Asks for clarification before taking irreversible actions

### T — Tools
Tools live in `/tools/`. Each tool is a focused script or integration that does one thing well. Tools are invoked by the Agent on behalf of a Workflow.

Examples:
- `tools/send-email.js` — sends templated onboarding emails
- `tools/create-google-account.js` — provisions a GSuite account via Admin SDK
- `tools/assign-slack-channels.js` — adds the new hire to relevant Slack channels
- `tools/generate-welcome-doc.js` — fills a Google Doc template with hire details

---

## Folder Structure

```
/
├── CLAUDE.md                        ← you are here (master config)
├── onboarding-workflow.json         ← n8n workflow export (importable)
├── README.md                        ← project documentation
├── .env                             ← secrets & API keys (NEVER commit)
├── .env.example                     ← template with blank values (safe to commit)
├── .gitignore
│
├── workflows/
│   └── new-hire-onboarding.md      ← W: 5-step onboarding procedure
│
├── tools/
│   └── email-templates.js          ← T: canonical HTML email templates
│
└── temp/                            ← scratch space (gitignored contents)
    ├── outputs/                     ← generated artefacts (PDFs, CSVs, logs)
    └── resources/                   ← raw inputs (uploads, reference files)
```

---

## Session Rules

At the start of every Claude Code session:

1. **Read this file** (`CLAUDE.md`) to orient yourself.
2. **Identify the active workflow** — ask the user which workflow applies, or infer from context.
3. **Read the workflow file** before taking any action.
4. **Check available tools** by scanning `/tools/` to understand what integrations exist.
5. **For n8n work** — read `onboarding-workflow.json` for the current node architecture and `workflows/new-hire-onboarding.md` for the business logic. Changes to email content go in `tools/email-templates.js` first, then must be reflected in the corresponding Gmail node's `message` parameter in the workflow JSON.
6. **Use `/temp/`** for all intermediate files, drafts, and working outputs. Never pollute the root or workflow directories with temp files.
7. **Confirm before irreversible actions** — sending emails, pushing to GitHub, modifying the Google Sheet schema.

---

## Environment Variables

All secrets live in `.env` at the project root. Never commit `.env`. Use `.env.example` as the canonical list of required variables.

Load variables in scripts with:
```js
import "dotenv/config"; // Node.js (ESM)
// or
require("dotenv").config(); // Node.js (CJS)
```

---

## Conventions

| Convention | Rule |
|---|---|
| Workflow files | `kebab-case.md` inside `/workflows/` |
| Tool files | `kebab-case.js` (or `.ts`) inside `/tools/` |
| Temp outputs | `YYYY-MM-DD_description.ext` inside `/temp/outputs/` |
| Secrets | `.env` only, never inline, never committed |
| Commit messages | Imperative mood: "Add send-email tool" not "Added" |
| Irreversible actions | Always confirm with user before executing |

---

## Adding a New Workflow

1. Create `workflows/<name>.md`
2. Write numbered steps; reference tool names by filename
3. Note any new env vars needed and add them to `.env.example`
4. Update this file's folder structure table if a new directory is introduced

## Adding a New Tool

1. Create `tools/<name>.js` (or `.ts`)
2. Accept all configuration via function arguments or `.env` — no hard-coded values
3. Export a single default function so the Agent can call it cleanly
4. Add a one-line comment at the top describing what the tool does
