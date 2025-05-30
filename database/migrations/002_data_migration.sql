-- Data Migration Script: Move data from legacy tables to new enhanced schema
-- This script safely migrates existing data to the new table structure

-- First, let's check if we have data to migrate
DO $$
DECLARE
    legacy_challenges_count INTEGER;
    legacy_tests_count INTEGER;
    legacy_completions_count INTEGER;
    legacy_enrollments_count INTEGER;
BEGIN
    -- Count records in legacy tables
    SELECT COUNT(*) INTO legacy_challenges_count FROM challenges;
    SELECT COUNT(*) INTO legacy_tests_count FROM challenge_tests;
    SELECT COUNT(*) INTO legacy_completions_count FROM challenge_completions;
    SELECT COUNT(*) INTO legacy_enrollments_count FROM user_path_enrollments;

    RAISE NOTICE 'Legacy data found:';
    RAISE NOTICE 'Challenges: %', legacy_challenges_count;
    RAISE NOTICE 'Tests: %', legacy_tests_count;
    RAISE NOTICE 'Completions: %', legacy_completions_count;
    RAISE NOTICE 'Enrollments: %', legacy_enrollments_count;
END $$;

-- Migrate challenges from legacy table to challenges_new
INSERT INTO challenges_new (
    id,
    legacy_id,
    path_id,
    title,
    description,
    instructions,
    starter_code,
    solution_code,
    difficulty,
    challenge_type,
    order_index,
    is_active,
    created_at,
    updated_at
)
SELECT
    id,
    COALESCE(legacy_id, id::text) as legacy_id,
    path_id,
    title,
    description,
    instructions,
    starter_code,
    solution_code,
    COALESCE(difficulty, 'medium') as difficulty,
    COALESCE(challenge_type, 'component') as challenge_type,
    COALESCE(order_index, 0) as order_index,
    COALESCE(is_active, true) as is_active,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM challenges
WHERE NOT EXISTS (
    SELECT 1 FROM challenges_new cn WHERE cn.id = challenges.id
);

-- Migrate challenge tests from legacy table to challenge_tests_new
INSERT INTO challenge_tests_new (
    id,
    challenge_id,
    test_type,
    description,
    test_code,
    expected_result,
    test_config,
    order_index,
    is_active,
    created_at,
    updated_at
)
SELECT
    id,
    challenge_id,
    COALESCE(test_type, 'unit') as test_type,
    description,
    test_code,
    expected_result,
    COALESCE(test_config, '{}') as test_config,
    COALESCE(order_index, 0) as order_index,
    COALESCE(is_active, true) as is_active,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM challenge_tests
WHERE NOT EXISTS (
    SELECT 1 FROM challenge_tests_new ctn WHERE ctn.id = challenge_tests.id
);

-- Migrate challenge completions from legacy table to challenge_completions_new
INSERT INTO challenge_completions_new (
    id,
    user_id,
    challenge_id,
    completed_at,
    time_taken,
    score,
    metadata
)
SELECT
    id,
    user_id,
    challenge_id,
    COALESCE(completed_at, NOW()) as completed_at,
    COALESCE(time_taken, 0) as time_taken,
    COALESCE(score, 100) as score,
    COALESCE(metadata, '{}') as metadata
FROM challenge_completions
WHERE NOT EXISTS (
    SELECT 1 FROM challenge_completions_new ccn WHERE ccn.id = challenge_completions.id
);

-- Migrate user path enrollments from legacy table to user_path_enrollments_new
INSERT INTO user_path_enrollments_new (
    id,
    user_id,
    path_id,
    enrolled_at,
    is_active,
    progress_data
)
SELECT
    id,
    user_id,
    path_id,
    COALESCE(enrolled_at, NOW()) as enrolled_at,
    COALESCE(is_active, true) as is_active,
    COALESCE(progress_data, '{}') as progress_data
FROM user_path_enrollments
WHERE NOT EXISTS (
    SELECT 1 FROM user_path_enrollments_new upen WHERE upen.id = user_path_enrollments.id
);

-- Create some sample data if no legacy data exists
DO $$
DECLARE
    react_path_id UUID;
    css_path_id UUID;
    sample_challenge_id UUID;
BEGIN
    -- Check if we have any learning paths, if not create sample ones
    IF NOT EXISTS (SELECT 1 FROM learning_paths LIMIT 1) THEN
        -- Insert sample learning paths
        INSERT INTO learning_paths (id, name, slug, description, difficulty, estimated_hours, is_active, order_index)
        VALUES
            (gen_random_uuid(), 'React Fundamentals', 'react', 'Learn React from basics to advanced concepts', 'beginner', 40, true, 1),
            (gen_random_uuid(), 'CSS Mastery', 'css', 'Master CSS layouts, animations, and modern techniques', 'intermediate', 30, true, 2),
            (gen_random_uuid(), 'Data Structures & Algorithms', 'dsa', 'Master fundamental algorithms and data structures through coding challenges', 'intermediate', 50, true, 3)
        RETURNING id INTO react_path_id;

        SELECT id INTO react_path_id FROM learning_paths WHERE slug = 'react' LIMIT 1;
        SELECT id INTO css_path_id FROM learning_paths WHERE slug = 'css' LIMIT 1;

        -- Insert sample challenges
        INSERT INTO challenges_new (id, legacy_id, path_id, title, description, instructions, starter_code, solution_code, difficulty, challenge_type, order_index, is_active)
        VALUES
            (gen_random_uuid(), 'react-1', react_path_id, 'Hello World Component', 'Create your first React component', 'Create a component that displays "Hello, World!"', 'export default function HelloWorld() {\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}', 'export default function HelloWorld() {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n    </div>\n  );\n}', 'easy', 'component', 1, true),
            (gen_random_uuid(), 'css-1', css_path_id, 'Flexbox Layout', 'Create a flexbox layout', 'Use flexbox to center content', '.container {\n  /* Your CSS here */\n}', '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}', 'easy', 'styling', 1, true)
        RETURNING id INTO sample_challenge_id;

        RAISE NOTICE 'Sample data created successfully';
    END IF;
END $$;

-- Update statistics
ANALYZE challenges_new;
ANALYZE challenge_tests_new;
ANALYZE challenge_completions_new;
ANALYZE user_path_enrollments_new;

-- Final migration report
DO $$
DECLARE
    new_challenges_count INTEGER;
    new_tests_count INTEGER;
    new_completions_count INTEGER;
    new_enrollments_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO new_challenges_count FROM challenges_new;
    SELECT COUNT(*) INTO new_tests_count FROM challenge_tests_new;
    SELECT COUNT(*) INTO new_completions_count FROM challenge_completions_new;
    SELECT COUNT(*) INTO new_enrollments_count FROM user_path_enrollments_new;

    RAISE NOTICE 'Migration completed. New table counts:';
    RAISE NOTICE 'Challenges: %', new_challenges_count;
    RAISE NOTICE 'Tests: %', new_tests_count;
    RAISE NOTICE 'Completions: %', new_completions_count;
    RAISE NOTICE 'Enrollments: %', new_enrollments_count;
END $$;
