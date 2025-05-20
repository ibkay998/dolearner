-- SQL function to create the challenge_tests table
CREATE OR REPLACE FUNCTION create_challenge_tests_table()
RETURNS void AS $$
BEGIN
  -- Create the challenge_tests table if it doesn't exist
  CREATE TABLE IF NOT EXISTS challenge_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    test_code TEXT NOT NULL,
    expected_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add an index on challenge_id for faster lookups
    CONSTRAINT fk_challenge FOREIGN KEY (challenge_id) REFERENCES challenges(id)
  );

  -- Create an index on challenge_id
  CREATE INDEX IF NOT EXISTS idx_challenge_tests_challenge_id ON challenge_tests(challenge_id);
END;
$$ LANGUAGE plpgsql;
