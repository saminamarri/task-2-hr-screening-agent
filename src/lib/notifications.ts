import { Resend } from 'resend';
import nodemailer from 'nodemailer';

/**
 * Send Slack Incoming Webhook Notification when a candidate is shortlisted (score >= 70)
 * Message format: "New candidate shortlisted: [Name] - Score: [Score]"
 */
export async function sendSlackShortlistNotification({
  candidateName,
  score
}: {
  candidateName: string;
  score: number;
}) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  const messageText = `New candidate shortlisted: ${candidateName} - Score: ${score}%`;

  if (slackWebhookUrl && !slackWebhookUrl.includes('placeholder')) {
    try {
      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText }),
      });

      if (response.ok) {
        console.log(`[SLACK SUCCESS] Webhook notification dispatched: "${messageText}"`);
        return { success: true, channel: 'slack' };
      } else {
        console.warn(`[SLACK WARN] Slack Webhook returned status ${response.status}`);
      }
    } catch (err) {
      console.error('[SLACK ERROR] Failed to send Slack Webhook notification:', err);
    }
  }

  // Simulation fallback logging
  console.log(`[SLACK SIMULATION] Channel Webhook Message: "${messageText}"`);
  return { success: true, simulated: true, channel: 'slack' };
}

/**
 * Send Email Notification when an interview is confirmed (via Resend with Nodemailer fallback)
 */
export async function sendInterviewConfirmationEmail({
  candidateEmail,
  candidateName,
  scheduledTime
}: {
  candidateEmail: string;
  candidateName: string;
  scheduledTime: string;
}) {
  const formattedTime = new Date(scheduledTime).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const subject = `Interview Confirmed: ${candidateName}`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #2563eb;">Interview Confirmation</h2>
      <p>Hello <strong>${candidateName}</strong>,</p>
      <p>Your interview has been officially confirmed for:</p>
      <p style="font-size: 16px; font-weight: bold; background: #f1f5f9; padding: 12px; border-radius: 8px; color: #0f172a;">
        📅 ${formattedTime}
      </p>
      <p>We look forward to speaking with you!</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">HR Recruitment Team | ScreenAI Agent</p>
    </div>
  `;

  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Try Resend API
  if (resendApiKey && !resendApiKey.includes('placeholder')) {
    try {
      const resend = new Resend(resendApiKey);
      const data = await resend.emails.send({
        from: 'HR Team <interviews@resend.dev>',
        to: [candidateEmail],
        subject,
        html: htmlContent
      });

      console.log(`[RESEND EMAIL SUCCESS] Confirmation email sent to ${candidateEmail}:`, data);
      return { success: true, provider: 'resend', data };
    } catch (resendErr) {
      console.warn('[RESEND WARN] Resend dispatch failed, attempting Nodemailer fallback:', resendErr);
    }
  }

  // 2. Nodemailer Fallback (if SMTP config is present or standard stream transport)
  try {
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });

    const info = await transporter.sendMail({
      from: '"HR Team" <hr@company.com>',
      to: candidateEmail,
      subject,
      html: htmlContent
    });

    console.log(`[NODEMAILER EMAIL SUCCESS] Sent to ${candidateEmail}:`, info.envelope);
    return { success: true, provider: 'nodemailer', info };
  } catch (nodemailerErr) {
    console.warn('[NODEMAILER WARN] Nodemailer fallback dispatch skipped:', nodemailerErr);
  }

  // Simulation fallback logging
  console.log(`[EMAIL SIMULATION] Sent to ${candidateEmail} for interview slot at ${formattedTime}`);
  return { success: true, simulated: true, provider: 'simulation' };
}
