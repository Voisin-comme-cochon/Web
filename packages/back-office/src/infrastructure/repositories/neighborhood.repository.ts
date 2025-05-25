import apiService from "@/infrastructure/api/ApiService.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {UserModel} from "@/domain/models/user.model.ts";

export async function getNeighborhoods(status: string | null, page: number, limit: number): Promise<PaginatedResultModel<NeighborhoodModel>> {
    const response = await apiService.get(`neighborhoods?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`);
    return await response.data;
}

export async function getNeighborhoodById(id: string | number): Promise<NeighborhoodModel> {
    const response = await apiService.get(`neighborhoods/${id}`);
    return await response.data;
}

export async function getUsersByNeighborhood(id: string | number, page: number, limit: number): Promise<PaginatedResultModel<UserModel>> {
    const response = await apiService.get(`neighborhoods/${id}/users?page=${page}&limit=${limit}`);
    return await response.data;
}