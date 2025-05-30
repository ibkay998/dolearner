"use client";

import { Challenge } from '../challenge-types';

export const dsaChallenges: Challenge[] = [
  {
    id: "two-sum",
    pathId: "dsa",
    title: "1. Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    initialCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
    
}

// Example usage:
// twoSum([2,7,11,15], 9) should return [0,1]
// twoSum([3,2,4], 6) should return [1,2]`,
    solutionCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`,
    solutionMarker: "map.has(complement)",
    order: 1,
  },
  {
    id: "reverse-string",
    pathId: "dsa",
    title: "2. Reverse String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    initialCode: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
    // Your code here
    
}

// Example usage:
// reverseString(["h","e","l","l","o"]) should modify array to ["o","l","l","e","h"]
// reverseString(["H","a","n","n","a","h"]) should modify array to ["h","a","n","n","a","H"]`,
    solutionCode: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // Swap characters
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
}`,
    solutionMarker: "left < right",
    order: 2,
  },
  {
    id: "valid-parentheses",
    pathId: "dsa",
    title: "3. Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    initialCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Your code here
    
}

// Example usage:
// isValid("()") should return true
// isValid("()[]{}") should return true
// isValid("(]") should return false`,
    solutionCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    const stack = [];
    const mapping = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char in mapping) {
            // Closing bracket
            if (stack.length === 0 || stack.pop() !== mapping[char]) {
                return false;
            }
        } else {
            // Opening bracket
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
    solutionMarker: "stack.push(char)",
    order: 3,
  },
  {
    id: "maximum-subarray",
    pathId: "dsa",
    title: "4. Maximum Subarray",
    description:
      "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. This is a classic dynamic programming problem known as Kadane's algorithm.",
    initialCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Your code here
    
}

// Example usage:
// maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) should return 6 (subarray [4,-1,2,1])
// maxSubArray([1]) should return 1
// maxSubArray([5,4,-1,7,8]) should return 23`,
    solutionCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}`,
    solutionMarker: "Math.max(nums[i], maxEndingHere + nums[i])",
    order: 4,
  },
  {
    id: "binary-search",
    pathId: "dsa",
    title: "5. Binary Search",
    description:
      "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
    initialCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    // Your code here
    
}

// Example usage:
// search([-1,0,3,5,9,12], 9) should return 4
// search([-1,0,3,5,9,12], 2) should return -1`,
    solutionCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`,
    solutionMarker: "left <= right",
    order: 5,
  }
];
