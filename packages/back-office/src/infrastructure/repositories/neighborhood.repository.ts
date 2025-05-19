import apiService from "@/infrastructure/api/ApiService.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";

export async function getNeighborhoods(status: string | null, page: number, limit: number): Promise<PaginatedResultModel<NeighborhoodModel>> {
    const response = await apiService.get(`neighborhoods?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`);
    return await response.data;
}