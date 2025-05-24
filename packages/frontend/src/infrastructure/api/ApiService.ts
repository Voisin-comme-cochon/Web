export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(status: number, message: string, data: unknown = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export class ApiService {
    async get(endpoint: string) {
        const baseUrl: string = import.meta.env.VITE_VCC_API_URL;

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new ApiError(
                    response.status,
                    `API error: ${response.statusText}`,
                    await response.text().catch(() => null)
                );
            }
            const json = await response.json();
            return json;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (error instanceof Error) {
                throw new ApiError(500, `Failed to fetch data: ${error.message}`, null);
            }

            throw new ApiError(500, 'Unknown error occurred', null);
        }
    }

    async post(endpoint: string, body: string) {
        const baseUrl: string = import.meta.env.VITE_VCC_API_URL;

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('jwt')}`,
                },
                body: body,
            });

            if (!response.ok) {
                throw new ApiError(
                    response.status,
                    `API error: ${response.statusText}`,
                    await response.text().catch(() => null)
                );
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (error instanceof Error) {
                throw new ApiError(500, `Failed to fetch data: ${error.message}`, null);
            }

            throw new ApiError(500, 'Unknown error occurred', null);
        }
    }

    async postFormData(endpoint: string, formData: FormData) {
        const baseUrl: string = import.meta.env.VITE_VCC_API_URL;

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwt')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new ApiError(
                    response.status,
                    `API error: ${response.statusText}`,
                    await response.text().catch(() => null)
                );
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (error instanceof Error) {
                throw new ApiError(500, `Failed to fetch data: ${error.message}`, null);
            }

            throw new ApiError(500, 'Unknown error occurred', null);
        }
    }
}
