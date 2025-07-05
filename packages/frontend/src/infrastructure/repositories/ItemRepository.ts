import ApiService from '@/infrastructure/api/ApiService';
import { 
    ItemModel, 
    ItemAvailabilityModel, 
    CreateItemRequest, 
    UpdateItemRequest, 
    CreateItemAvailabilityRequest, 
    UpdateItemAvailabilityRequest,
    GetItemsFilters 
} from '@/domain/models/item.model';
import { PaginatedResultModel } from '@/domain/models/paginated-result.model';

export class ItemRepository {
    async getItems(filters: GetItemsFilters): Promise<PaginatedResultModel<ItemModel>> {
        const params = new URLSearchParams();
        params.append('neighborhoodId', filters.neighborhoodId.toString());
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await ApiService.get(`/items?${params.toString()}`);
        return {
            data: response.data.data.map(this.mapItem),
            total: response.data.metadata?.totalCount || 0,
            page: response.data.metadata?.page || 1,
            limit: response.data.metadata?.limit || 10,
            totalPages: response.data.metadata?.totalPages || 0
        };
    }

    async getItemById(id: number): Promise<ItemModel> {
        const response = await ApiService.get(`/items/${id}`);
        return this.mapItem(response.data);
    }

    async createItem(item: CreateItemRequest): Promise<ItemModel> {
        const formData = new FormData();
        formData.append('name', item.name);
        formData.append('neighborhood_id', item.neighborhood_id.toString());
        if (item.description) formData.append('description', item.description);
        if (item.category) formData.append('category', item.category);
        if (item.image) formData.append('image', item.image);

        const response = await ApiService.post('/items', formData);
        return this.mapItem(response.data);
    }

    async updateItem(id: number, item: UpdateItemRequest): Promise<void> {
        console.log('Update item data:', item);

        // S'il y a une image, utiliser FormData (même approche que pour la création)
        if (item.image) {
            const formData = new FormData();
            if (item.name !== undefined) formData.append('name', item.name);
            if (item.description !== undefined) formData.append('description', item.description || '');
            if (item.category !== undefined) formData.append('category', item.category || '');
            formData.append('image', item.image);

            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
                if (value instanceof File) {
                    console.log(`File details - name: ${value.name}, size: ${value.size}, type: ${value.type}`);
                }
            }

            await ApiService.put(`/items/${id}`, formData);
        } else {
            // Sinon, utiliser JSON
            const updateData: any = {};
            if (item.name !== undefined) updateData.name = item.name;
            if (item.description !== undefined) updateData.description = item.description;
            if (item.category !== undefined) updateData.category = item.category;

            console.log('JSON update data:', updateData);

            // Vérifier qu'il y a au moins un champ à mettre à jour
            if (Object.keys(updateData).length === 0) {
                throw new Error('Aucune modification détectée');
            }

            await ApiService.put(`/items/${id}`, updateData);
        }
    }

    async deleteItem(id: number): Promise<void> {
        await ApiService.delete(`/items/${id}`);
    }

    async getItemAvailabilities(itemId: number): Promise<ItemAvailabilityModel[]> {
        const response = await ApiService.get(`/items/${itemId}/availabilities`);
        return response.data.map(this.mapItemAvailability);
    }

    async createItemAvailability(itemId: number, availability: CreateItemAvailabilityRequest): Promise<ItemAvailabilityModel> {
        const response = await ApiService.post(`/items/${itemId}/availabilities`, {
            start_date: availability.start_date.toISOString(),
            end_date: availability.end_date.toISOString()
        });
        return this.mapItemAvailability(response.data);
    }

    async updateItemAvailability(availabilityId: number, availability: UpdateItemAvailabilityRequest): Promise<void> {
        const data: any = {};
        if (availability.start_date) data.start_date = availability.start_date.toISOString();
        if (availability.end_date) data.end_date = availability.end_date.toISOString();
        if (availability.status) data.status = availability.status;

        await ApiService.put(`/items/availabilities/${availabilityId}`, data);
    }

    async deleteItemAvailability(availabilityId: number): Promise<void> {
        await ApiService.delete(`/items/availabilities/${availabilityId}`);
    }

    private mapItem = (data: any): ItemModel => {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            category: data.category,
            image_url: data.image_url,
            owner_id: data.owner_id,
            neighborhood_id: data.neighborhood_id,
            created_at: new Date(data.created_at),
            availabilities: data.availabilities?.map(this.mapItemAvailability),
            owner: data.owner ? {
                id: data.owner.id,
                firstName: data.owner.firstName,
                lastName: data.owner.lastName,
                profileImageUrl: data.owner.profileImageUrl
            } : undefined
        };
    }

    private mapItemAvailability = (data: any): ItemAvailabilityModel => {
        return {
            id: data.id,
            item_id: data.item_id,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
            status: data.status,
            created_at: new Date(data.created_at)
        };
    }
}