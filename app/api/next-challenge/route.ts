import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findNextIncompleteChallenge } from '@/utils/challenge-navigation';
import { Challenge } from '@/data/challenge-types';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey
  });
}

const supabase = createClient(
  supabaseUrl!,
  supabaseServiceKey!
);

// GET endpoint to find the next incomplete challenge for a user
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase not configured properly - falling back to first challenge');
      // Fallback: return the first React challenge when Supabase is not configured
      return NextResponse.json({
        hasNextChallenge: true,
        pathId: 'react',
        challengeIndex: 0,
        challenge: {
          id: 'button',
          title: 'Button Component',
          description: 'Create a simple button component'
        }
      });
    }

    // Get the user ID from the query parameters
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Get the user's completed challenges
    const { data: completions, error } = await supabase
      .from('challenge_completions')
      .select('challenge_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching challenge completions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch challenge completions' },
        { status: 500 }
      );
    }

    // Extract completed challenge IDs
    const completedChallengeIds = completions?.map(c => c.challenge_id) || [];

    // Fetch all challenges from the database
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .order('order_num', { ascending: true });

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      return NextResponse.json(
        { error: 'Failed to fetch challenges' },
        { status: 500 }
      );
    }

    // Convert to Challenge type
    const allChallenges: Challenge[] = challengesData?.map(item => ({
      id: item.id,
      pathId: item.path_id,
      title: item.title,
      description: item.description,
      initialCode: item.initial_code,
      solutionCode: item.solution_code,
      solutionMarker: item.solution_marker,
      order: item.order_num
    })) || [];

    // Find the next incomplete challenge
    const nextChallenge = findNextIncompleteChallenge(allChallenges, completedChallengeIds);

    if (!nextChallenge) {
      return NextResponse.json({
        hasNextChallenge: false,
        message: 'All challenges completed! Congratulations!'
      });
    }

    return NextResponse.json({
      hasNextChallenge: true,
      pathId: nextChallenge.pathId,
      challengeIndex: nextChallenge.challengeIndex,
      challenge: {
        id: nextChallenge.challenge.id,
        title: nextChallenge.challenge.title,
        description: nextChallenge.challenge.description
      }
    });

  } catch (error) {
    console.error('Error finding next challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
