import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import FeedbackSkeleton from '@/components/feedback/FeedbackSkeleton'

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header Skeleton */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-40 hidden sm:block" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="space-y-8">
                    {/* Submit Feedback Section */}
                    <section>
                        <Skeleton className="h-6 w-32 mb-4" />
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-10" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-24 w-full" />
                                    </div>
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Feedback History Section */}
                    <section>
                        <Skeleton className="h-6 w-28 mb-4" />
                        <FeedbackSkeleton count={3} />
                    </section>
                </div>
            </main>
        </div>
    )
}
