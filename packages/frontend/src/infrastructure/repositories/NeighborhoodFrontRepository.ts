import { ApiService } from '@/infrastructure/api/ApiService.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import type { NeighborhoodFormValues } from '@/containers/Neighborhood/neighborhood.schema';
import type { CreateMultipleInvitationsInput } from '@/domain/models/NeighborhoodInvitation';

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
        formData.append('geo', JSON.stringify(data.geo));

        if (data.images) {
            data.images.forEach((image) => {
                formData.append(`images`, image);
            });
        }

        return await this.apiService.postFormData('/neighborhoods', formData);
    }

    async createMultipleInvitations(input: CreateMultipleInvitationsInput): Promise<any> {
        return await this.apiService.post('/neighborhoods/invitations', JSON.stringify(input));
    }
}
