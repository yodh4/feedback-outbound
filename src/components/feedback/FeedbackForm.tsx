'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

// Task 4: Zod schema for form validation
const formSchema = z.object({
    title: z.string()
        .min(5, { message: 'Title must be at least 5 characters.' })
        .max(100, { message: 'Title must be less than 100 characters.' }),
    description: z.string()
        .min(10, { message: 'Description must be at least 10 characters.' })
        .max(1000, { message: 'Description must be less than 1000 characters.' }),
})

type FormData = z.infer<typeof formSchema>

interface FeedbackFormProps {
    userId: string
}

export default function FeedbackForm({ userId }: FeedbackFormProps) {
    const supabase = createClient()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
        },
        mode: 'onChange', // Validate on change for immediate feedback
    })

    const { isSubmitting, isValid } = form.formState

    const onSubmit = async (data: FormData) => {
        const { error } = await supabase.from('feedback').insert({
            user_id: userId,
            title: data.title,
            description: data.description,
        })

        if (error) {
            toast.error('Failed to submit feedback', {
                description: error.message,
            })
        } else {
            toast.success('Feedback submitted successfully', {
                description: 'Our AI will classify your feedback shortly.',
            })
            form.reset()
        }
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Brief summary of your feedback"
                                            {...field}
                                        />
                                    </FormControl>
                                    <div className="flex justify-between">
                                        <FormMessage />
                                        <span className="text-xs text-slate-400">
                                            {field.value.length}/100
                                        </span>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your feedback in detail..."
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <div className="flex justify-between">
                                        <FormMessage />
                                        <span className="text-xs text-slate-400">
                                            {field.value.length}/1000
                                        </span>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting || !isValid}>
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
