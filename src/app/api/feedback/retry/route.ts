import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

export async function POST(request: NextRequest) {
    try {
        const { feedbackId } = await request.json()

        if (!feedbackId) {
            return NextResponse.json(
                { error: 'feedbackId is required' },
                { status: 400 }
            )
        }

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
            return NextResponse.json(
                { error: 'Feedback not found' },
                { status: 404 }
            )
        }

        if (feedback.status !== 'Error') {
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
            return NextResponse.json(
                { error: 'Failed to update status' },
                { status: 500 }
            )
        }

        if (!N8N_WEBHOOK_URL) {
            console.error('N8N_WEBHOOK_URL is not configured')
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

        console.log('Calling n8n webhook with payload:', JSON.stringify(webhookPayload, null, 2))

        const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload),
        })

        if (!webhookResponse.ok) {
            console.error('Webhook call failed:', webhookResponse.status, await webhookResponse.text())
        } else {
            console.log('Webhook call successful')
        }

        return NextResponse.json({ success: true, message: 'Retry initiated' })
    } catch (error) {
        console.error('Retry error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
