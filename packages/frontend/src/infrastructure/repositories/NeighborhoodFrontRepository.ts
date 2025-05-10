import { ApiService } from '@/infrastructure/api/ApiService.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';

export class NeighborhoodFrontRepository {
    constructor(private apiService: ApiService) {}

    async getAcceptedNeighborhoods(): Promise<FrontNeighborhood[]> {
        const response = await this.apiService.get('/neighborhoods?status=accepted');
        return response.data;
    }
}
