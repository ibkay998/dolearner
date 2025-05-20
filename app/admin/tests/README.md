# Challenge Tests System

This directory contains the test system for evaluating user solutions to challenges in the learning platform.

## How Tests Work

1. Tests are stored in the Supabase database in the `challenge_tests` table
2. Each test is associated with a specific challenge via the `challenge_id` field
3. Tests contain:
   - A description of what they're testing
   - The test code that evaluates the user's solution
   - An expected result (optional)

## Test Files

- `button-tests.ts`: Tests for the Button challenge
- `card-tests.ts`: Tests for the Card challenge
- `toggle-tests.ts`: Tests for the Toggle Switch challenge
- `counter-tests.ts`: Tests for the Counter challenge
- `form-tests.ts`: Tests for the Form challenge
- `all-tests.ts`: Exports all tests by challenge ID
- `test-templates.ts`: General test templates that can be used for any challenge

## Adding Tests

### Option 1: Using the Admin Interface

1. Go to the Admin Tests page (`/admin/tests`)
2. Select a challenge from the dropdown
3. Click on the "Add New Test" tab
4. You can choose from:
   - General templates (basic patterns that work for many challenges)
   - Challenge-specific tests (pre-written tests for the selected challenge)
5. Customize the test code if needed
6. Add a description and expected result
7. Click "Create Test"

### Option 2: Adding Tests Programmatically

1. Create a new file for your challenge tests (e.g., `my-challenge-tests.ts`)
2. Export an object with test functions (see existing test files for examples)
3. Add your tests to `all-tests.ts`
4. Run the populate script to add them to the database:

```bash
# Make sure your environment variables are set
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_KEY=your_service_key

# Run the script
npx ts-node scripts/populate-tests.ts
```

## Writing Good Tests

A good test should:

1. Be specific about what it's testing
2. Have a clear pass/fail condition
3. Provide helpful error messages
4. Be robust against minor variations in solutions

### Test Code Structure

```javascript
// Description of what the test is checking
const condition1 = componentCode.includes('something');
const condition2 = componentCode.includes('something else');

TestResult = {
  pass: condition1 && condition2,
  message: condition1 && condition2
    ? 'Success message explaining what was done correctly'
    : 'Error message explaining what's missing or incorrect'
};
```

## How Tests Are Run

When a user submits a solution:

1. The system fetches all tests for the challenge from the database
2. Each test is run against the user's code
3. The test sets a `TestResult` object with `pass` and `message` properties
4. If all tests pass, the solution is considered correct
5. The results are displayed to the user

## Troubleshooting

- If tests aren't showing up in the admin interface, check the database connection
- If tests aren't running correctly, check the test code for syntax errors
- If users are getting incorrect results, review the test logic to ensure it's correctly evaluating solutions
