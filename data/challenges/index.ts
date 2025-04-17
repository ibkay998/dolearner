"use client";

import { reactChallenges } from './react';
import { cssChallenges } from './css';
import { Challenge } from '../challenge-types';

// Combine all challenges from different paths
export const allChallenges: Challenge[] = [
  ...reactChallenges,
  ...cssChallenges,
];

// Get challenges by path ID
export const getChallengesByPath = (pathId: string): Challenge[] => {
  return allChallenges.filter(challenge => challenge.pathId === pathId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

// Get a specific challenge by ID
export const getChallengeById = (id: string): Challenge | undefined => {
  return allChallenges.find(challenge => challenge.id === id);
};
