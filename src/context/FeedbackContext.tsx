'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Feedback } from '@/types/database'

interface FeedbackContextType {
    feedback: Feedback[]
    setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>
    addOptimisticFeedback: (item: Feedback) => void
    removeOptimisticFeedback: (tempId: string) => void
    replaceOptimisticFeedback: (tempId: string, realItem: Feedback) => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

interface FeedbackProviderProps {
    children: ReactNode
    initialFeedback: Feedback[]
}

export function FeedbackProvider({ children, initialFeedback }: FeedbackProviderProps) {
    const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback)

    const addOptimisticFeedback = useCallback((item: Feedback) => {
        setFeedback((prev) => [item, ...prev])
    }, [])

    const removeOptimisticFeedback = useCallback((tempId: string) => {
        setFeedback((prev) => prev.filter((item) => item.id !== tempId))
    }, [])

    const replaceOptimisticFeedback = useCallback((tempId: string, realItem: Feedback) => {
        setFeedback((prev) => {
            // check if realItem.id already exists (Realtime already added the real item)
            const realItemExists = prev.some((item) => item.id === realItem.id)

            if (realItemExists) {
                // Realtime already added the real item, remove the temp one
                return prev.filter((item) => item.id !== tempId)
            }

            // Normal case: replace temp with real
            return prev.map((item) => (item.id === tempId ? realItem : item))
        })
    }, [])

    return (
        <FeedbackContext.Provider
            value={{
                feedback,
                setFeedback,
                addOptimisticFeedback,
                removeOptimisticFeedback,
                replaceOptimisticFeedback,
            }}
        >
            {children}
        </FeedbackContext.Provider>
    )
}

export function useFeedback() {
    const context = useContext(FeedbackContext)
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider')
    }
    return context
}
