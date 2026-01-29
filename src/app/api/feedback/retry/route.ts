import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

function log(level: 'info' | 'warn' | 'error', action: string, data?: Record<string, unknown>) {
    const entry = { timestamp: new Date().toISOString(), level, action, ...data }
    const formatted = JSON.stringify(entry)
    if (level === 'error') console.error('[FeedbackPortal]', formatted)
    else if (level === 'warn') console.warn('[FeedbackPortal]', formatted)
    else console.log('[FeedbackPortal]', formatted)
}

export async function POST(request: NextRequest) {
    try {
        const { feedbackId } = await request.json()

        if (!feedbackId) {
            return NextResponse.json(
                { error: 'feedbackId is required' },
                { status: 400 }
            )
        }

        log('info', 'feedback_retry_start', { feedbackId })

        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SECRET_SUPABASE!
        )

        const { data: feedback, error: fetchError } = await supabase
            .from('feedback')
            .select('*')
            .eq('id', feedbackId)
            .single()

        if (fetchError || !feedback) {
            log('warn', 'feedback_retry_error', { feedbackId, error: 'Feedback not found' })
            return NextResponse.json(
                { error: 'Feedback not found' },
                { status: 404 }
            )
        }

        if (feedback.status !== 'Error') {
            log('warn', 'feedback_retry_error', { feedbackId, error: 'Invalid status', status: feedback.status })
            return NextResponse.json(
                { error: 'Only feedback with Error status can be retried' },
                { status: 400 }
            )
        }

        const { error: updateError } = await supabase
            .from('feedback')
            .update({ status: 'Pending' })
            .eq('id', feedbackId)

        if (updateError) {
            log('error', 'feedback_retry_error', { feedbackId, error: updateError.message })
            return NextResponse.json(
                { error: 'Failed to update status' },
                { status: 500 }
            )
        }

        if (!N8N_WEBHOOK_URL) {
            log('error', 'webhook_error', { error: 'N8N_WEBHOOK_URL not configured' })
            return NextResponse.json(
                { error: 'Webhook URL not configured' },
                { status: 500 }
            )
        }

        const webhookPayload = {
            type: 'INSERT',
            table: 'feedback',
            schema: 'public',
            record: {
                id: feedback.id,
                description: feedback.description,
                title: feedback.title,
                user_id: feedback.user_id,
            }
        }

        log('info', 'webhook_call', { feedbackId, webhookUrl: N8N_WEBHOOK_URL })

        const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload),
        })

        if (!webhookResponse.ok) {
            log('error', 'webhook_error', { feedbackId, status: webhookResponse.status })
        } else {
            log('info', 'webhook_success', { feedbackId })
        }

        log('info', 'feedback_retry_success', { feedbackId })
        return NextResponse.json({ success: true, message: 'Retry initiated' })
    } catch (error) {
        log('error', 'feedback_retry_error', { error: error instanceof Error ? error.message : 'Unknown error' })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
