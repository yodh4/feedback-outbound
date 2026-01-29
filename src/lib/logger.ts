type LogLevel = 'info' | 'warn' | 'error'
type LogAction =
    | 'feedback_submit_start'
    | 'feedback_submit_success'
    | 'feedback_submit_error'
    | 'feedback_retry_start'
    | 'feedback_retry_success'
    | 'feedback_retry_error'
    | 'realtime_insert'
    | 'realtime_update'
    | 'realtime_delete'
    | 'webhook_call'
    | 'webhook_success'
    | 'webhook_error'

interface LogEntry {
    timestamp: string
    level: LogLevel
    action: LogAction
    [key: string]: unknown
}

function createLogEntry(level: LogLevel, action: LogAction, data?: Record<string, unknown>): LogEntry {
    return {
        timestamp: new Date().toISOString(),
        level,
        action,
        ...data,
    }
}

export function log(level: LogLevel, action: LogAction, data?: Record<string, unknown>) {
    const entry = createLogEntry(level, action, data)
    const formatted = JSON.stringify(entry)

    switch (level) {
        case 'error':
            console.error('[FeedbackPortal]', formatted)
            break
        case 'warn':
            console.warn('[FeedbackPortal]', formatted)
            break
        default:
            console.log('[FeedbackPortal]', formatted)
    }
}
