import { NextRequest, NextResponse } from 'next/server';
import { DSAExecutionEngine, getDSATestCases, getDSAFunctionName } from '@/utils/dsa-execution-engine';
import { createClient } from '@supabase/supabase-js';
import { TestResult } from '@/utils/test-utils';

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { challengeId, code, userId } = await request.json();

    if (!challengeId || !code) {
      return NextResponse.json({
        isCorrect: false,
        testResults: [{
          pass: false,
          message: 'Challenge ID and code are required'
        }]
      });
    }

    // Initialize DSA execution engine
    const engine = new DSAExecutionEngine();
    
    // Get test cases for the challenge
    let testCases = getDSATestCases(challengeId);
    
    // Try to get additional test cases from database
    try {
      const { data: dbTestCases, error } = await supabase
        .from('challenge_tests_new')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('test_type', 'dsa_case')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (!error && dbTestCases && dbTestCases.length > 0) {
        // Convert database test cases to DSA test case format
        const additionalTestCases = dbTestCases.map(dbTest => ({
          id: dbTest.id,
          description: dbTest.description || 'Database test case',
          input_data: dbTest.input_data || [],
          expected_output: dbTest.expected_output,
          time_limit_ms: dbTest.time_limit_ms || 5000,
          memory_limit_mb: dbTest.memory_limit_mb || 128,
        }));
        
        // Combine hardcoded and database test cases
        testCases = [...testCases, ...additionalTestCases];
      }
    } catch (dbError) {
      console.warn('Failed to fetch database test cases:', dbError);
    }

    if (testCases.length === 0) {
      return NextResponse.json({
        isCorrect: false,
        testResults: [{
          pass: false,
          message: 'No test cases found for this challenge'
        }]
      });
    }

    // Get the function name for this challenge
    const functionName = getDSAFunctionName(challengeId);

    // Execute all test cases
    const testResults = await engine.executeAllTestCases(code, testCases, functionName);
    
    // Determine if the solution is correct (all tests must pass)
    const isCorrect = testResults.length > 0 && testResults.every(result => result.pass);

    // Store the submission in the database
    if (userId) {
      try {
        await supabase
          .from('submissions_new')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            code: code,
            is_correct: isCorrect,
            test_results: testResults,
          });
      } catch (error) {
        console.error('Error storing submission:', error);
      }
    }

    return NextResponse.json({
      isCorrect,
      testResults,
      totalTests: testResults.length,
      passedTests: testResults.filter(r => r.pass).length,
    });

  } catch (error) {
    console.error('Error testing DSA challenge:', error);
    return NextResponse.json({
      isCorrect: false,
      testResults: [{
        pass: false,
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
