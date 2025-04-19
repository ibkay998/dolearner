import { NextRequest, NextResponse } from 'next/server';
import { validateComponentCode, checkSolutionMarker, analyzeComponentCode } from '@/utils/server-test-utils';
import { getTestFunctionForChallenge } from '@/utils/challenge-test-utils';
import { challengeTests } from '@/tests/challenges';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { code, challengeId, userId } = await request.json();

    // Validate inputs
    if (!code || !challengeId) {
      return NextResponse.json(
        { error: 'Missing required fields: code and challengeId' },
        { status: 400 }
      );
    }

    // Get the challenge details from Supabase
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: `Challenge not found: ${challengeId}`, details: challengeError },
        { status: 404 }
      );
    }

    // Validate the component code
    const validation = validateComponentCode(code);
    if (!validation.isValid) {
      return NextResponse.json({
        isCorrect: false,
        testResults: [{
          pass: false,
          message: `Compilation error: ${validation.error}`
        }]
      });
    }

    // Get tests for the challenge
    const tests = challengeTests[challengeId as keyof typeof challengeTests];
    let testResults;
    let isCorrect = false;

    // First, try to use the specialized test function for this challenge
    const specializedTestFunction = getTestFunctionForChallenge(challengeId);

    if (specializedTestFunction) {
      // Use the specialized test function
      testResults = specializedTestFunction(code);
      // Consider it correct if all tests pass
      isCorrect = testResults.length > 0 && testResults.every(result => result.pass);
    } else if (!tests) {
      // No specialized test function and no client-side tests
      // Check if there's a solution marker
      if (challenge.solution_marker && challenge.solution_marker.trim() !== '') {
        // Fall back to the simple solution marker check
        const result = checkSolutionMarker(code, challenge.solution_marker);
        testResults = [result];
        isCorrect = result.pass;
      } else {
        // If no solution marker, do basic static analysis
        testResults = analyzeComponentCode(code, []);
        // Consider it correct if at least 2 basic checks pass
        isCorrect = testResults.length >= 2;
      }
    } else {
      // For server-side, we can't run the actual React tests that require a DOM
      // Instead, we'll do static analysis based on the challenge requirements

      // Extract key requirements from the solution code
      const requirements = [];

      // Add solution marker if it exists
      if (challenge.solution_marker && challenge.solution_marker.trim() !== '') {
        requirements.push(challenge.solution_marker);
      }

      // Add additional requirements based on challenge ID
      if (challengeId === 'button') {
        requirements.push('button');
      } else if (challengeId === 'counter') {
        requirements.push('useState');
      } else if (challengeId === 'data-fetching') {
        requirements.push('fetch');
        requirements.push('useState');
      }

      testResults = analyzeComponentCode(code, requirements);
      isCorrect = testResults.length > 0 && testResults.every(result => result.pass);
    }

    // If a userId is provided, store the submission in Supabase
    if (userId) {
      await supabase.from('submissions').insert({
        user_id: userId,
        challenge_id: challengeId,
        code,
        is_correct: isCorrect,
        test_results: testResults
      });

      // If the solution is correct, mark the challenge as completed
      if (isCorrect) {
        // Use upsert to handle the case where the user has already completed the challenge
        await supabase.from('challenge_completions').upsert({
          user_id: userId,
          challenge_id: challengeId,
          code
        }, {
          onConflict: 'user_id,challenge_id'
        });
      }
    }

    // Return the test results
    return NextResponse.json({
      isCorrect,
      testResults
    });
  } catch (error) {
    console.error('Error testing challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
