import apiService from "@/infrastructure/api/ApiService.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";
import {EventModel} from "@/domain/models/event.model.ts";

export async function getEvents(page: number, limit: number): Promise<PaginatedResultModel<EventModel>> {
    const response = await apiService.get(`events?page=${page}&limit=${limit}`);
    return await response.data;
}