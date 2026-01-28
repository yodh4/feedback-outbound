import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              Feedback Portal
            </span>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-4">
            Smart Feedback Collection
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Submit feedback, report bugs, or request features.
            Our system automatically categorizes and prioritizes your input.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">
                Start Submitting Feedback
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                Easy Submission
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Simple form with title and description. No complex workflows.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                Auto Classification
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Automatic categorization and priority assignment.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                Real-time Updates
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Watch status updates instantly without refreshing.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Built with Next.js & Supabase
          </p>
        </div>
      </footer>
    </div>
  )
}
