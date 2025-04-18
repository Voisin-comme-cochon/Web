import {ApiService} from "@/infrastructure/api/ApiService.ts";
import {FrontNeighborhood} from "@/domain/models/FrontNeighborhood.ts";

export class NeighborhoodFrontRepository {
    constructor(private apiService: ApiService) {
    }

    async getAcceptedNeighborhoods(): Promise<FrontNeighborhood[]> {
        return await this.apiService.get("/neighborhoods?status=accepted");
    }
}