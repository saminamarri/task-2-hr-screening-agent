import { NextResponse } from 'next/server';
import { sendGmailSmtpEmail, sendSlackNotification } from '@/lib/notifications';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateId, candidateName, candidateEmail, scheduledTime, customMessage, channel = 'all' } = body;

    if (!candidateName || !candidateEmail) {
      return NextResponse.json({ error: 'Candidate name and email are required.' }, { status: 400 });
    }

    const finalScheduledTime = scheduledTime || new Date(Date.now() + 86400000).toISOString();
    const gmailUser = process.env.GMAIL_USER || '';
    const gmailPass = process.env.GMAIL_APP_PASSWORD || '';
    const slackUrl = process.env.SLACK_WEBHOOK_URL || '';

    // 1. Dispatch Gmail SMTP Email Notification
    const emailResult = await sendGmailSmtpEmail({
      candidateEmail,
      candidateName,
      scheduledTime: finalScheduledTime,
      customMessage
    });

    // 2. Dispatch Slack Incoming Webhook Alert
    const slackResult = await sendSlackNotification({
      candidateName,
      title: customMessage || `Interview confirmed for ${new Date(finalScheduledTime).toLocaleString()}`,
      customMessage: `📢 *1-Click HR Alert*\n*Candidate:* ${candidateName} (${candidateEmail})\n*Status:* Interview Confirmation Sent\n*Schedule:* ${new Date(finalScheduledTime).toLocaleString()}`
    });

    // 3. Update candidate status in Supabase if candidateId exists
    if (isSupabaseConfigured() && candidateId) {
      try {
        await supabaseServer
          .from('candidates')
          .update({ status: 'interview_scheduled' })
          .eq('id', candidateId);
      } catch (err) {
        console.warn('Supabase DB status update skipped:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: '1-Click Notification Processed!',
      diagnostics: {
        gmailUserSet: Boolean(gmailUser && !gmailUser.includes('placeholder')),
        gmailPassSet: Boolean(gmailPass && !gmailPass.includes('placeholder')),
        slackUrlSet: Boolean(slackUrl && !slackUrl.includes('placeholder')),
        emailProviderUsed: emailResult?.provider,
        emailDetails: emailResult
      },
      candidate: { candidateId, candidateName, candidateEmail, scheduledTime: finalScheduledTime },
      dispatches: {
        email: emailResult,
        slack: slackResult
      }
    });
  } catch (error: any) {
    console.error('Error sending 1-click notification:', error);
    return NextResponse.json({ error: error.message || 'Error dispatching notifications.' }, { status: 500 });
  }
}
