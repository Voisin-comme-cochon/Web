export class ApiService {

    async get(endpoint: string) {
        const baseUrl: string = import.meta.env.VITE_VCC_API_URL;
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // TODO : Intégrer l'auto renew token
        });

        return await response.json();
    };

    async post(endpoint: string, body: string) {
        const baseUrl: string = import.meta.env.VITE_VCC_API_URL;
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });

        return await response.json();
    };
}