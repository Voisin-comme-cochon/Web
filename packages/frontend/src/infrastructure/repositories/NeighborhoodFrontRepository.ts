import { ApiService } from '@/infrastructure/api/ApiService.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import type { NeighborhoodFormValues } from '@/containers/Neighborhood/neighborhood.schema';

export class NeighborhoodFrontRepository {
    constructor(private apiService: ApiService) {}

    async getAcceptedNeighborhoods(): Promise<FrontNeighborhood[]> {
        const response = await this.apiService.get('/neighborhoods?status=accepted');
        return response.data;
    }

    async createNeighborhood(data: NeighborhoodFormValues): Promise<FrontNeighborhood> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        // TODO : Add real geo json, fake geo json for now
        formData.append(
            'geo',
            JSON.stringify({
                type: 'Polygon',
                coordinates: [
                    [
                        [2.294, 48.858],
                        [2.295, 48.859],
                        [2.296, 48.858],
                        [2.294, 48.858],
                    ],
                ],
            })
        );

        if (data.images) {
            data.images.forEach((image) => {
                formData.append(`images`, image);
            });
        }

        return await this.apiService.postFormData('/neighborhoods', formData);
    }
}
