import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { sendCvUploadNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const file = formData.get('file') as File | null;

    if (!name || !email) {
      return NextResponse.json({ error: 'Candidate name and email are required.' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Please upload a PDF or DOCX file.' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    // Extract text based on file format
    if (fileName.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || '';
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const docxResult = await mammoth.extractRawText({ buffer });
      extractedText = docxResult.value || '';
    } else {
      // Fallback for plain text files
      extractedText = buffer.toString('utf-8');
    }

    const cleanCvText = extractedText.replace(/\r\n/g, '\n').trim();

    if (!cleanCvText) {
      return NextResponse.json({ error: 'Could not extract text from the uploaded document.' }, { status: 400 });
    }

    let candidateId = `cand-${Date.now().toString().slice(-4)}`;

    // Persist candidate into Supabase "candidates" table with status "pending"
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseServer
          .from('candidates')
          .insert({
            name,
            email,
            phone: '+1 (555) 019-2831',
            cv_text: cleanCvText,
            status: 'pending'
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error inserting candidate:', error);
        } else if (data) {
          candidateId = data.id;
        }
      } catch (dbErr) {
        console.warn('Supabase DB operation skipped/failed:', dbErr);
      }
    }

    // Trigger instant email notifications: (1) To Candidate and (2) To HR Manager
    try {
      await sendCvUploadNotification({
        candidateEmail: email,
        candidateName: name,
        fileName: file.name
      });
    } catch (emailErr) {
      console.warn('Non-blocking CV upload notification error:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Candidate CV uploaded and text extracted successfully.',
      candidate: {
        id: candidateId,
        name,
        email,
        cv_text: cleanCvText,
        status: 'pending',
        fileName: file.name,
        extractedLength: cleanCvText.length
      }
    });
  } catch (error: any) {
    console.error('Error processing CV upload:', error);
    return NextResponse.json({ error: error.message || 'Error processing uploaded file.' }, { status: 500 });
  }
}
