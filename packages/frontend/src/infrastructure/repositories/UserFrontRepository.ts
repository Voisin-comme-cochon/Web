import ApiService from '@/infrastructure/api/ApiService.ts';
import { UserModel } from '@/domain/models/user.model.ts';

export class UserFrontRepository {
    async getUserById(id: number | string): Promise<UserModel> {
        const response = await ApiService.get(`/users/${id}`);
        return response.data;
    }
}
