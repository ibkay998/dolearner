import '@testing-library/jest-dom';

// Configure React testing environment for act()
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
