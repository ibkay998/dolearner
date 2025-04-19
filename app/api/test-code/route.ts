import { NextRequest, NextResponse } from 'next/server';
import { validateComponentCode, analyzeComponentCode } from '@/utils/server-test-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Missing required field: code' },
        { status: 400 }
      );
    }

    // Validate the component code
    const validation = validateComponentCode(code);
    if (!validation.isValid) {
      return NextResponse.json({
        isValid: false,
        error: validation.error
      });
    }

    // Perform basic static analysis
    const testResults = analyzeComponentCode(code, []);

    // Return the results
    return NextResponse.json({
      isValid: true,
      testResults,
      basicChecks: {
        returnsJSX: code.includes('return') && (code.includes('</') || code.includes('/>')),
        usesState: code.includes('useState'),
        usesSideEffects: code.includes('useEffect'),
        handlesInteractions: code.includes('onClick') || code.includes('onChange') || code.includes('onSubmit')
      }
    });
  } catch (error) {
    console.error('Error testing code:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
