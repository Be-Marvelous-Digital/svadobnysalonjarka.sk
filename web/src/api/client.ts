const BASE = '/api';

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function parseError(response: Response): Promise<never> {
    let message = 'Nastala chyba pri komunikácii so serverom.';
    try {
        const body = (await response.json()) as { error?: string };
        if (body.error) message = body.error;
    } catch {
        // Response body was not JSON; the default message stands.
    }
    throw new ApiError(response.status, message);
}

export async function apiGet<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE}${path}`, { credentials: 'same-origin' });
    if (!response.ok) await parseError(response);
    return (await response.json()) as T;
}

export async function apiSend<T>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${BASE}${path}`, {
        method,
        credentials: 'same-origin',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) await parseError(response);
    return (await response.json()) as T;
}

export async function apiUpload<T>(path: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
    const response = await fetch(`${BASE}${path}`, { method, credentials: 'same-origin', body: formData });
    if (!response.ok) await parseError(response);
    return (await response.json()) as T;
}
