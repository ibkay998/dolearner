"use client"

import { useState, useEffect, useRef } from "react"
import { CodeEditor } from "@/components/code-editor"
import { Preview } from "@/components/preview"
import { ChallengeNavigation } from "@/components/challenge-navigation"
import { CompletedChallengesSummary } from "@/components/completed-challenges-summary"
import { CongratulationsDialog } from "@/components/congratulations-dialog"
import { Button } from "@/components/ui/button"
import { Check, RefreshCw, AlertCircle, Code, Eye, ArrowLeft, LayoutDashboard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { testComponent, TestResult } from "@/utils/test-utils"
import { challengeTests } from "@/tests/challenges"
import { Challenge } from "@/data/challenge-types"
import { useCompletedChallenges } from "@/hooks/use-completed-challenges"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ComponentChallengeProps {
  pathId: string;
  onBackToPathSelection: () => void;
}

export function ComponentChallenge({ pathId, onBackToPathSelection }: ComponentChallengeProps) {
  // Get challenges for the selected path
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [code, setCode] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)
  // Solution feature temporarily disabled
  // const [showSolution, setShowSolution] = useState(false)
  // Add a key to force re-renders when challenge changes
  const [challengeKey, setChallengeKey] = useState(`challenge-${0}`)
  // State for test results
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  // State for preloaded components
  const [preloadedComponents, setPreloadedComponents] = useState<{[key: string]: boolean}>({})
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  // State for showing progress summary
  const [showProgressSummary, setShowProgressSummary] = useState(false)
  // State to force re-render of the progress summary
  const [progressSummaryKey, setProgressSummaryKey] = useState(0)
  // State for showing congratulations dialog
  const [showCongratulations, setShowCongratulations] = useState(false)
  // Use the completed challenges hook
  const { markChallengeCompleted, isChallengeCompleted } = useCompletedChallenges()
  // Use toast for notifications
  const { toast } = useToast()
  // Reference to test results section for scrolling
  const testResultsRef = useRef<HTMLDivElement>(null)

  // Load challenges for the selected path
  useEffect(() => {
    // Import challenges dynamically to avoid circular dependencies
    import('@/data/challenges').then(({ getChallengesByPath }) => {
      const pathChallenges = getChallengesByPath(pathId);
      setChallenges(pathChallenges);
    });
  }, [pathId]);

  const currentChallenge = challenges[currentChallengeIndex] || {
    id: '',
    pathId: '',
    title: 'Loading...',
    description: 'Loading challenge...',
    initialCode: '',
    solutionCode: '',
    solutionMarker: ''
  };

  // Preload all challenges when component mounts or challenges change
  useEffect(() => {
    if (challenges.length === 0) return;

    const preloadAllChallenges = async () => {
      // Create a new preloaded object to avoid state update issues
      const preloaded: {[key: string]: boolean} = {};

      // Mark current challenge as preloaded first for faster initial render
      preloaded[`challenge-${currentChallengeIndex}`] = true;
      setPreloadedComponents({...preloaded});

      // Use a small delay to ensure the current challenge is processed first
      setTimeout(() => {
        // Then preload all other challenges
        for (let i = 0; i < challenges.length; i++) {
          if (i !== currentChallengeIndex) {
            preloaded[`challenge-${i}`] = true;
          }
        }
        // Update state once with all preloaded challenges
        setPreloadedComponents({...preloaded});
      }, 100);
    };

    preloadAllChallenges();
  }, [challenges, currentChallengeIndex]);

  // Reset state when challenge changes
  useEffect(() => {
    setCode(currentChallenge.initialCode)
    setIsCorrect(false)
    // Solution feature temporarily disabled
    // setShowSolution(false)
    setTestResults([])
    // Update challenge key to force re-renders
    setChallengeKey(`challenge-${currentChallengeIndex}`)
    // Switch to code tab when changing challenges
    setActiveTab("code")
  }, [currentChallengeIndex, currentChallenge.initialCode])

  const handleCodeChange = (value: string) => {
    setCode(value)
    // Remove automatic correctness check - only set through tests
  }

  const runTests = async () => {
    // First, clear any existing test results to avoid duplicate renders
    setTestResults([])
    setIsRunningTests(true)

    try {
      // Get tests for the current challenge
      const tests = challengeTests[currentChallenge.id as keyof typeof challengeTests];
      console.log('⏳ running tests for:', currentChallenge.id, tests);

      if (!tests) {
        // Fall back to the simple solution marker check if no tests are available
        const markerFound = code.includes(currentChallenge.solutionMarker);
        setIsCorrect(markerFound);
        setTestResults([{
          pass: markerFound,
          message: markerFound
            ? 'Solution marker found!'
            : 'Solution marker not found. Make sure your solution includes the required elements.'
        }]);
      } else {
        // Run the tests with a timeout to prevent hanging
        const timeoutPromise = new Promise<TestResult[]>((_, reject) => {
          setTimeout(() => reject(new Error('Tests timed out after 10 seconds')), 10000);
        });

        try {
          // Race between the tests and the timeout
          const results = await Promise.race([
            testComponent(code, tests),
            timeoutPromise
          ]);
          console.log('🎯 runTests got back:', results);

          // Set test results immediately
          setTestResults(results);
          // Set isCorrect based on all tests passing
          const allTestsPassed = results.every(result => result.pass);
          setIsCorrect(allTestsPassed);
        } catch (testError) {
          console.error('Test execution error:', testError);
          setTestResults([{
            pass: false,
            message: `Test execution error: ${testError instanceof Error ? testError.message : 'Unknown error'}`
          }]);
          setIsCorrect(false);
        }
      }
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults([{
        pass: false,
        message: `Error running tests: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
      setIsCorrect(false);
    } finally {
      setIsRunningTests(false);
      // Close the confirmation modal after tests are run
      setShowConfirmModal(false);

      // Scroll to test results immediately
      if (testResultsRef.current) {
        testResultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Function to handle opening the confirmation modal
  const handleCheckSolution = () => {
    setShowConfirmModal(true);
  }

  const handleReset = () => {
    setCode(currentChallenge.initialCode)
    setIsCorrect(false)
    // Clear test results
    setTestResults([])
    // Force a re-render of the preview by updating the challenge key
    setChallengeKey(`challenge-${currentChallengeIndex}-${Date.now()}`)
  }

  const handleSubmit = () => {
    // Only allow submission if all tests pass
    if (isCorrect) {
      // Mark the challenge as completed immediately based on current state
      markChallengeCompleted(currentChallenge.id);

      // Increment the progress summary key to force a re-render when it's shown
      setProgressSummaryKey(prev => prev + 1);

      // Show a success toast notification
      toast({
        title: "Challenge Completed!",
        description: `Congratulations! You've successfully completed the "${currentChallenge.title}" challenge!`,
        variant: "default",
      })

      // Show congratulations dialog instead of automatically moving to next challenge
      setShowCongratulations(true)
    }
  }

  const handleNext = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(currentChallengeIndex - 1)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="container mx-auto py-6">
        {/* Back button and Progress button */}
        <div className="mb-6 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToPathSelection}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Paths
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // If we're about to show the progress summary, increment the key to force a fresh render
              if (!showProgressSummary) {
                setProgressSummaryKey(prev => prev + 1);
              }
              setShowProgressSummary(!showProgressSummary);
            }}
            className="flex items-center"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            {showProgressSummary ? "Hide Progress" : "Show Progress"}
          </Button>
        </div>

        {/* Progress Summary */}
        {showProgressSummary && (
          <CompletedChallengesSummary
            key={progressSummaryKey} // Add key to force re-render when a challenge is completed
            challenges={challenges}
            onSelectChallenge={(index) => {
              setCurrentChallengeIndex(index);
              setShowProgressSummary(false);
            }}
          />
        )}

        {/* Challenge header with title and actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">{currentChallenge.title}</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleReset} className="transition-colors">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              {/* Show Solution button temporarily hidden
              <Button variant="outline" size="sm" onClick={() => setShowSolution(!showSolution)} className="transition-colors">
                {showSolution ? "Hide Solution" : "Show Solution"}
              </Button>
              */}
              <Button
                variant="default"
                size="sm"
                onClick={handleCheckSolution}
                disabled={isRunningTests}
                className="transition-colors"
              >
                {isRunningTests ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Running Tests...
                  </>
                ) : (
                  "Check Solution"
                )}
              </Button>

              {/* Submit button moved to the top for better visibility */}
              {isCorrect && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isRunningTests}
                  className="bg-green-600 hover:bg-green-700 text-white transition-colors animate-pulse"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Submit Solution
                </Button>
              )}
            </div>
          </div>

          {/* Challenge description */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-gray-700">{currentChallenge.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The target component is shown on the right side for reference as you code.
            </p>
          </div>
        </div>

        {/* Main content area with code and preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left column: Code editor with tabs */}
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "code" | "preview")} className="w-full">
              <TabsList className="bg-muted w-full justify-start border-b">
                <TabsTrigger value="code" className="flex-1"><Code className="h-4 w-4 mr-2" />Your Code</TabsTrigger>
                {/* Solution tab temporarily hidden
                {showSolution && <TabsTrigger value="solution" className="flex-1">Solution</TabsTrigger>}
                */}
              </TabsList>
              <TabsContent value="code" className="p-0 m-0">
                <CodeEditor value={code} onChange={handleCodeChange} />
              </TabsContent>
              {/* Solution content temporarily hidden
              {showSolution && (
                <TabsContent value="solution" className="p-0 m-0">
                  <CodeEditor value={currentChallenge.solutionCode} readOnly={true} />
                </TabsContent>
              )}
              */}
            </Tabs>
          </div>

          {/* Right column: Preview section with both previews visible */}
          <div className="flex flex-col gap-6">
            {/* Target Component Preview */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm flex-1">
              <div className="bg-muted px-4 py-3 text-sm font-medium border-b flex items-center">
                <Eye className="h-4 w-4 mr-2" /> Target Component
              </div>
              <div className="p-6">
                <div className="mb-3 text-sm text-muted-foreground">This is what you're trying to build:</div>
                <div className="h-[200px] overflow-auto">
                  <Preview code={currentChallenge.solutionCode} id={`target-${challengeKey}`} />
                </div>
              </div>
            </div>

            {/* Your Code Preview */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm flex-1">
              <div className="bg-muted px-4 py-3 text-sm font-medium border-b flex items-center">
                <Eye className="h-4 w-4 mr-2" /> Your Preview
              </div>
              <div className="p-6">
                <div className="h-[200px] overflow-auto">
                  <Preview code={code} id={`user-${challengeKey}`} preloaded={preloadedComponents[`challenge-${currentChallengeIndex}`]} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Section - Always render the container but conditionally show content */}
        <div ref={testResultsRef} className="mb-6 bg-white border rounded-lg overflow-hidden shadow-sm"
          style={{ display: testResults.length > 0 ? 'block' : 'none' }}>

            <div className="bg-muted px-4 py-3 text-sm font-medium border-b flex justify-between items-center">
              <span>Test Results</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {testResults.filter(r => r.pass).length} of {testResults.length} tests passing
              </span>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${(testResults.filter(r => r.pass).length / testResults.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <ul className="space-y-3">
                {testResults.map((result, index) => (
                  <li key={index} className={`p-4 rounded-lg border ${result.pass ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-start">
                      {result.pass ? (
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className={`font-medium ${result.pass ? 'text-green-700' : 'text-red-700'}`}>
                          Test {index + 1}: {result.pass ? 'Passed' : 'Failed'}
                        </span>
                        <p className="text-sm mt-1 text-gray-600">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {testResults.length > 0 && (
                <div className={`mt-4 p-4 border rounded-lg ${isCorrect ? "bg-green-50 border-green-100" : "bg-blue-50 border-blue-100"}`}>
                  <div className="flex items-start">
                    <div className={isCorrect ? "text-green-700" : "text-blue-700"}>
                      {isCorrect ? (
                        <>
                          <p className="font-medium">All tests passed! 🎉</p>
                          <p className="text-sm mt-1">
                            Congratulations! Click the <strong>"Submit Solution"</strong> button above to mark this challenge as completed and move to the next one.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">Hint</p>
                          <p className="text-sm mt-1">
                            Review the failed tests above and make the necessary changes to your code. Click "Check Solution" again when you're ready.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        <div className="sticky bottom-0 bg-white border-t py-3 mt-auto -mx-6 px-6 shadow-md">
          <div className="container mx-auto">
            <ChallengeNavigation
              currentIndex={currentChallengeIndex}
              total={challenges.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isCompleted={isChallengeCompleted(currentChallenge.id)}
            />
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check your solution?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you ready to check your solution for the "{currentChallenge.title}" challenge?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRunningTests}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                runTests();
                // No need to manually close the dialog as we do it in the runTests function
              }}
              disabled={isRunningTests}
            >
              {isRunningTests ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Running Tests...
                </>
              ) : (
                "Check Solution"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Congratulations Dialog */}
      <CongratulationsDialog
        isOpen={showCongratulations}
        onClose={() => {
          setShowCongratulations(false);
          // After closing the congratulations dialog, move to the next challenge if available
          if (currentChallengeIndex < challenges.length - 1) {
            handleNext();
          }
        }}
        challengeTitle={currentChallenge.title}
        isLastChallenge={currentChallengeIndex === challenges.length - 1}
      />
    </div>
  )
}

