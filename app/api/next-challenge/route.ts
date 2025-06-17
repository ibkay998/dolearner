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

    // Get user's enrolled paths
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('user_path_enrollments_new')
      .select(`
        path_id,
        path:learning_paths(id, slug, name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (enrollmentError) {
      console.error('Error fetching user enrollments:', enrollmentError);
      return NextResponse.json(
        { error: 'Failed to fetch user enrollments' },
        { status: 500 }
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        hasNextChallenge: false,
        message: "No learning paths enrolled. Please enroll in a learning path first."
      });
    }

    // Get the user's completed challenges
    const { data: completions, error } = await supabase
      .from('challenge_completions_new')
      .select('challenge_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching challenge completions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch challenge completions' },
        { status: 500 }
      );
    }

    const completedChallengeIds = new Set(completions?.map(c => c.challenge_id) || []);

    // Find next incomplete challenge across enrolled paths
    for (const enrollment of enrollments) {
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges_new')
        .select('id, legacy_id, title, description, order_index')
        .eq('path_id', enrollment.path_id)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (challengesError) {
        console.error('Error fetching challenges:', challengesError);
        continue;
      }

      const nextChallenge = challenges?.find(c => !completedChallengeIds.has(c.id));

      if (nextChallenge) {
        return NextResponse.json({
          hasNextChallenge: true,
          pathId: enrollment.path?.slug || 'react', // Fallback to react if slug is missing
          challengeIndex: nextChallenge.order_index,
          challenge: {
            id: nextChallenge.legacy_id,
            title: nextChallenge.title,
            description: nextChallenge.description
          }
        });
      }
    }

    // If we reach here, all challenges in all enrolled paths are completed
    return NextResponse.json({
      hasNextChallenge: false,
      message: 'All challenges completed! Congratulations!'
    });

  } catch (error) {
    console.error('Error finding next challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
