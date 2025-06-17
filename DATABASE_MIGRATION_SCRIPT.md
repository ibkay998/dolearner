# Database Migration Script for DoLearner Platform

## Current State Analysis (From Supabase Query)

### ✅ **Already in Database:**
- **React Challenges**: 9/9 challenges migrated
  - button, card, counter, data-fetching, form, tabs, theme-switcher, todo-list, toggle
- **CSS Challenges**: 1/5+ challenges migrated  
  - box-model (only one present)
- **DSA Challenges**: 1/5+ challenges migrated
  - two-sum (only one present)

### ❌ **Missing from Database:**
- **CSS Challenges**: 4+ challenges from local files need migration
- **DSA Challenges**: 4+ challenges from local files need migration

### 🎯 **Learning Path IDs:**
- React: `e20c46a1-9b41-4da5-baea-d7f52cb6b058`
- CSS: `ee75a3a4-fd16-472a-842b-5d9522eac606`  
- DSA: `f82ff6b4-40dc-499c-9ab8-2fe9f3511905`

---

## Migration Script Implementation

### **Step 1: Create Migration Script**

Create `scripts/migrate-challenges-to-db.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { reactChallenges } from '../data/challenges/react';
import { cssChallenges } from '../data/challenges/css';
import { dsaChallenges } from '../data/challenges/dsa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Learning Path IDs from database
const LEARNING_PATHS = {
  react: 'e20c46a1-9b41-4da5-baea-d7f52cb6b058',
  css: 'ee75a3a4-fd16-472a-842b-5d9522eac606',
  dsa: 'f82ff6b4-40dc-499c-9ab8-2fe9f3511905'
};

interface LocalChallenge {
  id: string;
  pathId: string;
  title: string;
  description: string;
  initialCode: string;
  solutionCode: string;
  solutionMarker: string;
  order?: number;
}

async function migrateChallengesToDatabase() {
  console.log('🚀 Starting challenge migration to database...');

  // Get existing challenges from database
  const { data: existingChallenges } = await supabase
    .from('challenges_new')
    .select('legacy_id, path_id');

  const existingLegacyIds = new Set(
    existingChallenges?.map(c => c.legacy_id) || []
  );

  // Prepare challenges for migration
  const allChallenges = [
    ...reactChallenges.map(c => ({ ...c, pathId: 'react' })),
    ...cssChallenges.map(c => ({ ...c, pathId: 'css' })),
    ...dsaChallenges.map(c => ({ ...c, pathId: 'dsa' }))
  ];

  const challengesToMigrate = allChallenges.filter(
    challenge => !existingLegacyIds.has(challenge.id)
  );

  console.log(`📊 Found ${challengesToMigrate.length} challenges to migrate`);

  // Migrate challenges
  for (const challenge of challengesToMigrate) {
    const pathId = LEARNING_PATHS[challenge.pathId as keyof typeof LEARNING_PATHS];
    
    const challengeData = {
      legacy_id: challenge.id,
      path_id: pathId,
      title: challenge.title,
      description: challenge.description,
      instructions: challenge.description, // Use description as instructions
      starter_code: challenge.initialCode,
      solution_code: challenge.solutionCode,
      difficulty: 'easy', // Default difficulty
      challenge_type: challenge.pathId === 'dsa' ? 'algorithm' : 'component',
      order_index: challenge.order || 1,
      is_active: true
    };

    try {
      const { error } = await supabase
        .from('challenges_new')
        .insert(challengeData);

      if (error) {
        console.error(`❌ Failed to migrate ${challenge.id}:`, error);
      } else {
        console.log(`✅ Migrated: ${challenge.id} (${challenge.pathId})`);
      }
    } catch (err) {
      console.error(`❌ Error migrating ${challenge.id}:`, err);
    }
  }

  console.log('🎉 Migration completed!');
}

// Run migration
migrateChallengesToDatabase().catch(console.error);
```

### **Step 2: Create Package.json Script**

Add to `package.json`:

```json
{
  "scripts": {
    "migrate:challenges": "tsx scripts/migrate-challenges-to-db.ts",
    "audit:challenges": "tsx scripts/audit-challenges.ts"
  }
}
```

### **Step 3: Create Audit Script**

