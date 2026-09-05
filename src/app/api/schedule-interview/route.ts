import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { sendInterviewConfirmationEmail } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, candidateId, interviewId, scheduledTime, candidateName, candidateEmail } = body;

    // Action 1: Offer interview (Create row in 'interviews' table with status 'offered')
    if (action === 'offer') {
      let createdInterviewId = `int-${Date.now().toString().slice(-4)}`;

      if (isSupabaseConfigured() && candidateId) {
        const { data, error } = await supabaseServer
          .from('interviews')
          .insert({
            candidate_id: candidateId,
            status: 'offered'
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error inserting interview offer:', error);
        } else if (data) {
          createdInterviewId = data.id;
        }
      }

      return NextResponse.json({
        success: true,
        action: 'offer',
        interviewId: createdInterviewId,
        candidateId,
        availableSlots: [
          { label: 'Tomorrow at 10:00 AM EST', value: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00Z' },
          { label: 'Tomorrow at 02:00 PM EST', value: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:00:00Z' },
          { label: 'Day After at 11:00 AM EST', value: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T11:00:00Z' },
          { label: 'Day After at 04:00 PM EST', value: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T16:00:00Z' },
        ]
      });
    }

    // Action 2: Confirm interview slot
    if (action === 'confirm' || (!action && scheduledTime)) {
      const finalInterviewId = interviewId || `int-${Date.now().toString().slice(-4)}`;
      const finalTime = scheduledTime || new Date(Date.now() + 86400000).toISOString();
      let targetName = candidateName || 'Candidate';
      let targetEmail = candidateEmail || 'candidate@example.com';

      if (isSupabaseConfigured() && candidateId) {
        try {
          // Fetch candidate details if not passed directly
          const { data: candData } = await supabaseServer
            .from('candidates')
            .select('name, email')
            .eq('id', candidateId)
            .single();

          if (candData) {
            targetName = candData.name || targetName;
            targetEmail = candData.email || targetEmail;
          }

          // 1. Update interview row: scheduled_time & status = 'confirmed'
          if (interviewId) {
            await supabaseServer
              .from('interviews')
              .update({
                scheduled_time: finalTime,
                status: 'confirmed'
              })
              .eq('id', interviewId);
          } else {
            await supabaseServer
              .from('interviews')
              .insert({
                candidate_id: candidateId,
                scheduled_time: finalTime,
                status: 'confirmed'
              });
          }

          // 2. Update candidate row: status = 'interview_scheduled'
          await supabaseServer
            .from('candidates')
            .update({
              status: 'interview_scheduled'
            })
            .eq('id', candidateId);
        } catch (dbErr) {
          console.warn('Supabase DB error confirming interview:', dbErr);
        }
      }

      // 3. Dispatch Email Confirmation to candidate via Resend (or Nodemailer fallback)
      await sendInterviewConfirmationEmail({
        candidateEmail: targetEmail,
        candidateName: targetName,
        scheduledTime: finalTime
      });

      return NextResponse.json({
        success: true,
        action: 'confirm',
        candidateId,
        scheduledTime: finalTime,
        interviewStatus: 'confirmed',
        candidateStatus: 'interview_scheduled',
        emailDispatchedTo: targetEmail
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in schedule-interview API:', error);
    return NextResponse.json({ error: error.message || 'Error processing interview request' }, { status: 500 });
  }
}
