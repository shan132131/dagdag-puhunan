import { Resend }  from 'resend';
import { logger }  from '../utils/logger.js';
import * as templates from '../emails/templates.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = `${process.env.EMAIL_FROM_NAME || 'DAGDAG PUHUNAN'} <${process.env.EMAIL_FROM || 'noreply@lgusanpedro.ph'}>`;

/**
 * Send a transactional email.
 * @param {object} opts
 * @param {string} opts.to        - Recipient email
 * @param {string} opts.subject   - Email subject
 * @param {string} opts.template  - Template name
 * @param {object} opts.data      - Template variables
 */
export const sendEmail = async ({ to, subject, template, data }) => {
  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === 'test') {
    logger.info(`[EMAIL SKIPPED] to:${to} subject:"${subject}"`);
    return;
  }

  try {
    const html = templates.render(template, data);

    const result = await resend.emails.send({
      from:    FROM,
      to:      [to],
      subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${subject}`, { id: result?.data?.id });
    return result;
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    // Don't throw — email failures should not break the main flow
  }
};
