import ApiService from '@/infrastructure/api/ApiService.ts';
import { EventModel, EventModelWithUser } from '@/domain/models/event.model.ts';
import { PaginatedResultModel } from '@/domain/models/paginated-result.model.ts';
import { SelectedAddress } from '@/domain/models/SelectedAddress.ts';

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

    async createEvent(
        neighborhoodId: number,
        name: string,
        description: string,
        dateStart: Date,
        dateEnd: Date,
        min: number,
        max: number,
        tagId: number,
        addressStart: SelectedAddress,
        addressEnd: SelectedAddress | null,
        eventImage: File
    ): Promise<EventModel> {
        const formData = new FormData();
        formData.append('neighborhoodId', neighborhoodId.toString());
        formData.append('name', name);
        formData.append('description', description);
        formData.append('dateStart', dateStart.toISOString());
        formData.append('dateEnd', dateEnd.toISOString());
        formData.append('min', min.toString());
        formData.append('max', max.toString());
        formData.append('tagId', tagId.toString());
        if (addressStart) {
            formData.append(
                'addressStart',
                JSON.stringify({
                    type: 'Point',
                    coordinates: [addressStart.coordinates[0], addressStart.coordinates[1]],
                })
            );
        }
        if (addressEnd) {
            formData.append(
                'addressEnd',
                JSON.stringify({
                    type: 'Point',
                    coordinates: [addressEnd.coordinates[0], addressEnd.coordinates[1]],
                })
            );
        }
        formData.append('event-image', eventImage);

        const response = await ApiService.post('/events', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status !== 201) {
            throw new Error('Failed to create event');
        }

        return response.data;
    }

    async registerToEvent(eventId: number): Promise<void> {
        await ApiService.post(`/events/${eventId}/register`);
    }

    async unregisterFromEvent(eventId: number): Promise<void> {
        await ApiService.delete(`/events/${eventId}/register`);
    }

    async getEventsByUserId(): Promise<EventModel[]> {
        const response = await ApiService.get(`/events/registered`);
        return response.data;
    }

    async deleteEvent(eventId: number, reason: string): Promise<void> {
        await ApiService.delete(`/events/${eventId}`, {
            data: { reason },
        });
    }
}
