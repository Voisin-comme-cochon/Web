import ApiService from '@/infrastructure/api/ApiService.ts';
import { CompleteUserModel } from '@/domain/models/complete-user.model.ts';

export class UserFrontRepository {
    async getUserById(id: number | string): Promise<CompleteUserModel> {
        const response = await ApiService.get(`/users/${id}`);
        return response.data;
    }

    async getRecommendations(neighborhoodId: number | string, limit: number = 12): Promise<CompleteUserModel[]> {
        const response = await ApiService.get(`/neighborhoods/${neighborhoodId}/recommandations`, {
            params: { limit },
        });
        return response.data;
    }
}
