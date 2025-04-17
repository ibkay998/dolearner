"use client";

import { useState, useEffect } from 'react';

// Key for storing completed challenges in localStorage
const STORAGE_KEY = 'completed-challenges';

export function useCompletedChallenges() {
  // State to store the list of completed challenge IDs
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  
  // Load completed challenges from localStorage on component mount
  useEffect(() => {
    const loadCompletedChallenges = () => {
      try {
        const storedChallenges = localStorage.getItem(STORAGE_KEY);
        if (storedChallenges) {
          setCompletedChallenges(JSON.parse(storedChallenges));
        }
      } catch (error) {
        console.error('Error loading completed challenges from localStorage:', error);
      }
    };
    
    loadCompletedChallenges();
  }, []);
  
  // Save completed challenges to localStorage whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedChallenges));
    } catch (error) {
      console.error('Error saving completed challenges to localStorage:', error);
    }
  }, [completedChallenges]);
  
  // Function to mark a challenge as completed
  const markChallengeCompleted = (challengeId: string) => {
    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges([...completedChallenges, challengeId]);
    }
  };
  
  // Function to check if a challenge is completed
  const isChallengeCompleted = (challengeId: string): boolean => {
    return completedChallenges.includes(challengeId);
  };
  
  // Return the list of completed challenges and utility functions
  return {
    completedChallenges,
    markChallengeCompleted,
    isChallengeCompleted
  };
}
