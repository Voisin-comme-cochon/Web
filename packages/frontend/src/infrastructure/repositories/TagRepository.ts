import ApiService from '@/infrastructure/api/ApiService.ts';
import { TagModel } from '@/domain/models/tag.model.ts';

export class TagRepository {
    async getTags(): Promise<TagModel[]> {
        const response = await ApiService.get<{ data: TagModel[] }>('/tags?limit=1000&page=1');
        return response.data.data;
    }
}
