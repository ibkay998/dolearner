import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SupabaseProvider } from "@/components/supabase-provider"
import { ReactQueryProvider } from "@/lib/react-query"

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <ReactQueryProvider>
            {children}
            <Toaster />
            <Analytics />
          </ReactQueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
