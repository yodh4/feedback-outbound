'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Feedback } from '@/types/database'

interface FeedbackListProps {
    initialFeedback: Feedback[]
    userId: string
}

export default function FeedbackList({ initialFeedback, userId }: FeedbackListProps) {
    const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback)
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('feedback-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'feedback',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setFeedback((prev) => [payload.new as Feedback, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setFeedback((prev) =>
                            prev.map((item) =>
                                item.id === payload.new.id ? (payload.new as Feedback) : item
                            )
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setFeedback((prev) =>
                            prev.filter((item) => item.id !== payload.old.id)
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, userId])

    const getStatusBadge = (status: string) => {
        if (status === 'Processed') {
            return <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Processed</Badge>
        }
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">Pending</Badge>
    }

    const getPriorityBadge = (priority: string | null) => {
        if (!priority) return null
        const styles = priority === 'High'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        return <Badge variant="outline" className={`${styles} border-0`}>{priority}</Badge>
    }

    const getCategoryBadge = (category: string | null) => {
        if (!category) return null
        const styles = category === 'Bug'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        return <Badge variant="outline" className={`${styles} border-0`}>{category}</Badge>
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    if (feedback.length === 0) {
        return (
            <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="py-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                        No feedback submitted yet. Use the form above to submit your first feedback.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-0">
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {feedback.map((item) => (
                        <div key={item.id} className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <h3 className="font-medium text-slate-900 dark:text-white">
                                    {item.title}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {getStatusBadge(item.status)}
                                    {getPriorityBadge(item.priority)}
                                    {getCategoryBadge(item.category)}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {item.description}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                {formatDate(item.created_at)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
