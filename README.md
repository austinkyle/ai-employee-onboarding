# AI Employee Onboarding Automation

> A new hire fills out one form. Everything else happens automatically.

---

## The Problem

Traditional employee onboarding is a cascade of manual tasks: HR sends a welcome email, then pings the manager, then schedules an orientation, then manually creates a checklist for the new hire. It takes hours, relies on humans remembering each step, and still results in inconsistent experiences for every new hire.

This project eliminates all of that. One form submission triggers a fully automated, personalized onboarding sequence — in under 60 seconds, without any HR intervention.

---

## What Happens in 60 Seconds

The moment a new hire submits the onboarding form, five actions fire automatically:

1. **Welcome email** sent to the new hire with their start date, role, manager, location, and equipment details
2. **Manager notification** sent to the hiring manager with a full summary of the new hire's details
3. **Claude (AI) generates** a personalized, role-specific 30-day onboarding plan with weekly phases, success metrics, and department resources
4. **Google Sheets row appended** to the employee registry with all 13 data fields including the generated plan
5. **Follow-up email** sent to the new hire containing their complete, personalized 30-day plan

---

## Workflow Architecture

```
[New Hire Submits Form]
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
[1. Welcome Email]              [2. Manager Notification]
     to New Hire                    to Hiring Manager
         │                                      │
         │               ┌──────────────────────┘
         │               │
         ▼               ▼
   [3. Claude API: Generate 30-Day Plan]
              │
              ▼
   [4. Google Sheets: Log New Employee]
              │
              ▼
   [5. Follow-up Email with 30-Day Plan]
              to New Hire
```

Steps 1, 2, and 3 run in parallel from the form trigger.
Steps 4 and 5 run sequentially after Claude completes.
All steps have `continueOnFail: true` — one failure does not stop the others.

---

## Form Fields

| Field | Type | Required | Options |
|---|---|---|---|
| Full Name | Text | Yes | — |
| Personal Email | Email | Yes | — |
| Job Title | Text | Yes | — |
| Department | Dropdown | Yes | Sales, Marketing, Operations, Engineering, Finance, HR, Other |
| Start Date | Date | Yes | — |
| Manager Name | Text | Yes | — |
| Manager Email | Email | Yes | — |
| Employment Type | Dropdown | Yes | Full-time, Part-time, Contract |
| Work Location | Dropdown | Yes | Remote, On-site, Hybrid |
| Equipment Needed | Multi-select | No | Laptop, Monitor, Phone, Desk, Access Badge |

---

## Google Sheets Output

Sheet name: **AI EMPLOYEE ONBOARDING**
Sheet ID: `1y2yofiiTOGhXhb47Hft4SuxaeA6N9_8RCjQ_jAQc50E`

Each form submission appends one row with 13 columns:

| # | Column | Value |
|---|---|---|
| 1 | Timestamp | ISO timestamp, auto-generated |
| 2 | Full Name | From form |
| 3 | Personal Email | From form |
| 4 | Job Title | From form |
| 5 | Department | From form |
| 6 | Start Date | From form |
| 7 | Manager Name | From form |
| 8 | Manager Email | From form |
| 9 | Employment Type | From form |
| 10 | Work Location | From form |
| 11 | Equipment Needed | From form (comma-separated) |
| 12 | Onboarding Status | Always `"Completed"` |
| 13 | 30-Day Plan | Full text from Claude, or fallback message if generation failed |

---

## Tech Stack

