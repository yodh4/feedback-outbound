'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface FeedbackFormProps {
    userId: string
}

export default function FeedbackForm({ userId }: FeedbackFormProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('feedback').insert({
            user_id: userId,
            title,
            description,
        })

        if (error) {
            toast.error('Failed to submit feedback', {
                description: error.message,
            })
        } else {
            toast.success('Feedback submitted successfully')
            setTitle('')
            setDescription('')
        }
        setLoading(false)
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Brief summary of your feedback"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your feedback in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
