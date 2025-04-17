"use client";

import { TestResult } from '@/utils/test-utils';

export interface Challenge {
  id: string;
  pathId: string; // The learning path this challenge belongs to
  title: string;
  description: string;
  initialCode: string;
  solutionCode: string;
  solutionMarker: string; // A unique string that should be in the solution (legacy approach)
  tests?: Array<(component: any) => Promise<TestResult>>; // Test functions for the challenge
  order?: number; // Optional order within the path
}
