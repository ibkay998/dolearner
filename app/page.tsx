import { ComponentChallenge } from "@/components/component-challenge"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">DoLearner: React Component Practice</h1>
        </div>
      </header>
      <ComponentChallenge />
    </main>
  )
}

