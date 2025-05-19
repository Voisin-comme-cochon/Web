import apiService from "@/infrastructure/api/ApiService.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";
import {UserModel} from "@/domain/models/user.model.ts";

export async function getUsers(page: number, limit: number): Promise<PaginatedResultModel<UserModel>> {
    const response = await apiService.get(`users?page=${page}&limit=${limit}`);
    return await response.data;
}