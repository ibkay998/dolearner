-- Data Migration Script: Transfer existing data to new enhanced schema
-- This script safely migrates data from old tables to new enhanced tables

-- Step 1: Migrate existing challenges to new challenges table
INSERT INTO challenges_new (
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
    c.id as legacy_id,
    lp.id as path_id,
    c.title,
    c.description,
    c.instructions,
    c.starter_code,
    c.solution_code,
    COALESCE(c.difficulty, 'easy') as difficulty,
    COALESCE(c.category, 'component') as challenge_type,
    COALESCE(c.order_num, 0) as order_index,
    true as is_active,
    COALESCE(c.created_at, NOW()) as created_at,
    COALESCE(c.updated_at, NOW()) as updated_at
FROM challenges c
LEFT JOIN learning_paths lp ON (
    (c.path_id = 'react' AND lp.slug = 'react') OR
    (c.path_id = 'css' AND lp.slug = 'css')
)
WHERE NOT EXISTS (
    SELECT 1 FROM challenges_new cn WHERE cn.legacy_id = c.id
);

-- Step 2: Migrate existing challenge tests to new challenge tests table
INSERT INTO challenge_tests_new (
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
    cn.id as challenge_id,
    'unit' as test_type,
    ct.description,
    ct.test_code,
    ct.expected_result,
    '{}' as test_config,
    0 as order_index,
    true as is_active,
    COALESCE(ct.created_at, NOW()) as created_at,
    COALESCE(ct.updated_at, NOW()) as updated_at
FROM challenge_tests ct
JOIN challenges_new cn ON cn.legacy_id = ct.challenge_id
WHERE NOT EXISTS (
    SELECT 1 FROM challenge_tests_new ctn 
    WHERE ctn.challenge_id = cn.id AND ctn.test_code = ct.test_code
);

-- Step 3: Migrate existing user path enrollments to new table
INSERT INTO user_path_enrollments_new (
    user_id,
    path_id,
    enrolled_at,
    is_active,
    progress_data
)
SELECT 
    upe.user_id,
    lp.id as path_id,
    COALESCE(upe.enrolled_at, NOW()) as enrolled_at,
    COALESCE(upe.is_active, true) as is_active,
    '{}' as progress_data
FROM user_path_enrollments upe
LEFT JOIN learning_paths lp ON (
    (upe.path_id = 'react' AND lp.slug = 'react') OR
    (upe.path_id = 'css' AND lp.slug = 'css')
)
WHERE lp.id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_path_enrollments_new upen 
    WHERE upen.user_id = upe.user_id AND upen.path_id = lp.id
);

-- Step 4: Migrate existing challenge completions to new table
INSERT INTO challenge_completions_new (
    user_id,
    challenge_id,
    submitted_code,
    completed_at,
    completion_data
)
SELECT 
    cc.user_id,
    cn.id as challenge_id,
    cc.code as submitted_code,
    COALESCE(cc.completed_at, NOW()) as completed_at,
    '{}' as completion_data
FROM challenge_completions cc
JOIN challenges_new cn ON cn.legacy_id = cc.challenge_id
WHERE NOT EXISTS (
    SELECT 1 FROM challenge_completions_new ccn 
    WHERE ccn.user_id = cc.user_id AND ccn.challenge_id = cn.id
);

-- Step 5: Migrate existing submissions to new table
INSERT INTO submissions_new (
    user_id,
    challenge_id,
    code,
    is_correct,
    test_results,
    created_at
)
SELECT 
    s.user_id,
    cn.id as challenge_id,
    s.code,
    COALESCE(s.is_correct, false) as is_correct,
    s.test_results,
    COALESCE(s.created_at, NOW()) as created_at
FROM submissions s
JOIN challenges_new cn ON cn.legacy_id = s.challenge_id
WHERE NOT EXISTS (
    SELECT 1 FROM submissions_new sn 
    WHERE sn.user_id = s.user_id 
    AND sn.challenge_id = cn.id 
    AND sn.created_at = COALESCE(s.created_at, NOW())
);

-- Step 6: Create views for backward compatibility
CREATE OR REPLACE VIEW challenges_legacy AS
SELECT 
    legacy_id as id,
    (SELECT slug FROM learning_paths lp WHERE lp.id = cn.path_id) as path_id,
    title,
    description,
    instructions,
    starter_code as initial_code,
    solution_code,
    difficulty,
    challenge_type as category,
    order_index as order_num,
    created_at,
    updated_at
FROM challenges_new cn
WHERE is_active = true;

CREATE OR REPLACE VIEW challenge_tests_legacy AS
SELECT 
    ctn.id,
    cn.legacy_id as challenge_id,
    ctn.description,
    ctn.test_code,
    ctn.expected_result,
    ctn.created_at,
    ctn.updated_at
FROM challenge_tests_new ctn
JOIN challenges_new cn ON cn.id = ctn.challenge_id
WHERE ctn.is_active = true AND cn.is_active = true;

CREATE OR REPLACE VIEW user_path_enrollments_legacy AS
SELECT 
    upen.id,
    upen.user_id,
    lp.slug as path_id,
    upen.enrolled_at,
    upen.is_active
FROM user_path_enrollments_new upen
JOIN learning_paths lp ON lp.id = upen.path_id
WHERE upen.is_active = true AND lp.is_active = true;

CREATE OR REPLACE VIEW challenge_completions_legacy AS
SELECT 
    ccn.id,
    ccn.user_id,
    cn.legacy_id as challenge_id,
    ccn.submitted_code as code,
    ccn.completed_at
FROM challenge_completions_new ccn
JOIN challenges_new cn ON cn.id = ccn.challenge_id
WHERE cn.is_active = true;

CREATE OR REPLACE VIEW submissions_legacy AS
SELECT 
    sn.id,
    sn.user_id,
    cn.legacy_id as challenge_id,
    sn.code,
    sn.is_correct,
    sn.test_results,
    sn.created_at
FROM submissions_new sn
JOIN challenges_new cn ON cn.id = sn.challenge_id
WHERE cn.is_active = true;

-- Step 7: Create helper functions for common queries
CREATE OR REPLACE FUNCTION get_user_enrolled_paths(user_uuid UUID)
RETURNS TABLE (
    path_id UUID,
    path_name VARCHAR,
    path_slug VARCHAR,
    enrolled_at TIMESTAMP WITH TIME ZONE,
    progress_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lp.id,
        lp.name,
        lp.slug,
        upen.enrolled_at,
        upen.progress_data
    FROM user_path_enrollments_new upen
    JOIN learning_paths lp ON lp.id = upen.path_id
    WHERE upen.user_id = user_uuid 
    AND upen.is_active = true 
    AND lp.is_active = true
    ORDER BY lp.order_index;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_path_challenges(path_uuid UUID)
RETURNS TABLE (
    challenge_id UUID,
    legacy_id VARCHAR,
    title VARCHAR,
    description TEXT,
    difficulty VARCHAR,
    order_index INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cn.id,
        cn.legacy_id,
        cn.title,
        cn.description,
        cn.difficulty,
        cn.order_index
    FROM challenges_new cn
    WHERE cn.path_id = path_uuid 
    AND cn.is_active = true
    ORDER BY cn.order_index;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_challenge_progress(user_uuid UUID, path_uuid UUID)
RETURNS TABLE (
    challenge_id UUID,
    legacy_id VARCHAR,
    title VARCHAR,
    is_completed BOOLEAN,
    completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cn.id,
        cn.legacy_id,
        cn.title,
        (ccn.id IS NOT NULL) as is_completed,
        ccn.completed_at
    FROM challenges_new cn
    LEFT JOIN challenge_completions_new ccn ON ccn.challenge_id = cn.id AND ccn.user_id = user_uuid
    WHERE cn.path_id = path_uuid 
    AND cn.is_active = true
    ORDER BY cn.order_index;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Grant necessary permissions
GRANT SELECT ON challenges_legacy TO anon, authenticated;
GRANT SELECT ON challenge_tests_legacy TO anon, authenticated;
GRANT SELECT ON user_path_enrollments_legacy TO authenticated;
GRANT SELECT ON challenge_completions_legacy TO authenticated;
GRANT SELECT ON submissions_legacy TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_enrolled_paths(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_path_challenges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_challenge_progress(UUID, UUID) TO authenticated;
