import apiService from "@/infrastructure/api/ApiService.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";
import {SaleModel} from "@/domain/models/sale.model.ts";

export async function getSales(limit: number, page: number): Promise<PaginatedResultModel<SaleModel>> {
    const response = await apiService.get(`sales?page=${page}&limit=${limit}`);
    return await response.data;
}