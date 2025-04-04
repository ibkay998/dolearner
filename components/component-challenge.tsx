"use client"

import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/code-editor"
import { Preview } from "@/components/preview"
import { ChallengeNavigation } from "@/components/challenge-navigation"
import { challenges } from "@/data/challenges"
import { Button } from "@/components/ui/button"
import { Check, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ComponentChallenge() {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [code, setCode] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  const currentChallenge = challenges[currentChallengeIndex]

  useEffect(() => {
    // Reset state when challenge changes
    setCode(currentChallenge.initialCode)
    setIsCorrect(false)
    setShowSolution(false)
  }, [currentChallengeIndex, currentChallenge.initialCode])

  const handleCodeChange = (value: string) => {
    setCode(value)
    // Simple check - in a real app you'd want more sophisticated comparison
    setIsCorrect(value.includes(currentChallenge.solutionMarker))
  }

  const handleReset = () => {
    setCode(currentChallenge.initialCode)
    setIsCorrect(false)
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
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{currentChallenge.title}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSolution(!showSolution)}>
              {showSolution ? "Hide Solution" : "Show Solution"}
            </Button>
            {isCorrect && (
              <div className="flex items-center text-green-500">
                <Check className="h-5 w-5 mr-1" />
                Correct!
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p>{currentChallenge.description}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check the "Target Component" tab to see what you're trying to build.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="border rounded-lg overflow-hidden">
            <Tabs defaultValue="code">
              <TabsList className="bg-muted">
                <TabsTrigger value="code">Your Code</TabsTrigger>
                {showSolution && <TabsTrigger value="solution">Solution</TabsTrigger>}
              </TabsList>
              <TabsContent value="code" className="p-0">
                <CodeEditor value={code} onChange={handleCodeChange} />
              </TabsContent>
              {showSolution && (
                <TabsContent value="solution" className="p-0">
                  <CodeEditor value={currentChallenge.solutionCode} readOnly={true} />
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="border rounded-lg overflow-hidden flex flex-col">
            <Tabs defaultValue="preview">
              <TabsList className="bg-muted">
                <TabsTrigger value="preview">Your Preview</TabsTrigger>
                <TabsTrigger value="expected">Target Component</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="flex-1 p-4">
                <Preview code={code} />
              </TabsContent>
              <TabsContent value="expected" className="flex-1 p-4">
                <div className="mb-2 text-sm text-muted-foreground">This is what you're trying to build:</div>
                <Preview code={currentChallenge.solutionCode} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <ChallengeNavigation
          currentIndex={currentChallengeIndex}
          total={challenges.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isCompleted={isCorrect}
        />
      </div>
    </div>
  )
}

