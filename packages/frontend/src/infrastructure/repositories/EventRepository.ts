import ApiService from '@/infrastructure/api/ApiService.ts';
import { EventModel, EventModelWithUser } from '@/domain/models/event.model.ts';
import { PaginatedResultModel } from '@/domain/models/paginated-result.model.ts';

export class EventRepository {
    async getNeighborhoodEvents(id: number, limit: number, page: number): Promise<EventModel[]> {
        const response = await ApiService.get(`/events/neighborhoods/${id}?limit=${limit}&page=${page}`);
        const paging: PaginatedResultModel<EventModel> = response.data;
        return paging.data;
    }

    async getEventById(id: number): Promise<EventModelWithUser> {
        const response = await ApiService.get(`/events/${id}`);
        return response.data;
    }

    async registerToEvent(eventId: number): Promise<void> {
        await ApiService.post(`/events/${eventId}/register`);
    }

    async unregisterFromEvent(eventId: number): Promise<void> {
        await ApiService.delete(`/events/${eventId}/register`);
    }
}
