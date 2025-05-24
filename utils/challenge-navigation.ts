import { Challenge } from '@/data/challenge-types';

export interface NextChallengeResult {
  pathId: string;
  challengeIndex: number;
  challenge: Challenge;
}

/**
 * Find the next incomplete challenge for a user
 * @param allChallenges - All available challenges
 * @param completedChallengeIds - Array of completed challenge IDs
 * @returns The next incomplete challenge or null if all are completed
 */
export function findNextIncompleteChallenge(
  allChallenges: Challenge[],
  completedChallengeIds: string[]
): NextChallengeResult | null {
  // Group challenges by path and sort by order
  const challengesByPath: { [pathId: string]: Challenge[] } = {};
  
  allChallenges.forEach(challenge => {
    if (!challengesByPath[challenge.pathId]) {
      challengesByPath[challenge.pathId] = [];
    }
    challengesByPath[challenge.pathId].push(challenge);
  });

  // Sort challenges within each path by order
  Object.keys(challengesByPath).forEach(pathId => {
    challengesByPath[pathId].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  // Find the first incomplete challenge across all paths
  for (const pathId of Object.keys(challengesByPath)) {
    const pathChallenges = challengesByPath[pathId];
    
    for (let i = 0; i < pathChallenges.length; i++) {
      const challenge = pathChallenges[i];
      
      if (!completedChallengeIds.includes(challenge.id)) {
        return {
          pathId,
          challengeIndex: i,
          challenge
        };
      }
    }
  }

  return null; // All challenges completed
}
