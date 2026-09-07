import nodemailer from 'nodemailer';
import { Resend } from 'resend';

/**
 * Send Slack Notification via Incoming Webhook
 */
export async function sendSlackNotification({
  candidateName,
  score,
  title,
  customMessage
}: {
  candidateName: string;
  score?: number;
  title?: string;
  customMessage?: string;
}) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  const messageText = customMessage || (
    score !== undefined
      ? `🎯 *New Candidate Shortlisted*\n*Candidate:* ${candidateName}\n*Match Score:* ${score}%\n*Status:* Shortlisted for Interview`
      : `🔔 *HR Agent Notification*\n*Candidate:* ${candidateName}\n*Update:* ${title || 'Interview confirmation dispatched.'}`
  );

  if (slackWebhookUrl && !slackWebhookUrl.includes('placeholder')) {
    try {
      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText }),
      });

      if (response.ok) {
        console.log(`[SLACK SUCCESS] Webhook notification dispatched: "${messageText}"`);
        return { success: true, channel: 'slack', message: messageText };
      }
    } catch (err) {
      console.error('[SLACK ERROR] Failed to send Slack Webhook notification:', err);
    }
  }

  console.log(`[SLACK SIMULATION] Channel Webhook Message: "${messageText}"`);
  return { success: true, simulated: true, channel: 'slack', message: messageText };
}

export const sendSlackShortlistNotification = sendSlackNotification;

/**
 * Send Gmail SMTP Email Confirmation directly to candidate
 */
export async function sendGmailSmtpEmail({
  candidateEmail,
  candidateName,
  scheduledTime,
  customMessage
}: {
  candidateEmail: string;
  candidateName: string;
  scheduledTime: string;
  customMessage?: string;
}) {
  const formattedTime = new Date(scheduledTime).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const resendKey = process.env.RESEND_API_KEY;

  const subject = `Interview Confirmation: ${candidateName}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1e3a8a; font-size: 24px; margin: 0;">Interview Confirmation</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">HR Candidate Screening Agent</p>
      </div>

      <p style="font-size: 15px; color: #334155;">Hello <strong>${candidateName}</strong>,</p>
      
      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        ${customMessage || 'We are pleased to invite you for your upcoming interview round. Please find your confirmed schedule details below:'}
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Confirmed Schedule</p>
        <p style="margin: 6px 0 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">
          📅 ${formattedTime}
        </p>
      </div>

      <p style="font-size: 14px; color: #334155;">We look forward to speaking with you!</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
        Sent via ScreenAI HR Pro &bull; Automated Candidate Screening Platform
      </p>
    </div>
  `;

  // 1. Direct Gmail SMTP via Port 465 SSL
  if (gmailUser && gmailPass && !gmailUser.includes('placeholder') && !gmailPass.includes('placeholder')) {
    try {
      const cleanPass = gmailPass.replace(/\s+/g, '').trim();

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser.trim(),
          pass: cleanPass
        },
        connectionTimeout: 5000,
        greetingTimeout: 4000,
        socketTimeout: 5000
      });

      const info = await transporter.sendMail({
        from: `"HR Screening Team" <${gmailUser.trim()}>`,
        to: candidateEmail.trim(),
        subject,
        html: htmlContent
      });

      console.log(`[GMAIL SMTP SUCCESS] Sent email to ${candidateEmail}:`, info.messageId);
      return { success: true, provider: 'gmail_smtp', messageId: info.messageId };
    } catch (gmailErr: any) {
      console.error('[GMAIL SMTP ERROR] Failed to send via Gmail SMTP:', gmailErr);
    }
  }

  // 2. Resend API Fallback
  if (resendKey && !resendKey.includes('placeholder')) {
    try {
      const resend = new Resend(resendKey);
      const data = await resend.emails.send({
        from: 'HR Team <interviews@resend.dev>',
        to: [candidateEmail],
        subject,
        html: htmlContent
      });

      console.log(`[RESEND SUCCESS] Sent email to ${candidateEmail}:`, data);
      return { success: true, provider: 'resend', data };
    } catch (resendErr) {
      console.warn('[RESEND ERROR] Resend fallback failed:', resendErr);
    }
  }

  // 3. Fallback Stream Transport
  try {
    const streamTransporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });

    const info = await streamTransporter.sendMail({
      from: '"HR Team" <hr@company.com>',
      to: candidateEmail,
      subject,
      html: htmlContent
    });

    console.log(`[GMAIL SIMULATION] Prepared email to ${candidateEmail} for ${formattedTime}`);
    return { success: true, provider: 'simulation', info };
  } catch (err) {
    console.error('Error in email simulation:', err);
    return { success: false, error: err };
  }
}

export const sendInterviewConfirmationEmail = sendGmailSmtpEmail;
