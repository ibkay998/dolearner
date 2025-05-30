"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { TestResult } from '@/utils/test-utils';
import { Challenge } from '@/data/challenge-types';
import { getChallengesByPath } from '@/data/challenges';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ArrowRight, Play, CheckCircle, XCircle, Clock, MemoryStick, Brain, Code } from 'lucide-react';
import { CodeEditor } from './code-editor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DSAChallengeProps {
  pathId: string;
  onBackToPathSelection: () => void;
  initialChallengeIndex?: number;
}

interface DSATestResult extends TestResult {
  executionTime?: number;
  memoryUsed?: number;
  actualOutput?: any;
  expectedOutput?: any;
}

export function DSAChallenge({ pathId, onBackToPathSelection, initialChallengeIndex = 0 }: DSAChallengeProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(initialChallengeIndex);
  const [code, setCode] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [testResults, setTestResults] = useState<DSATestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [challengeKey, setChallengeKey] = useState(`dsa-challenge-${0}`);

  // Load challenges for the DSA path
  useEffect(() => {
    const pathChallenges = getChallengesByPath(pathId);
    setChallenges(pathChallenges);

    if (pathChallenges.length > 0) {
      const challenge = pathChallenges[currentChallengeIndex];
      setCode(challenge?.initialCode || "");
      setChallengeKey(`dsa-challenge-${currentChallengeIndex}`);
    }
  }, [pathId, currentChallengeIndex]);

  const currentChallenge = challenges[currentChallengeIndex];

  const runTests = async () => {
    if (!currentChallenge || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running tests.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      const user = await supabase.auth.getUser();
      const response = await fetch('/api/test-dsa-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          code: code,
          userId: user.data.user?.id,
        }),
      });

      const result = await response.json();

      setTestResults(result.testResults || []);
      setIsCorrect(result.isCorrect || false);

      if (result.isCorrect) {
        toast({
          title: "Success!",
          description: `All ${result.passedTests}/${result.totalTests} tests passed!`,
        });
      } else {
        toast({
          title: "Tests Failed",
          description: `${result.passedTests || 0}/${result.totalTests || 0} tests passed. Keep trying!`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast({
        title: "Error",
        description: "Failed to run tests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!isCorrect) {
      toast({
        title: "Cannot Submit",
        description: "Please make sure all tests pass before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit solutions.",
          variant: "destructive",
        });
        return;
      }

      // Mark challenge as completed
      const { error } = await supabase
        .from('challenge_completions_new')
        .upsert({
          user_id: user.data.user.id,
          challenge_id: currentChallenge.id,
          submitted_code: code,
          completion_data: { testResults },
        });

      if (error) throw error;

      toast({
        title: "Solution Submitted!",
        description: "Your solution has been saved successfully.",
      });

      setShowCongratulations(true);
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      const newIndex = currentChallengeIndex + 1;
      setCurrentChallengeIndex(newIndex);
      router.push(`/challenges/${pathId}?challengeIndex=${newIndex}`);
    }
  };

  const handlePrevious = () => {
    if (currentChallengeIndex > 0) {
      const newIndex = currentChallengeIndex - 1;
      setCurrentChallengeIndex(newIndex);
      router.push(`/challenges/${pathId}?challengeIndex=${newIndex}`);
    }
  };

  if (!currentChallenge) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No DSA Challenges Found</h2>
            <p className="text-gray-600 mb-4">
              There are no DSA challenges available for this path yet.
            </p>
            <Button onClick={onBackToPathSelection}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Path Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBackToPathSelection}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Paths
          </Button>
          <div>
            <h1 className="text-2xl font-bold">DSA Challenges</h1>
            <p className="text-gray-600">
              Challenge {currentChallengeIndex + 1} of {challenges.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentChallengeIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentChallengeIndex === challenges.length - 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* DSA-specific layout with different design */}
      <div className="space-y-6">
        {/* Problem Statement Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-green-800">
                    {currentChallenge.title}
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Data Structures & Algorithms Challenge
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-green-200 text-green-700">
                Algorithm
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Problem Statement</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {currentChallenge.description}
              </p>

              {/* Example section */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">Examples:</h4>
                <div className="font-mono text-sm space-y-2">
                  {currentChallenge.id === 'two-sum' && (
                    <>
                      <div>
                        <span className="text-gray-600">Input:</span> nums = [2,7,11,15], target = 9<br/>
                        <span className="text-gray-600">Output:</span> [0,1]<br/>
                        <span className="text-gray-600">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].
                      </div>
                      <div className="border-t pt-2">
                        <span className="text-gray-600">Input:</span> nums = [3,2,4], target = 6<br/>
                        <span className="text-gray-600">Output:</span> [1,2]
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Editor and Test Results in a two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Code Editor - Takes 2/3 of the space */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Solution Editor
                    </CardTitle>
                    <CardDescription>
                      Implement your algorithm in JavaScript
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={runTests}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isRunning ? 'Running...' : 'Run Tests'}
                    </Button>

                    <Button
                      onClick={submitSolution}
                      disabled={!isCorrect}
                      variant={isCorrect ? "default" : "secondary"}
                      size="sm"
                      className={isCorrect ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Submit Solution
                        </>
                      ) : (
                        "Submit Solution"
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CodeEditor
                  key={challengeKey}
                  value={code}
                  onChange={setCode}
                  language="javascript"
                  height="500px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Test Results Panel - Takes 1/3 of the space */}
          <div className="xl:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="h-5 w-5" />
                  Test Results
                </CardTitle>
                <CardDescription>
                  {testResults.length > 0
                    ? `${testResults.filter(r => r.pass).length}/${testResults.length} tests passed`
                    : "Run tests to see results"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click "Run Tests" to execute your solution</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          result.pass
                            ? 'bg-green-50 border-l-green-400 border-green-200'
                            : 'bg-red-50 border-l-red-400 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {result.pass ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                Test Case {index + 1}
                              </span>
                              {(result as DSATestResult).executionTime && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round((result as DSATestResult).executionTime!)}ms
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 break-words">
                              {result.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Overall status */}
                    {testResults.length > 0 && (
                      <div className={`p-3 rounded-lg text-center ${
                        isCorrect
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-orange-100 text-orange-800 border border-orange-200'
                      }`}>
                        <div className="font-medium text-sm">
                          {isCorrect ? (
                            <>
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              All Tests Passed!
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 inline mr-1" />
                              Some Tests Failed
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Congratulations Dialog */}
      <AlertDialog open={showCongratulations} onOpenChange={setShowCongratulations}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎉 Congratulations!</AlertDialogTitle>
            <AlertDialogDescription>
              You've successfully solved "{currentChallenge.title}"!
              {currentChallengeIndex < challenges.length - 1
                ? " Ready for the next challenge?"
                : " You've completed all DSA challenges in this path!"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
            {currentChallengeIndex < challenges.length - 1 ? (
              <AlertDialogAction onClick={handleNext}>
                Next Challenge
              </AlertDialogAction>
            ) : (
              <AlertDialogAction onClick={onBackToPathSelection}>
                Back to Paths
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
