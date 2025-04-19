import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Test the Supabase connection by fetching challenges
    const { data, error } = await supabase
      .from('challenges')
      .select('id, title')
      .limit(10);

    if (error) {
      console.error('Error fetching challenges:', error);
      return NextResponse.json(
        { error: 'Failed to fetch challenges', details: error },
        { status: 500 }
      );
    }

    // Return the challenges
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      challenges: data,
      env: {
        supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
        supabaseServiceKey: supabaseServiceKey ? 'Set' : 'Not set'
      }
    });
  } catch (error) {
    console.error('Error in test-supabase API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