Create `scripts/audit-challenges.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { reactChallenges } from '../data/challenges/react';
import { cssChallenges } from '../data/challenges/css';
import { dsaChallenges } from '../data/challenges/dsa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditChallenges() {
  console.log('🔍 Auditing challenges: Local vs Database');

  // Get database challenges
  const { data: dbChallenges } = await supabase
    .from('challenges_new')
    .select('legacy_id, title, path_id')
    .order('path_id, order_index');

  // Local challenges
  const localChallenges = [
    ...reactChallenges.map(c => ({ ...c, pathId: 'react' })),
    ...cssChallenges.map(c => ({ ...c, pathId: 'css' })),
    ...dsaChallenges.map(c => ({ ...c, pathId: 'dsa' }))
  ];

  console.log('\n📊 SUMMARY:');
  console.log(`Local challenges: ${localChallenges.length}`);
  console.log(`Database challenges: ${dbChallenges?.length || 0}`);

  // Check missing challenges
  const dbLegacyIds = new Set(dbChallenges?.map(c => c.legacy_id) || []);
  const missingInDb = localChallenges.filter(c => !dbLegacyIds.has(c.id));

  console.log('\n❌ MISSING IN DATABASE:');
  missingInDb.forEach(c => {
    console.log(`  - ${c.id} (${c.pathId}): ${c.title}`);
  });

  // Check by path
  const pathCounts = {
    react: { local: reactChallenges.length, db: 0 },
    css: { local: cssChallenges.length, db: 0 },
    dsa: { local: dsaChallenges.length, db: 0 }
  };

  dbChallenges?.forEach(c => {
    if (c.path_id === 'e20c46a1-9b41-4da5-baea-d7f52cb6b058') pathCounts.react.db++;
    if (c.path_id === 'ee75a3a4-fd16-472a-842b-5d9522eac606') pathCounts.css.db++;
    if (c.path_id === 'f82ff6b4-40dc-499c-9ab8-2fe9f3511905') pathCounts.dsa.db++;
  });

  console.log('\n📈 BY LEARNING PATH:');
  Object.entries(pathCounts).forEach(([path, counts]) => {
    const status = counts.local === counts.db ? '✅' : '❌';
    console.log(`  ${status} ${path.toUpperCase()}: ${counts.db}/${counts.local} in database`);
  });
}

auditChallenges().catch(console.error);
```

---

## Component Updates Required

### **Step 4: Update Challenge Fetching Components**

#### Update `components/component-challenge.tsx`:

Replace lines 188-194:
```typescript
// OLD: Local file import
useEffect(() => {
  import('@/data/challenges').then(({ getChallengesByPath }) => {
    const pathChallenges = getChallengesByPath(pathId);
    setChallenges(pathChallenges);
  });
}, [pathId]);

// NEW: Database fetch
const { data: pathChallenges = [], isLoading } = useChallengesByPath(pathId);

useEffect(() => {
  if (pathChallenges.length > 0) {
    // Convert database format to local format
    const convertedChallenges = pathChallenges.map(dbChallenge => ({
      id: dbChallenge.legacy_id,
      pathId: pathId,
      title: dbChallenge.title,
      description: dbChallenge.description,
      initialCode: dbChallenge.starter_code,
      solutionCode: dbChallenge.solution_code,
      solutionMarker: dbChallenge.legacy_id // Use legacy_id as marker
    }));
    setChallenges(convertedChallenges);
  }
}, [pathChallenges, pathId]);
```

#### Update `components/dsa-challenge.tsx`:

Replace lines 54-63:
```typescript
// OLD: Local file import
useEffect(() => {
  const pathChallenges = getChallengesByPath(pathId);
  setChallenges(pathChallenges);
  // ...
}, [pathId, currentChallengeIndex]);

// NEW: Database fetch
const { data: pathChallenges = [], isLoading } = useChallengesByPath(pathId);

useEffect(() => {
  if (pathChallenges.length > 0) {
    const convertedChallenges = pathChallenges.map(dbChallenge => ({
      id: dbChallenge.legacy_id,
      pathId: pathId,
      title: dbChallenge.title,
      description: dbChallenge.description,
      initialCode: dbChallenge.starter_code,
      solutionCode: dbChallenge.solution_code,
      solutionMarker: dbChallenge.legacy_id
    }));
    setChallenges(convertedChallenges);
    
    if (convertedChallenges.length > 0) {
      const challenge = convertedChallenges[currentChallengeIndex];
      setCode(challenge?.initialCode || "");
      setChallengeKey(`dsa-challenge-${currentChallengeIndex}`);
    }
  }
}, [pathChallenges, pathId, currentChallengeIndex]);
```

---

## Execution Steps

### **Week 1 - Critical Migration**

1. **Install dependencies**: `npm install tsx` (for running TypeScript scripts)
2. **Create migration scripts** in `scripts/` folder
3. **Run audit**: `npm run audit:challenges`
4. **Run migration**: `npm run migrate:challenges`
5. **Update components** to fetch from database
6. **Test all challenge paths** work correctly
7. **Remove local file dependencies** from components

### **Validation Checklist**

- [ ] All local challenges migrated to database
- [ ] React challenges work with database fetching
- [ ] CSS challenges work with database fetching  
- [ ] DSA challenges work with database fetching
- [ ] Admin interface shows all challenges
- [ ] Challenge completions still work
- [ ] No broken challenge navigation

This migration ensures the platform is fully database-driven and sustainable for future growth!