| Layer | Tool | Purpose |
|---|---|---|
| Workflow Automation | [n8n](https://n8n.io) | Orchestrates all 5 steps from a single form trigger |
| AI | [Claude (Anthropic)](https://anthropic.com) | Generates the personalized 30-day onboarding plan |
| Email | Gmail API (via n8n OAuth2) | Sends all 3 emails |
| Database | Google Sheets API (via n8n OAuth2) | Logs each new hire to the employee registry |
| Version Control | GitHub | Stores workflow JSON, templates, and documentation |

---

## Setup Instructions

### Prerequisites
- n8n instance (self-hosted or [n8n Cloud](https://n8n.io/cloud))
- Google account with access to Gmail and Google Sheets
- Anthropic API key

### Step 1 — Import the Workflow

1. Open n8n
2. Click **Workflows** → **Import from file**
3. Select `onboarding-workflow.json` from this repo
4. The workflow will import with all 6 nodes wired

### Step 2 — Configure Credentials

In n8n, go to **Settings → Credentials** and create:

**Gmail OAuth2**
- Name it exactly: `Gmail account`
- Authenticate with: `therealaustinkyle@gmail.com`
- Required scopes: Gmail send

**Google Sheets OAuth2**
- Name it exactly: `Google Sheets account`
- Same Google account
- Required scopes: Google Sheets (read/write)

### Step 3 — Set the Anthropic API Key

n8n needs your Anthropic API key as an environment variable.

**Self-hosted n8n** — add to your `.env` or `docker-compose.yml`:
```
N8N_CUSTOM_EXTENSIONS=
ANTHROPIC_API_KEY=your_api_key_here
```
Then restart n8n.

**n8n Cloud** — go to **Settings → Variables**, create:
- Name: `ANTHROPIC_API_KEY`
- Value: your Anthropic API key

### Step 4 — Verify the Google Sheet

Ensure your Google Sheet has these exact column headers in row 1, in this order:
```
Timestamp | Full Name | Personal Email | Job Title | Department | Start Date | Manager Name | Manager Email | Employment Type | Work Location | Equipment Needed | Onboarding Status | 30-Day Plan
```

### Step 5 — Activate and Test

1. In n8n, open the imported workflow
2. Click **Activate** (toggle in top right)
3. n8n will display the form URL (something like `https://your-n8n.com/form/12345678-abcd-ef01-2345-678901234567`)
4. Submit the form with the test data below

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | n8n environment | Used in Step 3 HTTP Request header (`$env.ANTHROPIC_API_KEY`) |
| `GOOGLE_SHEET_ID` | Reference only | `1y2yofiiTOGhXhb47Hft4SuxaeA6N9_8RCjQ_jAQc50E` |
| `GMAIL_SENDER` | Reference only | `therealaustinkyle@gmail.com` |

See `.env.example` for all variables with descriptions.

---

## Test Data

Use this sample submission to test the workflow end-to-end:

| Field | Value |
|---|---|
| Full Name | Sarah Johnson |
| Personal Email | `test@example.com` |
| Job Title | Marketing Coordinator |
| Department | Marketing |
| Start Date | 2026-06-17 |
| Manager Name | Austin Kyle |
| Manager Email | `therealaustinkyle@gmail.com` |
| Employment Type | Full-time |
| Work Location | Remote |
| Equipment Needed | Laptop, Monitor |

> Use `test@example.com` as the new hire email during testing to avoid sending live emails to real addresses.

---

## Project Structure (WAT Framework)

```
/
├── CLAUDE.md                    ← Master AI config (WAT framework)
├── onboarding-workflow.json     ← n8n workflow export (import this)
├── README.md                    ← This file
├── .env                         ← Secrets (never committed)
├── .env.example                 ← Variable template (safe to commit)
│
├── workflows/
│   └── new-hire-onboarding.md  ← WAT procedure: 5-step onboarding logic
│
└── tools/
    └── email-templates.js      ← Canonical HTML email template source
```

This project uses the **WAT framework**:
- **W (Workflows)** — `/workflows/` contains step-by-step procedure files
- **A (Agent)** — Claude Code reads CLAUDE.md and executes against workflows
- **T (Tools)** — `/tools/` contains scripts and integration helpers

---

## Error Handling

| Step | Failure | Behavior |
|---|---|---|
| Step 1 — Welcome Email | Gmail send fails | Logged, workflow continues |
| Step 2 — Manager Notification | Gmail send fails | Logged, workflow continues |
| Step 3 — Claude API | API error or timeout | Downstream nodes use fallback: `"Generation failed — manual review required"` |
| Step 4 — Google Sheets | Write fails | Warning logged, workflow continues |
| Step 5 — Follow-up Email | Gmail send fails | Logged, workflow completes with partial success |

All nodes have `continueOnFail: true`. A single step failure never stops the entire workflow.

---

## Roadmap

Future improvements planned:

- [ ] **Slack notification** — Post a `#new-hires` channel message when a new hire completes onboarding
- [ ] **DocuSign contract delivery** — Automatically send the offer letter / employment agreement for e-signature
- [ ] **BambooHR integration** — Create a new employee record in BambooHR automatically
- [ ] **Calendar invite** — Send a first-day calendar invite to the new hire and manager

---

## Built With

- [n8n](https://n8n.io) — workflow automation
- [Claude API](https://anthropic.com) — AI plan generation
- Gmail API — email delivery
- Google Sheets API — employee registry
- WAT Framework — project architecture

Built by [Austin Kyle](https://github.com/austinkyle)
