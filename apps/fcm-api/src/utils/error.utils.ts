import type { AxiosError } from 'axios'

function safeStringify(obj: unknown): string {
    const seen = new WeakSet()
    return JSON.stringify(obj, (key, value) => {
        if (key === 'config' || key === 'request') return undefined // Skip Axios internal objects
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return '[Circular]'
            seen.add(value)
        }
        return value
    })
}

export function formatError(error: unknown): Record<string, unknown> {
    // Handle Axios errors
    if (isAxiosError(error)) {
        return {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            responseData: error.response?.data,
        }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        return {
            message: error.message,
            name: error.name,
            stack: error.stack,
        }
    }

    // Handle other objects
    if (typeof error === 'object' && error !== null) {
        try {
            return JSON.parse(safeStringify(error))
        } catch {
            return { message: String(error) }
        }
    }

    return { message: String(error) }
}

// Type guard for Axios errors
function isAxiosError(error: unknown): error is AxiosError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        (error as AxiosError).isAxiosError === true
    )
}
