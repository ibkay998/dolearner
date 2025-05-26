import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST endpoint to migrate existing users to the new enrollment system
export async function POST() {
  try {
    // Get all users who have completed challenges but don't have enrollments
    const { data: usersWithCompletions, error: completionsError } = await supabase
      .from('challenge_completions')
      .select('user_id, challenge_id')
      .order('user_id');

    if (completionsError) {
      console.error('Error fetching challenge completions:', completionsError);
      return NextResponse.json(
        { error: 'Failed to fetch challenge completions' },
        { status: 500 }
      );
    }

    if (!usersWithCompletions || usersWithCompletions.length === 0) {
      return NextResponse.json({
        message: 'No users with completions found',
        migratedUsers: 0
      });
    }

    // Get all challenges to map challenge IDs to path IDs
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, path_id');

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      return NextResponse.json(
        { error: 'Failed to fetch challenges' },
        { status: 500 }
      );
    }

    // Create a map of challenge ID to path ID
    const challengeToPathMap = new Map<string, string>();
    challenges?.forEach(challenge => {
      challengeToPathMap.set(challenge.id, challenge.path_id);
    });

    // Group completions by user and determine which paths they should be enrolled in
    const userPathsMap = new Map<string, Set<string>>();

    usersWithCompletions.forEach(completion => {
      const pathId = challengeToPathMap.get(completion.challenge_id);
      if (pathId) {
        if (!userPathsMap.has(completion.user_id)) {
          userPathsMap.set(completion.user_id, new Set());
        }
        userPathsMap.get(completion.user_id)!.add(pathId);
      }
    });

    // Check which users already have enrollments
    const userIds = Array.from(userPathsMap.keys());
    const { data: existingEnrollments, error: enrollmentsError } = await supabase
      .from('user_path_enrollments')
      .select('user_id, path_id')
      .in('user_id', userIds);

    if (enrollmentsError) {
      console.error('Error fetching existing enrollments:', enrollmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch existing enrollments' },
        { status: 500 }
      );
    }

    // Create a set of existing user-path combinations
    const existingEnrollmentSet = new Set<string>();
    existingEnrollments?.forEach(enrollment => {
      existingEnrollmentSet.add(`${enrollment.user_id}-${enrollment.path_id}`);
    });

    // Prepare enrollments to insert
    const enrollmentsToInsert: Array<{
      user_id: string;
      path_id: string;
    }> = [];

    userPathsMap.forEach((pathIds, userId) => {
      pathIds.forEach(pathId => {
        const enrollmentKey = `${userId}-${pathId}`;
        if (!existingEnrollmentSet.has(enrollmentKey)) {
          enrollmentsToInsert.push({
            user_id: userId,
            path_id: pathId
          });
        }
      });
    });

    if (enrollmentsToInsert.length === 0) {
      return NextResponse.json({
        message: 'All users are already enrolled in appropriate paths',
        migratedUsers: 0,
        totalUsersChecked: userIds.length
      });
    }

    // Insert the new enrollments
    const { error: insertError } = await supabase
      .from('user_path_enrollments')
      .insert(enrollmentsToInsert);

    if (insertError) {
      console.error('Error inserting enrollments:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert enrollments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Successfully migrated users to enrollment system',
      migratedUsers: new Set(enrollmentsToInsert.map(e => e.user_id)).size,
      totalEnrollments: enrollmentsToInsert.length,
      totalUsersChecked: userIds.length
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during migration' },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    // Count users with completions
    const { count: usersWithCompletions, error: completionsError } = await supabase
      .from('challenge_completions')
      .select('user_id', { count: 'exact', head: true })
      .not('user_id', 'is', null);

    if (completionsError) {
      console.error('Error counting users with completions:', completionsError);
      return NextResponse.json(
        { error: 'Failed to count users with completions' },
        { status: 500 }
      );
    }

    // Count users with enrollments
    const { count: usersWithEnrollments, error: enrollmentsError } = await supabase
      .from('user_path_enrollments')
      .select('user_id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (enrollmentsError) {
      console.error('Error counting users with enrollments:', enrollmentsError);
      return NextResponse.json(
        { error: 'Failed to count users with enrollments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      usersWithCompletions: usersWithCompletions || 0,
      usersWithEnrollments: usersWithEnrollments || 0,
      migrationNeeded: (usersWithCompletions || 0) > (usersWithEnrollments || 0)
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error during status check' },
      { status: 500 }
    );
  }
}
