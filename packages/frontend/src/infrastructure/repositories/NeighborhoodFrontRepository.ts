import ApiService from '@/infrastructure/api/ApiService.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import type { NeighborhoodFormValues } from '@/containers/Neighborhood/neighborhood.schema';
import type { CreateMultipleInvitationsInput } from '@/domain/models/NeighborhoodInvitation';
import { PaginatedResultModel } from '@/domain/models/paginated-result.model.ts';

export class NeighborhoodFrontRepository {
    async getAcceptedNeighborhoods(): Promise<FrontNeighborhood[]> {
        const response = await ApiService.get('/neighborhoods?status=accepted');
        const paging: PaginatedResultModel<FrontNeighborhood> = response.data;
        return paging.data;
    }

    async getMyNeighborhoods(id: string | number): Promise<FrontNeighborhood[]> {
        const response = await ApiService.get(`/neighborhoods/users/${id}`);
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
        return await ApiService.post('/neighborhoods/invitations', input);
    }

    async verifyInvitation(token: string) {
        return ApiService.get<FrontNeighborhood>(`/neighborhoods/invitations/verify/${token}`);
    }

    async acceptInvitation(token: string) {
        return ApiService.post<{ success: boolean }>(`/neighborhoods/invitations/accept/${token}`);
    }
}
