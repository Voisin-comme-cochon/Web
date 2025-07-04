import { ItemRepository } from '@/infrastructure/repositories/ItemRepository';
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

export class ItemsUc {
    private itemRepository: ItemRepository;

    constructor(itemRepository: ItemRepository) {
        this.itemRepository = itemRepository;
    }

    async getItems(filters: GetItemsFilters): Promise<PaginatedResultModel<ItemModel>> {
        return await this.itemRepository.getItems(filters);
    }

    async getItemById(id: number): Promise<ItemModel> {
        return await this.itemRepository.getItemById(id);
    }

    async createItem(item: CreateItemRequest): Promise<ItemModel> {
        if (!item.name.trim()) {
            throw new Error('Le nom de l\'objet est requis');
        }
        if (!item.neighborhood_id) {
            throw new Error('L\'ID du quartier est requis');
        }
        return await this.itemRepository.createItem(item);
    }

    async updateItem(id: number, item: UpdateItemRequest): Promise<void> {
        if (item.name !== undefined && !item.name.trim()) {
            throw new Error('Le nom de l\'objet ne peut pas être vide');
        }
        return await this.itemRepository.updateItem(id, item);
    }

    async deleteItem(id: number): Promise<void> {
        return await this.itemRepository.deleteItem(id);
    }

    async getItemAvailabilities(itemId: number): Promise<ItemAvailabilityModel[]> {
        return await this.itemRepository.getItemAvailabilities(itemId);
    }

    async createItemAvailability(itemId: number, availability: CreateItemAvailabilityRequest): Promise<ItemAvailabilityModel> {
        if (availability.start_date >= availability.end_date) {
            throw new Error('La date de début doit être antérieure à la date de fin');
        }
        if (availability.start_date < new Date()) {
            throw new Error('La date de début ne peut pas être dans le passé');
        }
        return await this.itemRepository.createItemAvailability(itemId, availability);
    }

    async updateItemAvailability(availabilityId: number, availability: UpdateItemAvailabilityRequest): Promise<void> {
        if (availability.start_date && availability.end_date && availability.start_date >= availability.end_date) {
            throw new Error('La date de début doit être antérieure à la date de fin');
        }
        return await this.itemRepository.updateItemAvailability(availabilityId, availability);
    }

    async deleteItemAvailability(availabilityId: number): Promise<void> {
        return await this.itemRepository.deleteItemAvailability(availabilityId);
    }

    validateItemAccess(item: ItemModel, currentUserId: number): boolean {
        return item.owner_id === currentUserId;
    }

    canBorrowItem(item: ItemModel, currentUserId: number): { canBorrow: boolean; reason?: string } {
        if (item.owner_id === currentUserId) {
            return { canBorrow: false, reason: 'Vous ne pouvez pas emprunter votre propre objet' };
        }
        
        const hasAvailability = item.availabilities && item.availabilities.length > 0;
        if (!hasAvailability) {
            return { canBorrow: false, reason: 'Aucune disponibilité définie pour cet objet' };
        }

        return { canBorrow: true };
    }
}