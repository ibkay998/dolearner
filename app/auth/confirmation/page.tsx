"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Suspense } from "react";

// Component that handles search params and needs Suspense
function ConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {email && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Email sent to:</strong> {email}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Check your inbox</p>
                <p className="text-xs text-gray-600">
                  Look for an email from DoLearner with your confirmation link
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Click the confirmation link</p>
                <p className="text-xs text-gray-600">
                  This will verify your email and activate your account
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Start learning</p>
                <p className="text-xs text-gray-600">
                  Once confirmed, you can track your progress and save completed challenges
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Didn't receive the email?</strong> Check your spam folder or try signing up again.
              The confirmation link will expire in 24 hours.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => router.push("/auth")}
              variant="outline"
              className="w-full"
            >
              Back to Sign In
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
            >
              Continue Browsing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DoLearner: Email Confirmation
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <Suspense fallback={
        <div className="container mx-auto py-8">
          <Loading text="Loading..." />
        </div>
      }>
        <ConfirmationPageContent />
      </Suspense>
    </main>
  );
}
