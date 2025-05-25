import ApiService from '@/infrastructure/api/ApiService.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import type { NeighborhoodFormValues } from '@/containers/Neighborhood/neighborhood.schema';
import type { CreateMultipleInvitationsInput } from '@/domain/models/NeighborhoodInvitation';

export class NeighborhoodFrontRepository {
    async getAcceptedNeighborhoods(): Promise<FrontNeighborhood[]> {
        const response = await ApiService.get('/neighborhoods?status=accepted');
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

        const response = await ApiService.post('/neighborhoods', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    async createMultipleInvitations(input: CreateMultipleInvitationsInput): Promise<object> {
        console.log('Creating multiple invitations:', input);
        return await ApiService.post('/neighborhoods/invitations', input);
    }
}
