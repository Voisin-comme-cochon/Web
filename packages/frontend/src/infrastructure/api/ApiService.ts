import {FrontNeighborhood} from "@/domain/models/FrontNeighborhood.ts";

export class ApiService {

    async get(endpoint: string): Promise<FrontNeighborhood[]> {
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
}