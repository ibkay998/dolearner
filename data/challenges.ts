"use client";

// Re-export from the new structure
export * from './challenges/index';

// For backward compatibility
import { allChallenges } from './challenges/index';
export const challenges = allChallenges;
