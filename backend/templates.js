// ============================================================
// DAGDAG PUHUNAN — Email Templates
// ============================================================

const BASE_STYLE = `
  font-family:'Segoe UI',Arial,sans-serif;
  max-width:600px;
  margin:0 auto;
  background:#ffffff;
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 4px 24px rgba(0,0,0,0.08);
`;

const header = (subtitle = '') => `
  <div style="background:linear-gradient(135deg,#16A34A,#22C55E);padding:32px 28px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:1px;">DAGDAG PUHUNAN</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;letter-spacing:2px;text-transform:uppercase;">ZERO INTEREST · LGU San Pedro, Laguna</p>
    ${subtitle ? `<p style="margin:12px 0 0;color:#fff;font-size:15px;">${subtitle}</p>` : ''}
  </div>
`;

const footer = () => `
  <div style="background:#F9FAFB;padding:20px 28px;text-align:center;border-top:1px solid #E5E7EB;">
    <p style="margin:0;color:#6B7280;font-size:11px;">
      This is an automated message from DAGDAG PUHUNAN, ZERO INTEREST Loan Management System.<br>
      LGU San Pedro, Laguna · Do not reply to this email.
    </p>
  </div>
`;

const infoRow = (label, value, color = '#111827') => `
  <tr>
    <td style="padding:8px 0;color:#6B7280;font-size:13px;width:40%;">${label}</td>
    <td style="padding:8px 0;color:${color};font-size:13px;font-weight:600;">${value}</td>
  </tr>
`;

const statusColor = (status) => {
  const map = {
    'Approved':'#16A34A','Active':'#16A34A','Released':'#16A34A','Closed':'#6B7280',
    'Pending':'#6B7280','Under Verification':'#2563EB','Under CI':'#7C3AED',
    'Rejected':'#DC2626','Overdue':'#D97706',
  };
  return map[status] || '#111827';
};

