'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useFeedbackForm } from '@/hooks/useFeedbackForm'

interface FeedbackFormProps {
    userId: string
}

export default function FeedbackForm({ userId }: FeedbackFormProps) {
    const { form, isSubmitting, isValid, handleSubmit } = useFeedbackForm({ userId })

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
