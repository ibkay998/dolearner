import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET endpoint to retrieve tests for a challenge
export async function GET(request: NextRequest) {
  try {
    // Get the challenge ID from the query parameters
    const challengeId = request.nextUrl.searchParams.get('challengeId');

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Missing required parameter: challengeId' },
        { status: 400 }
      );
    }

    try {
      // Query the challenge_tests table for the challenge's tests
      const { data, error } = await supabase
        .from('challenge_tests')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: true });

      if (error) {
        // If the table doesn't exist, return an empty array
        if (error.message && error.message.includes('does not exist')) {
          console.log('challenge_tests table does not exist yet, returning empty array');
          return NextResponse.json({ tests: [] });
        }

        console.error('Error fetching challenge tests:', error);
        return NextResponse.json(
          { error: 'Failed to fetch challenge tests' },
          { status: 500 }
        );
      }

      // Return the tests
      return NextResponse.json({ tests: data });
    } catch (error) {
      console.error('Error in try/catch block:', error);
      // Return an empty array in case of any error
      return NextResponse.json({ tests: [] });
    }
  } catch (error) {
    console.error('Error in GET /api/challenge-tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new test for a challenge
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { challengeId, description, testCode, expectedResult } = await request.json();

    // Validate inputs
    if (!challengeId || !description || !testCode) {
      return NextResponse.json(
        { error: 'Missing required fields: challengeId, description, testCode' },
        { status: 400 }
      );
    }

    let testData = null;

    try {
      // Try to insert the test into the database
      const { data, error } = await supabase
        .from('challenge_tests')
        .insert({
          challenge_id: challengeId,
          description,
          test_code: testCode,
          expected_result: expectedResult || null
        })
        .select();

      if (error) {
        // If the table doesn't exist, try to create it
        if (error.message && error.message.includes('does not exist')) {
          console.log('challenge_tests table does not exist, attempting to create it...');

          // Create the table
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `
              CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

              CREATE TABLE IF NOT EXISTS challenge_tests (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                challenge_id TEXT NOT NULL,
                description TEXT NOT NULL,
                test_code TEXT NOT NULL,
                expected_result JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );

              CREATE INDEX IF NOT EXISTS idx_challenge_tests_challenge_id ON challenge_tests(challenge_id);
            `
          });

          if (createError) {
            console.error('Error creating challenge_tests table:', createError);
            return NextResponse.json(
              { error: 'Failed to create challenge_tests table' },
              { status: 500 }
            );
          }

          // Try to insert again
          const { data: retryData, error: retryError } = await supabase
            .from('challenge_tests')
            .insert({
              challenge_id: challengeId,
              description,
              test_code: testCode,
              expected_result: expectedResult || null
            })
            .select();

          if (retryError) {
            console.error('Error creating challenge test after table creation:', retryError);
            return NextResponse.json(
              { error: 'Failed to create challenge test after table creation' },
              { status: 500 }
            );
          }

          testData = retryData?.[0] || null;
        } else {
          console.error('Error creating challenge test:', error);
          return NextResponse.json(
            { error: 'Failed to create challenge test' },
            { status: 500 }
          );
        }
      } else {
        // If no error, set the test data
        testData = data?.[0] || null;
      }
    } catch (error) {
      console.error('Error in try/catch block:', error);
      return NextResponse.json(
        { error: 'Failed to create challenge test' },
        { status: 500 }
      );
    }

    // Return the created test
    return NextResponse.json({ test: testData }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/challenge-tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update an existing test
export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const { id, description, testCode, expectedResult } = await request.json();

    // Validate inputs
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Prepare the update data
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (testCode !== undefined) updateData.test_code = testCode;
    if (expectedResult !== undefined) updateData.expected_result = expectedResult;
    updateData.updated_at = new Date();

    // Update the test in the database
    const { data, error } = await supabase
      .from('challenge_tests')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating challenge test:', error);
      return NextResponse.json(
        { error: 'Failed to update challenge test' },
        { status: 500 }
      );
    }

    // Return the updated test
    return NextResponse.json({ test: data[0] });
  } catch (error) {
    console.error('Error in PUT /api/challenge-tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a test
export async function DELETE(request: NextRequest) {
  try {
    // Get the test ID from the query parameters
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Delete the test from the database
    const { error } = await supabase
      .from('challenge_tests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting challenge test:', error);
      return NextResponse.json(
        { error: 'Failed to delete challenge test' },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/challenge-tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
