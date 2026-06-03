// Canonical HTML email templates for the AI Employee Onboarding Automation workflow.
// These functions are the source of truth for email content.
// The same HTML is used in the n8n Gmail nodes (see onboarding-workflow.json).

const BRAND_COLOR = "#0f172a";
const ACCENT_COLOR = "#6366f1";
const BG_COLOR = "#f8fafc";

function baseLayout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_COLOR};padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Kymap LLC</p>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">AI Automation</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f1f5f9;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                This email was sent by <strong>The Kymap LLC Team</strong>.<br>
                Kymap LLC · AI Automation Company
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function pill(text) {
  return `<span style="display:inline-block;background-color:#ede9fe;color:#6d28d9;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;">${text}</span>`;
}

function detailRow(label, value) {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${label}</p>
      <p style="margin:4px 0 0;font-size:15px;color:#1e293b;font-weight:500;">${value}</p>
    </td>
  </tr>`;
}

/**
 * Welcome email sent to the new hire immediately after form submission.
 * @param {Object} hire
 * @param {string} hire.fullName
 * @param {string} hire.jobTitle
 * @param {string} hire.department
 * @param {string} hire.startDate
 * @param {string} hire.managerName
 * @param {string} hire.workLocation
 * @param {string} hire.equipmentNeeded  comma-separated string
 */
function welcomeEmail(hire) {
  const firstName = hire.fullName.split(" ")[0];
  const equipmentList = hire.equipmentNeeded
    ? hire.equipmentNeeded
        .split(",")
        .map((e) => `<li style="margin-bottom:4px;">${e.trim()}</li>`)
        .join("")
    : "<li>To be confirmed</li>";

  const body = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${BRAND_COLOR};">
      Welcome to the team, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.6;">
      We're so excited to have you joining us. Here's everything you need to know before your first day.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${detailRow("Your Role", hire.jobTitle)}
      ${detailRow("Department", hire.department)}
      ${detailRow("Start Date", hire.startDate)}
      ${detailRow("Your Manager", hire.managerName)}
      ${detailRow("Work Location", pill(hire.workLocation))}
    </table>

    <div style="background-color:#f8fafc;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Equipment Being Prepared</p>
      <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">
        ${equipmentList}
      </ul>
    </div>

    <div style="background-color:#ede9fe;border-left:4px solid ${ACCENT_COLOR};border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:32px;">
      <p style="margin:0;font-size:14px;color:#4c1d95;line-height:1.6;">
        <strong>Coming up next:</strong> Watch your inbox — your personalized 30-day onboarding plan will arrive shortly with everything you need to hit the ground running.
      </p>
    </div>

    <p style="margin:0 0 8px;font-size:15px;color:#475569;line-height:1.6;">
      If you have any questions before your start date, don't hesitate to reach out to ${hire.managerName} directly.
    </p>
    <p style="margin:28px 0 0;font-size:15px;color:#1e293b;font-weight:600;">
      We can't wait to see what you'll build with us.<br>
      <span style="color:#64748b;font-weight:400;">— The Kymap LLC Team</span>
    </p>`;

  return baseLayout(`Welcome to Kymap LLC, ${firstName}!`, body);
}

/**
 * Internal notification sent to the hiring manager.
 * @param {Object} hire
 * @param {string} hire.fullName
 * @param {string} hire.jobTitle
 * @param {string} hire.department
 * @param {string} hire.startDate
 * @param {string} hire.managerName
 * @param {string} hire.managerEmail
 * @param {string} hire.employmentType
 * @param {string} hire.workLocation
 * @param {string} hire.equipmentNeeded
 */
function managerNotification(hire) {
  const firstName = hire.fullName.split(" ")[0];

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND_COLOR};">
      ${hire.fullName} has completed onboarding
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.6;">
      Hi ${hire.managerName}, your new team member has submitted their onboarding form. Here's a summary.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${detailRow("Full Name", hire.fullName)}
      ${detailRow("Job Title", hire.jobTitle)}
      ${detailRow("Department", hire.department)}
      ${detailRow("Start Date", hire.startDate)}
      ${detailRow("Employment Type", pill(hire.employmentType))}
      ${detailRow("Work Location", pill(hire.workLocation))}
      ${detailRow("Equipment Requested", hire.equipmentNeeded || "None specified")}
    </table>

    <div style="background-color:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:32px;">
      <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;">
        ✓ A welcome email has been sent to ${firstName} at their personal address.<br>
        ✓ A personalized 30-day onboarding plan will follow shortly.
      </p>
    </div>

    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
      No action is required from you at this time. This notification is for your records.
    </p>
    <p style="margin:28px 0 0;font-size:15px;color:#1e293b;font-weight:600;">
      — The Kymap LLC Team
    </p>`;

  return baseLayout(`${hire.fullName} — Onboarding Complete`, body);
}

/**
 * Follow-up email to the new hire containing their Claude-generated 30-day plan.
 * @param {Object} hire
 * @param {string} hire.fullName
 * @param {string} hire.jobTitle
 * @param {string} hire.department
 * @param {string} plan  Plain text plan from Claude (newlines preserved)
 */
function followUpEmail(hire, plan) {
  const firstName = hire.fullName.split(" ")[0];
  const planHtml = plan
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND_COLOR};">
      Your 30-day plan is ready, ${firstName} 🗺️
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.6;">
      We've put together a personalized onboarding plan to set you up for success in your first 30 days as <strong>${hire.jobTitle}</strong> in <strong>${hire.department}</strong>. Use this as your guide — your manager has a copy too.
    </p>

    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:28px;margin-bottom:32px;">
      <p style="margin:0;font-size:14px;color:#334155;line-height:1.9;white-space:pre-wrap;">${planHtml}</p>
    </div>

    <div style="background-color:#ede9fe;border-radius:8px;padding:20px 24px;margin-bottom:32px;">
      <p style="margin:0;font-size:14px;color:#4c1d95;line-height:1.6;">
        <strong>Pro tip:</strong> Save this email for reference. In your first week, focus on the orientation tasks — everything else will follow naturally.
      </p>
    </div>

    <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;">
      We're rooting for you. Welcome to Kymap LLC — let's build something great together.
    </p>
    <p style="margin:28px 0 0;font-size:15px;color:#1e293b;font-weight:600;">
      — The Kymap LLC Team
    </p>`;

  return baseLayout(`Your 30-Day Plan at Kymap LLC`, body);
}

module.exports = { welcomeEmail, managerNotification, followUpEmail };
