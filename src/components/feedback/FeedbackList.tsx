'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { MessageSquareDashed, HelpCircle, RefreshCw } from 'lucide-react'
import { useFeedback } from '@/context/FeedbackContext'
import { toast } from 'sonner'
import type { Feedback } from '@/types/database'

interface FeedbackListProps {
    userId: string
}

type FilterType = 'ALL' | 'PENDING' | 'HIGH' | 'BUG'

export default function FeedbackList({ userId }: FeedbackListProps) {
    const { feedback, setFeedback } = useFeedback()
    const [filter, setFilter] = useState<FilterType>('ALL')
    const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set())
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
                        setFeedback((prev) => {
                            const exists = prev.some((item) => item.id === payload.new.id)
                            if (exists) return prev
                            return [payload.new as Feedback, ...prev]
                        })
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
    }, [userId, supabase, setFeedback])

    const handleRetry = async (feedbackId: string) => {
        setRetryingIds((prev) => new Set(prev).add(feedbackId))

        try {
            const response = await fetch('/api/feedback/retry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedbackId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to retry')
            }

            toast.success('Retry initiated', {
                description: 'The classification will be attempted again.',
            })
        } catch (error) {
            toast.error('Retry failed', {
                description: error instanceof Error ? error.message : 'Please try again later.',
            })
        } finally {
            setRetryingIds((prev) => {
                const next = new Set(prev)
                next.delete(feedbackId)
                return next
            })
        }
    }

    const filteredFeedback = feedback.filter((item) => {
        switch (filter) {
            case 'PENDING':
                return item.status === 'Pending'
            case 'HIGH':
                return item.priority === 'High'
            case 'BUG':
                return item.category === 'Bug'
            default:
                return true
        }
    })

    const counts = {
        all: feedback.length,
        pending: feedback.filter((f) => f.status === 'Pending').length,
        high: feedback.filter((f) => f.priority === 'High').length,
        bug: feedback.filter((f) => f.category === 'Bug').length,
    }

    const getStatusBadge = (status: string, isOptimistic: boolean, feedbackId: string) => {
        if (status === 'Processed') {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 cursor-help">
                            Processed
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Your feedback has been classified by our AI system.</p>
                    </TooltipContent>
                </Tooltip>
            )
        }
        if (status === 'Error') {
            const isRetrying = retryingIds.has(feedbackId)
            return (
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="destructive"
                                className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 cursor-help"
                            >
                                Error
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Classification failed. Click Retry to try again.</p>
                        </TooltipContent>
                    </Tooltip>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(feedbackId)}
                        disabled={isRetrying}
                        className="h-6 px-2 text-xs"
                    >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                        {isRetrying ? 'Retrying...' : 'Retry'}
                    </Button>
                </div>
            )
        }
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="secondary"
                        className={`border-0 cursor-help ${isOptimistic
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                    >
                        {isOptimistic ? 'Sending...' : 'Pending'}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isOptimistic ? 'Submitting to server...' : 'Your feedback is being processed by our AI system.'}</p>
                </TooltipContent>
            </Tooltip>
        )
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

        const tooltipText = category === 'Bug'
            ? "Detected keywords like 'error', 'broken', or 'urgent'."
            : "Standard feedback classification."

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={`${styles} border-0 cursor-help inline-flex items-center gap-1`}>
                        {category}
                        <HelpCircle className="h-3 w-3" />
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        )
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
            <Card className="border-dashed border-slate-300 dark:border-slate-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquareDashed className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-lg font-medium text-slate-900 dark:text-white">No feedback yet</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-1">
                        Your submission history will appear here once you send your first feedback.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                        <TabsTrigger value="ALL" className="text-xs sm:text-sm">
                            All {counts.all > 0 && <span className="ml-1 text-slate-400">({counts.all})</span>}
                        </TabsTrigger>
                        <TabsTrigger value="PENDING" className="text-xs sm:text-sm">
                            Pending {counts.pending > 0 && <span className="ml-1 text-slate-400">({counts.pending})</span>}
                        </TabsTrigger>
                        <TabsTrigger value="HIGH" className="text-xs sm:text-sm">
                            High Priority {counts.high > 0 && <span className="ml-1 text-slate-400">({counts.high})</span>}
                        </TabsTrigger>
                        <TabsTrigger value="BUG" className="text-xs sm:text-sm">
                            Bugs {counts.bug > 0 && <span className="ml-1 text-slate-400">({counts.bug})</span>}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {filteredFeedback.length === 0 && feedback.length > 0 && (
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="py-8 text-center">
                            <p className="text-slate-500 dark:text-slate-400">
                                No {filter.toLowerCase() === 'all' ? '' : filter.toLowerCase()} feedback found.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {filteredFeedback.length > 0 && (
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredFeedback.map((item) => {
                                    const isOptimistic = item.id.startsWith('temp-')
                                    return (
                                        <div
                                            key={item.id}
                                            className={`p-4 transition-opacity ${isOptimistic ? 'opacity-70' : ''}`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                                <h3 className="font-medium text-slate-900 dark:text-white">
                                                    {item.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {getStatusBadge(item.status, isOptimistic, item.id)}
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
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </TooltipProvider>
    )
}
