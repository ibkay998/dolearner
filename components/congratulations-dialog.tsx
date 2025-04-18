"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
// Import confetti dynamically to avoid SSR issues
import dynamic from 'next/dynamic'

interface CongratulationsDialogProps {
  isOpen: boolean
  onClose: () => void
  challengeTitle: string
  isLastChallenge: boolean
}

export function CongratulationsDialog({
  isOpen,
  onClose,
  challengeTitle,
  isLastChallenge
}: CongratulationsDialogProps) {
  // Trigger confetti when the dialog opens
  useEffect(() => {
    if (isOpen) {
      // Dynamically import confetti only on the client side when needed
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;

        // Create a confetti animation
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min
        }

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now()

          if (timeLeft <= 0) {
            return clearInterval(interval)
          }

          const particleCount = 50 * (timeLeft / duration)

          // Since particles fall down, start a bit higher than random
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          })
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          })
        }, 250)

        // Auto-close after animation finishes
        const closeTimeout = setTimeout(() => {
          onClose()
        }, 4000)

        return () => {
          clearInterval(interval)
          clearTimeout(closeTimeout)
        }
      }).catch(error => {
        console.error('Failed to load confetti:', error);
        // If confetti fails to load, still close the dialog after a delay
        const closeTimeout = setTimeout(() => {
          onClose()
        }, 3000);
        return () => clearTimeout(closeTimeout);
      });
    }
  }, [isOpen, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">🎉 Challenge Completed! 🎉</DialogTitle>
          <DialogDescription className="text-center pt-2">
            <p className="text-lg font-medium text-green-600 mb-2">
              Congratulations!
            </p>
            <p>
              You've successfully completed the <strong>{challengeTitle}</strong> challenge!
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700"
            onClick={onClose}
          >
            {isLastChallenge ? "Back to Path Selection" : "Continue to Next Challenge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
