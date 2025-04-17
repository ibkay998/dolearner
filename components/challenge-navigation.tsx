"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
            Challenge {currentIndex + 1} of {total}
          </span>
          {isCompleted && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Challenge completed!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Button
          onClick={onNext}
          disabled={currentIndex === total - 1}
          variant={isCompleted ? "default" : "outline"}
          className={`transition-all duration-200 hover:translate-x-[2px] ${
            isCompleted ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <Progress
        value={progress}
        className="h-2 bg-gray-100"
        indicatorClassName="bg-green-600 transition-all duration-300 ease-out"
      />
    </div>
  )
}

