"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ChallengeNavigationProps {
  currentIndex: number
  total: number
  onPrevious: () => void
  onNext: () => void
  isCompleted: boolean
}

export function ChallengeNavigation({
  currentIndex,
  total,
  onPrevious,
  onNext,
  isCompleted,
}: ChallengeNavigationProps) {
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Challenge {currentIndex + 1} of {total}
        </span>
        <Button onClick={onNext} disabled={currentIndex === total - 1} variant={isCompleted ? "default" : "outline"}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

