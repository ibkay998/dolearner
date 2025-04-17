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
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="outline" 
          onClick={onPrevious} 
          disabled={currentIndex === 0}
          className="transition-all duration-200 hover:translate-x-[-2px]"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
          Challenge {currentIndex + 1} of {total}
        </span>
        <Button 
          onClick={onNext} 
          disabled={currentIndex === total - 1} 
          variant={isCompleted ? "default" : "outline"}
          className={`transition-all duration-200 hover:translate-x-[2px] ${
            isCompleted ? 'bg-blue-600 hover:bg-blue-700' : ''
          }`}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-gray-100" 
        indicatorClassName="bg-blue-600 transition-all duration-300 ease-out"
      />
    </div>
  )
}

