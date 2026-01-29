'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useFeedback } from '@/context/FeedbackContext'
import type { Feedback } from '@/types/database'

export const feedbackFormSchema = z.object({
    title: z.string()
        .min(5, { message: 'Title must be at least 5 characters.' })
        .max(100, { message: 'Title must be less than 100 characters.' }),
    description: z.string()
        .min(10, { message: 'Description must be at least 10 characters.' })
        .max(1000, { message: 'Description must be less than 1000 characters.' }),
})

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>

interface UseFeedbackFormOptions {
    userId: string
}

export function useFeedbackForm({ userId }: UseFeedbackFormOptions) {
    const supabase = createClient()
    const { addOptimisticFeedback, removeOptimisticFeedback, replaceOptimisticFeedback } = useFeedback()

    const form = useForm<FeedbackFormData>({
        resolver: zodResolver(feedbackFormSchema),
        defaultValues: {
            title: '',
            description: '',
        },
        mode: 'onChange',
    })

    const { isSubmitting, isValid } = form.formState

    const submitFeedback = async (data: FeedbackFormData) => {
        const tempId = `temp-${Date.now()}`
        const optimisticItem: Feedback = {
            id: tempId,
            user_id: userId,
            title: data.title,
            description: data.description,
            status: 'Pending',
            category: null,
            priority: null,
            created_at: new Date().toISOString(),
        }

        addOptimisticFeedback(optimisticItem)
        form.reset()

        toast.success('Feedback submitted!', {
            description: 'Our AI will classify your feedback shortly.',
        })

        const { data: inserted, error } = await supabase
            .from('feedback')
            .insert({
                user_id: userId,
                title: data.title,
                description: data.description,
            })
            .select()
            .single()

        if (error) {
            removeOptimisticFeedback(tempId)
            toast.error('Failed to submit feedback', {
                description: error.message,
            })
            return { success: false, error }
        }

        if (inserted) {
            replaceOptimisticFeedback(tempId, inserted)
        }

        return { success: true, data: inserted }
    }

    const handleSubmit = form.handleSubmit(submitFeedback)

    return {
        form,
        isSubmitting,
        isValid,
        handleSubmit,
        submitFeedback,
    }
}
