import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import FeedbackList from '@/components/feedback/FeedbackList'
import { Button } from '@/components/ui/button'
import { FeedbackProvider } from '@/context/FeedbackContext'
import type { Feedback } from '@/types/database'

async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: feedback } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Feedback Portal
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
                                {user.email}
                            </span>
                            <form action={signOut}>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    size="sm"
                                >
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <FeedbackProvider initialFeedback={(feedback as Feedback[]) || []}>
                <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                Submit Feedback
                            </h2>
                            <FeedbackForm userId={user.id} />
                        </section>

                        <section>
                            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                Your Feedback
                            </h2>
                            <FeedbackList userId={user.id} />
                        </section>
                    </div>
                </main>
            </FeedbackProvider>
        </div>
    )
}
