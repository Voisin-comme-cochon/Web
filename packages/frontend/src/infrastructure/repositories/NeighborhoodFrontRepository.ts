import ApiService from '@/infrastructure/api/ApiService.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import type { NeighborhoodFormValues } from '@/containers/Neighborhood/neighborhood.schema';
import type { CreateMultipleInvitationsInput } from '@/domain/models/NeighborhoodInvitation';
import { PaginatedResultModel } from '@/domain/models/paginated-result.model.ts';
import { NeighborhoodMemberManageModel, NeighborhoodUserModel } from '@/domain/models/NeighborhoodUser.model.ts';
import { InvitationModel } from '@/domain/models/invitation.model.ts';
import { Roles } from '@/domain/models/Roles.ts';
import { UserStatus } from '@/domain/models/UserStatus.ts';

export class NeighborhoodFrontRepository {
    async getAcceptedNeighborhoods(): Promise<FrontNeighborhood[]> {
        const response = await ApiService.get('/neighborhoods?status=accepted');
        const paging: PaginatedResultModel<FrontNeighborhood> = response.data;
        return paging.data;
    }

    async updateNeighborhoodManage(
        name: string,
        description: string,
        neighborhoodId: string | number
    ): Promise<FrontNeighborhood> {
        const response = await ApiService.patch<FrontNeighborhood>(`/neighborhoods/${neighborhoodId}/manage`, {
            name,
            description,
        });
        return response.data;
    }

    async getMyNeighborhoods(id: string | number): Promise<FrontNeighborhood[]> {
        const response = await ApiService.get(`/neighborhoods/users/${id}`);
        return response.data;
    }

    async generateInviteLink(neighborhoodId: number, duration: number, maxUses: number): Promise<InvitationModel> {
        const response = await ApiService.post<InvitationModel>(`/neighborhoods/invitations/public`, {
            durationInDays: duration,
            maxUse: maxUses,
            neighborhoodId: neighborhoodId,
        });
        return response.data;
    }

    async getNeighborhoodByPos(longitude: string, latitude: string): Promise<FrontNeighborhood[]> {
        const response = await ApiService.get(`/neighborhoods?status=accepted&lat=${latitude}&lng=${longitude}`);
        return response.data.data;
    }

    async getUsersInNeighborhood(neighborhoodId: string | number): Promise<NeighborhoodMemberManageModel[]> {
        const response = await ApiService.get(`/neighborhoods/${neighborhoodId}/manage-users`);
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

    async getNeighborhoodById(id: string | number): Promise<FrontNeighborhood> {
        const response = await ApiService.get(`/neighborhoods/${id}`);
        return response.data;
    }

    async getMembersByNeighborhoodId(id: string | number): Promise<NeighborhoodUserModel[]> {
        const response = await ApiService.get(`/neighborhoods/${id}/users?page=1&limit=2000`);
        return response.data.data;
    }

    async joinNeighborhood(neighborhoodId: number): Promise<void> {
        await ApiService.post(`/neighborhoods/${neighborhoodId}/join`);
    }

    async removeUserFromNeighborhood(neighborhoodId: number, userId: number): Promise<void> {
        return await ApiService.delete(`/neighborhoods/${neighborhoodId}/users/${userId}`);
    }

    async updateNeighborhoodMemberRole(neighborhoodId: number, userId: number, role: Roles): Promise<void> {
        return await ApiService.patch(`/neighborhoods/${neighborhoodId}/users/${userId}`, { role });
    }

    async updateNeighborhoodMemberStatus(neighborhoodId: number, userId: number, status: UserStatus): Promise<void> {
        return await ApiService.patch(`/neighborhoods/${neighborhoodId}/users/${userId}`, { status });
    }
}
