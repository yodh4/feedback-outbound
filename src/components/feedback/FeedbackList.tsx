'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
        // Set up real-time subscription
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

    const getPriorityStyles = (priority: string | null) => {
        switch (priority) {
            case 'High':
                return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'Low':
                return 'bg-green-500/20 text-green-400 border-green-500/30'
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const getCategoryStyles = (category: string | null) => {
        switch (category) {
            case 'Bug':
                return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'Feature':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'General':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Processed':
                return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'Pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse'
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-blue-400"
                    >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Your Feedback
                    <Badge variant="outline" className="ml-2 bg-slate-800 text-slate-300 border-slate-700">
                        {feedback.length}
                    </Badge>
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Track the status of your submitted feedback
                </CardDescription>
            </CardHeader>
            <CardContent>
                {feedback.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-8 h-8 text-slate-600"
                            >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-300 mb-1">No feedback yet</h3>
                        <p className="text-slate-500">Submit your first feedback using the form above</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedback.map((item) => (
                            <div
                                key={item.id}
                                className="group p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                    <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${getStatusStyles(item.status)}`}
                                        >
                                            {item.status === 'Pending' ? (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    {item.status}
                                                </span>
                                            )}
                                        </Badge>
                                        {item.priority && (
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getPriorityStyles(item.priority)}`}
                                            >
                                                {item.priority} Priority
                                            </Badge>
                                        )}
                                        {item.category && (
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getCategoryStyles(item.category)}`}
                                            >
                                                {item.category}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed mb-3">
                                    {item.description}
                                </p>
                                <div className="flex items-center text-xs text-slate-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-3 h-3 mr-1"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {formatDate(item.created_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
