'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface FeedbackSkeletonProps {
    count?: number
}

export default function FeedbackSkeleton({ count = 3 }: FeedbackSkeletonProps) {
    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-0">
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {Array.from({ length: count }).map((_, index) => (
                        <div key={index} className="p-4">
                            {/* Row 1: Title + Badges */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <Skeleton className="h-5 w-48" />
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-12 rounded-full" />
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                </div>
                            </div>
                            {/* Row 2: Description */}
                            <div className="space-y-1.5 mb-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            {/* Row 3: Timestamp */}
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
