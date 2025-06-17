import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ChallengeParams {
  pathSlug: string;
}

// GET endpoint to retrieve challenges for a specific learning path
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<ChallengeParams> }
) {
  try {
    const { pathSlug } = await params;

    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase not configured properly');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    if (!pathSlug) {
      return NextResponse.json(
        { error: 'Missing required parameter: pathSlug' },
        { status: 400 }
      );
    }

    // First get the learning path by slug to ensure it exists and get the path_id
    const { data: pathData, error: pathError } = await supabase
      .from('learning_paths')
      .select('id, name, slug, description')
      .eq('slug', pathSlug)
      .eq('is_active', true)
      .single();

    if (pathError) {
      console.error('Error fetching learning path:', pathError);
      return NextResponse.json(
        { error: `Learning path '${pathSlug}' not found` },
        { status: 404 }
      );
    }

    if (!pathData) {
      return NextResponse.json(
        { error: `Learning path '${pathSlug}' not found` },
        { status: 404 }
      );
    }

    // Then get challenges for this specific path
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges_new')
      .select(`
        id,
        legacy_id,
        path_id,
        title,
        description,
        instructions,
        starter_code,
        solution_code,
        difficulty,
        challenge_type,
        order_index,
        is_active,
        created_at,
        updated_at
      `)
      .eq('path_id', pathData.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      return NextResponse.json(
        { error: 'Failed to fetch challenges' },
        { status: 500 }
      );
    }

    // Return the path info and challenges
    return NextResponse.json({
      path: pathData,
      challenges: challenges || [],
      total: challenges?.length || 0
    });

  } catch (error) {
    console.error('Error in challenges API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
