import { NextRequest, NextResponse } from 'next/server';
import { DSAExecutionEngine, getDSATestCases, getDSAFunctionName } from '@/utils/dsa-execution-engine';
import { createClient } from '@supabase/supabase-js';
import { TestResult } from '@/utils/test-utils';

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const MAX_REQUEST_TIME = 30000; // 30 seconds max

  try {
    // Add timeout for the entire request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout - execution took too long'));
      }, MAX_REQUEST_TIME);
    });

    const executionPromise = async () => {
      const { challengeId, code, userId } = await request.json();

      // Validate inputs
      if (!challengeId || typeof challengeId !== 'string') {
        return NextResponse.json({
          isCorrect: false,
          testResults: [{
            pass: false,
            message: 'Valid challenge ID is required'
          }]
        });
      }

      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return NextResponse.json({
          isCorrect: false,
          testResults: [{
            pass: false,
            message: 'Code is required and cannot be empty'
          }]
        });
      }

      // Check code length to prevent extremely large submissions
      if (code.length > 50000) {
        return NextResponse.json({
          isCorrect: false,
          testResults: [{
            pass: false,
            message: 'Code is too long. Please keep your solution under 50,000 characters.'
          }]
        });
      }

      // Initialize DSA execution engine with stricter limits
      const engine = new DSAExecutionEngine(3000, 64); // 3 second timeout, 64MB memory

      // Get test cases for the challenge
      let testCases = getDSATestCases(challengeId);

      // Try to get additional test cases from database with timeout
      try {
        const dbPromise = supabase
          .from('challenge_tests_new')
          .select('*')
          .eq('challenge_id', challengeId)
          .eq('test_type', 'dsa_case')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        const dbTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database query timeout')), 5000);
        });

        const { data: dbTestCases, error } = await Promise.race([dbPromise, dbTimeout]) as any;

        if (!error && dbTestCases && dbTestCases.length > 0) {
          // Convert database test cases to DSA test case format
          const additionalTestCases = dbTestCases.map((dbTest: any) => ({
            id: dbTest.id,
            description: dbTest.description || 'Database test case',
            input_data: dbTest.input_data || [],
            expected_output: dbTest.expected_output,
            time_limit_ms: Math.min(dbTest.time_limit_ms || 3000, 5000), // Cap at 5 seconds
            memory_limit_mb: Math.min(dbTest.memory_limit_mb || 64, 128), // Cap at 128MB
          }));

          // Limit total test cases to prevent excessive execution time
          testCases = [...testCases, ...additionalTestCases].slice(0, 10);
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

      // Execute all test cases with overall timeout
      const testResults = await engine.executeAllTestCases(code, testCases, functionName);

      // Determine if the solution is correct (all tests must pass)
      const isCorrect = testResults.length > 0 && testResults.every(result => result.pass);

      return { testResults, isCorrect, challengeId, code, userId };
    };

    // Race between execution and timeout
    const result = await Promise.race([executionPromise(), timeoutPromise]);
    const { testResults, isCorrect, challengeId, code, userId } = result as any;

    // Store the submission in the database
    if (userId) {
      try {
        const submissionPromise = supabase
          .from('submissions_new')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            code: code,
            is_correct: isCorrect,
            test_results: testResults,
          });

        // Add timeout for database operation
        const dbTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database operation timeout')), 5000);
        });

        await Promise.race([submissionPromise, dbTimeout]);
      } catch (error) {
        console.error('Error storing submission:', error);
        // Don't fail the entire request if database storage fails
      }
    }

    const executionTime = Date.now() - startTime;
    console.log(`DSA challenge execution completed in ${executionTime}ms`);

    return NextResponse.json({
      isCorrect,
      testResults,
      totalTests: testResults.length,
      passedTests: testResults.filter((r: any) => r.pass).length,
      executionTime,
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('Error testing DSA challenge:', error, `(${executionTime}ms)`);

    return NextResponse.json({
      isCorrect: false,
      testResults: [{
        pass: false,
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      executionTime,
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
