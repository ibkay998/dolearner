# Server-Side Testing with Supabase

This document explains how the server-side testing approach works in the DoLearner platform.

## Overview

The platform now uses a server-side approach to test user code submissions, which solves the issue with `act` not being available in production. Instead of running tests in the browser, code is sent to a Next.js API route that performs the testing on the server.

## Key Components

1. **API Routes**:
   - `/api/test-challenge`: Tests user code submissions
   - `/api/challenge-completions`: Manages challenge completion status

2. **Supabase Integration**:
   - Stores user data, challenge completions, and submissions
   - Provides authentication

3. **Server-Side Testing Utilities**:
   - `utils/server-test-utils.ts`: Contains utilities for testing code on the server

## Database Schema

The Supabase database includes the following tables:

- `users`: Stores user information
- `challenges`: Stores challenge details
- `challenge_completions`: Tracks which challenges users have completed
- `submissions`: Records all code submissions, including test results

## How It Works

1. When a user clicks "Check Solution", their code is sent to the `/api/test-challenge` endpoint.
2. The server compiles and validates the code.
3. If tests are available for the challenge, they are run on the server.
4. The test results are returned to the client and displayed to the user.
5. When a user submits a correct solution, it's stored in the `challenge_completions` table.

## Authentication

The platform includes a simple authentication system:

1. Users can sign up and sign in using email and password.
2. Authenticated users can track their progress across sessions.
3. Challenge completions are stored in Supabase for authenticated users.

## Setup Instructions

1. **Environment Variables**:
   Make sure you have a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

2. **Database Setup**:
   The database tables are created automatically when you first run the application.

3. **Populating Challenges**:
   Run the following command to populate the challenges in Supabase:
   ```
   pnpm run populate-challenges
   ```

## Troubleshooting

- If you encounter authentication issues, check that your Supabase project has email authentication enabled.
- If tests aren't running correctly, check the server logs for errors.
- If challenge completions aren't being saved, verify that the user is authenticated and the database tables are set up correctly.

## Future Improvements

- Add more sophisticated server-side testing capabilities
- Implement social authentication options
- Add admin dashboard for managing challenges
- Implement more detailed analytics on user progress
