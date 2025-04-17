"use client"

import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/code-editor"
import { Preview } from "@/components/preview"
import { ChallengeNavigation } from "@/components/challenge-navigation"
import { Button } from "@/components/ui/button"
import { Check, RefreshCw, AlertCircle, Code, Eye, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { testComponent, TestResult } from "@/utils/test-utils"
import { challengeTests } from "@/tests/challenges"
import { Challenge } from "@/data/challenge-types"

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
  const [showSolution, setShowSolution] = useState(false)
  // Add a key to force re-renders when challenge changes
  const [challengeKey, setChallengeKey] = useState(`challenge-${0}`)
  // State for test results
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  // State for preloaded components
  const [preloadedComponents, setPreloadedComponents] = useState<{[key: string]: boolean}>({})
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")

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
      const preloaded: {[key: string]: boolean} = {};

      // Mark current challenge as preloaded first for faster initial render
      preloaded[`challenge-${currentChallengeIndex}`] = true;
      setPreloadedComponents(preloaded);

      // Then preload all other challenges
      for (let i = 0; i < challenges.length; i++) {
        if (i !== currentChallengeIndex) {
          preloaded[`challenge-${i}`] = true;
          setPreloadedComponents({...preloaded});
        }
      }
    };

    preloadAllChallenges();
  }, [challenges, currentChallengeIndex]);

  // Reset state when challenge changes
  useEffect(() => {
    setCode(currentChallenge.initialCode)
    setIsCorrect(false)
    setShowSolution(false)
    setTestResults([])
    // Update challenge key to force re-renders
    setChallengeKey(`challenge-${currentChallengeIndex}`)
    // Switch to code tab when changing challenges
    setActiveTab("code")
  }, [currentChallengeIndex, currentChallenge.initialCode])

  const handleCodeChange = (value: string) => {
    setCode(value)
    // Legacy check - we'll keep this for backward compatibility
    setIsCorrect(value.includes(currentChallenge.solutionMarker))
  }

  const runTests = async () => {
    setIsRunningTests(true)

    try {
      // Get tests for the current challenge
      const tests = challengeTests[currentChallenge.id as keyof typeof challengeTests];

      if (!tests) {
        // Fall back to the simple solution marker check if no tests are available
        setIsCorrect(code.includes(currentChallenge.solutionMarker))
        setTestResults([{
          pass: code.includes(currentChallenge.solutionMarker),
          message: code.includes(currentChallenge.solutionMarker)
            ? 'Solution marker found!'
            : 'Solution marker not found. Make sure your solution includes the required elements.'
        }])
        return;
      }

      // Run the tests
      const results = await testComponent(code, tests);
      setTestResults(results);

      // Set isCorrect based on all tests passing
      const allTestsPassed = results.every(result => result.pass);
      setIsCorrect(allTestsPassed);
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults([{
        pass: false,
        message: `Error running tests: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
      setIsCorrect(false);
    } finally {
      setIsRunningTests(false);
    }
  }

  const handleReset = () => {
    setCode(currentChallenge.initialCode)
    setIsCorrect(false)
    setTestResults([])
  }

  const handleSubmit = () => {
    // Only allow submission if all tests pass
    if (isCorrect) {
      // Run tests one more time to be sure
      runTests().then(() => {
        if (isCorrect) {
          // Show a success message
          alert(`Congratulations! You've successfully completed the "${currentChallenge.title}" challenge!`)

          // Automatically move to the next challenge if available
          if (currentChallengeIndex < challenges.length - 1) {
            handleNext()
          }
        }
      })
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
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToPathSelection}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Paths
          </Button>
        </div>

        {/* Challenge header with title and actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">{currentChallenge.title}</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleReset} className="transition-colors">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSolution(!showSolution)} className="transition-colors">
                {showSolution ? "Hide Solution" : "Show Solution"}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={runTests}
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
                  className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Submit
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
                {showSolution && <TabsTrigger value="solution" className="flex-1">Solution</TabsTrigger>}
              </TabsList>
              <TabsContent value="code" className="p-0 m-0">
                <CodeEditor value={code} onChange={handleCodeChange} />
              </TabsContent>
              {showSolution && (
                <TabsContent value="solution" className="p-0 m-0">
                  <CodeEditor value={currentChallenge.solutionCode} readOnly={true} />
                </TabsContent>
              )}
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
                <Preview code={currentChallenge.solutionCode} id={`target-${challengeKey}`} />
              </div>
            </div>

            {/* Your Code Preview */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm flex-1">
              <div className="bg-muted px-4 py-3 text-sm font-medium border-b flex items-center">
                <Eye className="h-4 w-4 mr-2" /> Your Preview
              </div>
              <div className="p-6">
                <Preview code={code} id={`user-${challengeKey}`} preloaded={preloadedComponents[`challenge-${currentChallengeIndex}`]} />
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Section */}
        {testResults.length > 0 && (
          <div className="mb-6 bg-white border rounded-lg overflow-hidden shadow-sm">
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
              {!isCorrect && testResults.some(r => !r.pass) && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-blue-700">
                      <p className="font-medium">Hint</p>
                      <p className="text-sm mt-1">
                        Review the failed tests above and make the necessary changes to your code. Click "Check Solution" again when you're ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="sticky bottom-0 bg-white border-t py-3 mt-auto -mx-6 px-6 shadow-md">
          <div className="container mx-auto">
            <ChallengeNavigation
              currentIndex={currentChallengeIndex}
              total={challenges.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isCompleted={isCorrect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

