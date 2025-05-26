import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=confirmation_failed`);
      }
      
      // Redirect to home page on successful confirmation
      return NextResponse.redirect(`${requestUrl.origin}/?confirmed=true`);
    } catch (error) {
      console.error('Unexpected error during auth callback:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=unexpected_error`);
    }
  }

  // No code provided, redirect to auth page
  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}
