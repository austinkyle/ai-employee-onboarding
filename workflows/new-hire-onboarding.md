# Workflow: New Hire Onboarding Automation

**WAT Layer:** W — Workflow  
**Trigger:** n8n Form Trigger (public URL, no auth required)  
**Target completion:** All 5 steps fire within 60 seconds of form submission  
**Owner:** Austin Kyle (therealaustinkyle@gmail.com)  
**n8n Workflow File:** `/onboarding-workflow.json`

---

## Overview

A new hire submits a single onboarding form. Five automated actions fire in sequence with no manual HR involvement. Steps 1, 2, and 3 launch in parallel from the form trigger. Steps 4 and 5 run sequentially after Step 3 completes.

```
[Form Submitted]
      │
      ├──► STEP 1: Welcome Email → New Hire
      ├──► STEP 2: Manager Notification → Hiring Manager
      └──► STEP 3: Claude API → Generate 30-Day Plan
                         │
                         ▼
                   STEP 4: Google Sheets → Log Employee
                         │
                         ▼
                   STEP 5: Follow-up Email → New Hire (with plan)
```

---

## Trigger

**Node:** `On New Hire Form Submission` (n8n Form Trigger v2.2)

The form collects:

| Field | Type | Required |
|---|---|---|
| Full Name | Text | Yes |
| Personal Email | Email | Yes |
| Job Title | Text | Yes |
| Department | Dropdown | Yes |
| Start Date | Date | Yes |
| Manager Name | Text | Yes |
| Manager Email | Email | Yes |
| Employment Type | Dropdown | Yes |
| Work Location | Dropdown | Yes |
| Equipment Needed | Multi-select | No |

Form data is available downstream as:
`$('On New Hire Form Submission').item.json['Field Name']`

---

## Step 1 — Welcome Email to New Hire

**Node:** `Step 1: Welcome Email`  
**Tool:** n8n Gmail node (OAuth2, sender: therealaustinkyle@gmail.com)  
**Fires:** In parallel with Steps 2 and 3  
**Error behavior:** `continueOnFail: true` — log error, do not stop workflow

**Inputs consumed from trigger:**
- `Full Name` (extract first name via `.split(' ')[0]`)
- `Personal Email`
- `Start Date`
- `Job Title`
- `Manager Name`
- `Work Location`
- `Equipment Needed`

**Output:** Gmail send confirmation (not used downstream)

**Email:**
- To: new hire's personal email
- Subject: `Welcome to Kymap LLC, [First Name]! 🎉`
- Body: HTML welcome email with hire details, confirmation of start date/title/manager/location/equipment, note that 30-day plan follows shortly
- Template source: `tools/email-templates.js` → `welcomeEmail()`

---

## Step 2 — Manager Notification

**Node:** `Step 2: Manager Notification`  
**Tool:** n8n Gmail node (OAuth2, sender: therealaustinkyle@gmail.com)  
**Fires:** In parallel with Steps 1 and 3  
**Error behavior:** `continueOnFail: true` — log error, do not stop workflow

**Inputs consumed from trigger:**
- `Full Name`, `Job Title`, `Department`
- `Start Date`, `Work Location`, `Employment Type`
- `Equipment Needed`
- `Manager Name`, `Manager Email`

**Output:** Gmail send confirmation (not used downstream)

**Email:**
- To: manager's email (from form)
- Subject: `[New Hire Name] has completed onboarding — starting [Start Date]`
- Body: HTML summary of all hire details, confirmation welcome email was sent
- Template source: `tools/email-templates.js` → `managerNotification()`

---

## Step 3 — Claude API: Generate 30-Day Onboarding Plan

**Node:** `Step 3: Generate 30-Day Plan (Claude)`  
**Tool:** n8n HTTP Request node → Anthropic API  
**Fires:** In parallel with Steps 1 and 2  
**Error behavior:** `continueOnFail: true` — on failure, downstream nodes use fallback text

**Inputs consumed from trigger:**
- `Full Name`, `Job Title`, `Department`
- `Work Location`, `Employment Type`, `Start Date`, `Manager Name`