// ─── Template definitions ─────────────────────────────────────
const TEMPLATES = {

  application_received: ({ name, ref, amount, status }) => `
    <div style="${BASE_STYLE}">
      ${header('Application Received')}
      <div style="padding:28px;">
        <p style="color:#111827;font-size:15px;">Dear <strong>${name}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;">
          Your loan application has been received and is now being processed. Please keep your reference number for future inquiries.
        </p>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Reference Number</p>
          <p style="margin:8px 0 0;color:#16A34A;font-size:28px;font-weight:800;letter-spacing:2px;">${ref}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Loan Amount', `P${Number(amount).toLocaleString()}`,'#16A34A')}
          ${infoRow('Status', status, statusColor(status))}
          ${infoRow('Date Submitted', new Date().toLocaleDateString('en-PH',{dateStyle:'long'}))}
        </table>
        <p style="color:#374151;font-size:13px;margin-top:20px;">
          A Cooperative Officer will contact you within 3–5 business days to schedule a home visit for verification.
        </p>
      </div>
      ${footer()}
    </div>
  `,

  status_update: ({ name, ref, status, amount }) => `
    <div style="${BASE_STYLE}">
      ${header('Loan Status Update')}
      <div style="padding:28px;">
        <p style="color:#111827;font-size:15px;">Dear <strong>${name}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;">
          There is an update on your loan application <strong>${ref}</strong>.
        </p>
        <div style="background:${statusColor(status)}18;border:1px solid ${statusColor(status)}44;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Current Status</p>
          <p style="margin:8px 0 0;color:${statusColor(status)};font-size:24px;font-weight:800;">${status}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Reference', ref)}
          ${infoRow('Loan Amount', `P${Number(amount).toLocaleString()}`)}
          ${infoRow('Date Updated', new Date().toLocaleDateString('en-PH',{dateStyle:'long'}))}
        </table>
        ${status === 'Approved' ? `
          <div style="background:#DCFCE7;border-radius:8px;padding:14px;margin-top:16px;">
            <p style="margin:0;color:#166534;font-size:13px;">🎉 <strong>Congratulations!</strong> Your loan has been approved. Please await further instructions on the disbursement of funds.</p>
          </div>` : ''}
        ${status === 'Rejected' ? `
          <div style="background:#FEE2E2;border-radius:8px;padding:14px;margin-top:16px;">
            <p style="margin:0;color:#991B1B;font-size:13px;">We regret to inform you that your application did not meet the requirements at this time. You may re-apply after 30 days. Contact your cooperative officer for guidance.</p>
          </div>` : ''}
      </div>
      ${footer()}
    </div>
  `,

  payment_receipt: ({ name, ref, amount, balance, status, date }) => `
    <div style="${BASE_STYLE}">
      ${header('Payment Receipt')}
      <div style="padding:28px;">
        <p style="color:#111827;font-size:15px;">Dear <strong>${name}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;">
          Your payment has been successfully recorded for loan <strong>${ref}</strong>.
        </p>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:20px;margin:20px 0;">
          <table style="width:100%;border-collapse:collapse;">
            ${infoRow('Reference',        ref)}
            ${infoRow('Amount Paid',      `P${Number(amount).toLocaleString()}`, '#16A34A')}
            ${infoRow('Remaining Balance',`P${Number(balance).toLocaleString()}`, balance > 0 ? '#D97706' : '#16A34A')}
            ${infoRow('Loan Status',      status, statusColor(status))}
            ${infoRow('Payment Date',     date)}
          </table>
        </div>
        ${balance <= 0 ? `
          <div style="background:#DCFCE7;border-radius:8px;padding:14px;margin-top:8px;text-align:center;">
            <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">🎉 Congratulations! Your loan has been fully paid. Thank you!</p>
          </div>` : `
          <p style="color:#374151;font-size:13px;">Please continue making payments on your scheduled due dates.</p>`}
      </div>
      ${footer()}
    </div>
  `,

  overdue_reminder: ({ name, ref, balance, dueDate, daysOverdue }) => `
    <div style="${BASE_STYLE}">
      ${header('Payment Overdue Reminder')}
      <div style="padding:28px;">
        <p style="color:#111827;font-size:15px;">Dear <strong>${name}</strong>,</p>
        <div style="background:#FEF9C3;border:1px solid #FDE047;border-radius:10px;padding:16px;margin-bottom:20px;">
          <p style="margin:0;color:#713F12;font-size:13px;">⚠️ Your loan payment is <strong>${daysOverdue} days overdue</strong>. Penalty charges may apply. Please settle immediately.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Reference',     ref)}
          ${infoRow('Balance Due',   `P${Number(balance).toLocaleString()}`, '#DC2626')}
          ${infoRow('Original Due Date', new Date(dueDate).toLocaleDateString('en-PH',{dateStyle:'long'}))}
          ${infoRow('Days Overdue',  `${daysOverdue} days`, '#DC2626')}
        </table>
        <p style="color:#374151;font-size:13px;margin-top:16px;">
          Please contact your Cooperative Officer immediately to arrange payment. Further delays may result in additional penalty charges.
        </p>
      </div>
      ${footer()}
    </div>
  `,

  password_reset: ({ name, resetLink }) => `
    <div style="${BASE_STYLE}">
      ${header('Password Reset')}
      <div style="padding:28px;text-align:center;">
        <p style="color:#111827;font-size:15px;">Dear <strong>${name}</strong>,</p>
        <p style="color:#374151;font-size:14px;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="display:inline-block;margin:20px 0;padding:14px 32px;background:#16A34A;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">Reset Password</a>
        <p style="color:#9CA3AF;font-size:12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
      ${footer()}
    </div>
  `,
};

// ── Template renderer ─────────────────────────────────────────
export const render = (templateName, data) => {
  const tmpl = TEMPLATES[templateName];
  if (!tmpl) {
    throw new Error(`Email template "${templateName}" not found.`);
  }
  return tmpl(data);
};

export { TEMPLATES };
