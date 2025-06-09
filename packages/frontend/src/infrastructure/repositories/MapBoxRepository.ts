export class MapBoxRepository {
    private readonly token: string;
    private readonly baseUrl: string = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

    constructor() {
        const envToken = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY as string;
        if (!envToken) {
            throw new Error('Le token Mapbox n’est pas défini dans VITE_VCC_MAPBOX_PUBLIC_KEY');
        }
        this.token = envToken;
    }

    public async getAddressByPoint(point: [number, number]): Promise<string | null> {
        const [lng, lat] = point;
        const url = `${this.baseUrl}/${lng},${lat}.json?access_token=${this.token}&types=address&limit=1&language=fr`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Mapbox Reverse Geocoding erreur : ${response.status} ${response.statusText}`);
                return null;
            }

            const data = (await response.json()) as {
                features?: Array<{ place_name: string }>;
            };
            if (data.features && Array.isArray(data.features) && data.features.length > 0) {
                return data.features[0].place_name;
            }
            return null;
        } catch (err) {
            console.error('Exception dans getAddressByPoint :', err);
            return null;
        }
    }

    public async getPointByAddress(address: string): Promise<[number, number] | null> {
        const encoded = encodeURIComponent(address);
        const url = `${this.baseUrl}/${encoded}.json?access_token=${this.token}&types=address&limit=1&language=fr`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Mapbox Forward Geocoding erreur : ${response.status} ${response.statusText}`);
                return null;
            }

            const data = (await response.json()) as {
                features?: Array<{ center: [number, number] }>;
            };
            if (data.features && Array.isArray(data.features) && data.features.length > 0) {
                return data.features[0].center;
            }
            return null;
        } catch (err) {
            console.error('Exception dans getPointByAddress :', err);
            return null;
        }
    }
}
