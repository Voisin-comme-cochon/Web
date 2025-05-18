import apiService from "@/infrastructure/api/ApiService.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";
import {TicketModel} from "@/domain/models/ticket.model.ts";

export async function getTickets(status: string | null): Promise<PaginatedResultModel<TicketModel>> {
    const response = await apiService.get(`tickets?page=1&limit=1${status ? `&status=${status}` : ""}`)
    return await response.data;
}