**API call:**
- URL: `https://api.anthropic.com/v1/messages`
- Model: `claude-sonnet-4-6`
- Max tokens: 2000
- Header: `x-api-key` from n8n env var `ANTHROPIC_API_KEY`

**System prompt:** Expert HR consultant at Kymap LLC, an AI automation company.

**User prompt structure:**
- Role/department context
- Three weekly phases: Orientation (Days 1-7), Learning (Days 8-14), Contribution (Days 15-30)
- 5 specific daily tasks per phase
- 3 key success metrics
- 2-3 department-specific resources
- First check-in note with manager

**Output extracted from:** `$json.content[0].text`  
**Fallback if Claude fails:** `"Generation failed — manual review required"`

---

## Step 4 — Google Sheets: Log New Employee

**Node:** `Step 4: Log to Google Sheets`  
**Tool:** n8n Google Sheets node (OAuth2)  
**Fires:** After Step 3 completes  
**Error behavior:** `continueOnFail: true` — log warning, do not stop workflow

**Sheet:** AI EMPLOYEE ONBOARDING  
**Spreadsheet ID:** `1y2yofiiTOGhXhb47Hft4SuxaeA6N9_8RCjQ_jAQc50E`

**Columns appended (13 total, in order):**

| # | Column | Value |
|---|---|---|
| 1 | Timestamp | Auto-generated ISO timestamp |
| 2 | Full Name | From form |
| 3 | Personal Email | From form |
| 4 | Job Title | From form |
| 5 | Department | From form |
| 6 | Start Date | From form |
| 7 | Manager Name | From form |
| 8 | Manager Email | From form |
| 9 | Employment Type | From form |
| 10 | Work Location | From form |
| 11 | Equipment Needed | From form (joined as comma-separated string) |
| 12 | Onboarding Status | Hardcoded: `"Completed"` |
| 13 | 30-Day Plan | Claude output (or fallback text) |

---

## Step 5 — Follow-up Email with 30-Day Plan

**Node:** `Step 5: Follow-up Email with Plan`  
**Tool:** n8n Gmail node (OAuth2, sender: therealaustinkyle@gmail.com)  
**Fires:** After Step 4 completes  
**Error behavior:** `continueOnFail: true` — log error, do not stop workflow

**Inputs consumed:**
- `Full Name` (first name), `Personal Email` — from form trigger
- 30-day plan text — from Step 3 Claude output (or fallback)

**Email:**
- To: new hire's personal email
- Subject: `Your personalized 30-day plan at Kymap LLC, [First Name]`
- Body: HTML email with brief intro, full plan formatted cleanly, closing encouragement
- Template source: `tools/email-templates.js` → `followUpEmail()`

---

## Error Summary

| Step | Failure Mode | Behavior |
|---|---|---|
| Step 1 (Welcome Email) | Gmail send fails | Log error, continue — manager and plan steps still fire |
| Step 2 (Manager Email) | Gmail send fails | Log error, continue |
| Step 3 (Claude API) | API error / timeout | Downstream uses fallback: "Generation failed — manual review required" |
| Step 4 (Google Sheets) | Write fails | Log warning, continue — follow-up email still fires |
| Step 5 (Follow-up Email) | Gmail send fails | Log error — workflow completes with partial success |

---

## Credentials Required in n8n

After importing `onboarding-workflow.json`, configure these credentials in n8n Settings → Credentials:

1. **Gmail OAuth2** — name it `"Gmail account"`, authenticate with therealaustinkyle@gmail.com
2. **Google Sheets OAuth2** — name it `"Google Sheets account"`, same Google account
3. **Anthropic API Key** — set as n8n environment variable `ANTHROPIC_API_KEY` (Settings → Environment Variables)

---

## Test Data

| Field | Value |
|---|---|
| Full Name | Sarah Johnson |
| Personal Email | test@example.com |
| Job Title | Marketing Coordinator |
| Department | Marketing |
| Start Date | 2026-06-17 |
| Manager Name | Austin Kyle |
| Manager Email | therealaustinkyle@gmail.com |
| Employment Type | Full-time |
| Work Location | Remote |
| Equipment Needed | Laptop, Monitor |

> Use `test@example.com` as the new hire email during testing to avoid sending real emails to real addresses.
