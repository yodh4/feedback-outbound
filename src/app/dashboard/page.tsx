import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import FeedbackList from '@/components/feedback/FeedbackList'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500 dark:text-slate-400 hidden md:inline">
                                    {user.email}
                                </span>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xs shadow-inner">
                                        {user.email?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
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
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 items-start">
                        {/* Form Section - Sticky on Desktop */}
                        <section className="w-full lg:col-span-4 lg:sticky lg:top-8 order-1 mb-8 lg:mb-0">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                Submit Feedback
                            </h2>
                            <FeedbackForm userId={user.id} />
                        </section>

                        {/* List Section - Scrollable */}
                        <section className="w-full lg:col-span-8 order-2">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                Your Feedback History
                            </h2>
                            <FeedbackList userId={user.id} />
                        </section>
                    </div>
                </main>
            </FeedbackProvider>
        </div>
    )
}
