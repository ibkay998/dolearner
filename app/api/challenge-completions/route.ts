import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET endpoint to retrieve a user's completed challenges
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the query parameters
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Query the new challenge_completions table with legacy ID mapping
    const { data, error } = await supabase
      .from('challenge_completions_new')
      .select(`
        completed_at,
        challenge:challenges_new(legacy_id)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching challenge completions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch challenge completions' },
        { status: 500 }
      );
    }

    // Return the completed challenge legacy IDs for backward compatibility
    return NextResponse.json({
      completedChallenges: data
        .map(item => item.challenge?.legacy_id)
        .filter(Boolean)
    });
  } catch (error) {
    console.error('Error in challenge-completions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
