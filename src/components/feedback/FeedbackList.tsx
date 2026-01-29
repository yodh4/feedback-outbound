'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { MessageSquareDashed, HelpCircle, RefreshCw, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useFeedback } from '@/context/FeedbackContext'
import { toast } from 'sonner'
import type { Feedback } from '@/types/database'

const ITEMS_PER_PAGE = 10

interface FeedbackListProps {
    userId: string
}

export default function FeedbackList({ userId }: FeedbackListProps) {
    const { feedback, setFeedback } = useFeedback()
    const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    
    // Advanced Filters State
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [priorityFilter, setPriorityFilter] = useState('ALL')
    const [categoryFilter, setCategoryFilter] = useState('ALL')

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

    const filteredFeedback = useMemo(() => {
        return feedback.filter((item) => {
            // 1. Search Query (Title or Description)
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesTitle = item.title.toLowerCase().includes(query)
                const matchesDesc = item.description?.toLowerCase().includes(query)
                if (!matchesTitle && !matchesDesc) return false
            }

            // 2. Status Filter
            if (statusFilter !== 'ALL' && item.status !== statusFilter) return false

            // 3. Priority Filter
            if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false

            // 4. Category Filter
            if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false

            return true
        })
    }, [feedback, searchQuery, statusFilter, priorityFilter, categoryFilter])

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter, priorityFilter, categoryFilter])

    // Pagination: page-based
    const totalItems = filteredFeedback.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)
    const paginatedFeedback = filteredFeedback.slice(startIndex, endIndex)

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('ALL')
        setPriorityFilter('ALL')
        setCategoryFilter('ALL')
    }

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'

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
                {/* Advanced Filters Toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search by title or description..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Group */}
                    <div className="flex flex-wrap gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Processed">Processed</SelectItem>
                                <SelectItem value="Error">Error</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priority</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Category</SelectItem>
                                <SelectItem value="Bug">Bug</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Feature Request">Feature Request</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearFilters}
                                title="Clear All Filters"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {filteredFeedback.length === 0 && (
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                            <Search className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-lg font-medium text-slate-900 dark:text-white">No results found</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {paginatedFeedback.length > 0 && (
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {paginatedFeedback.map((item) => {
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

                {totalItems > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} results
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm font-medium mx-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}
