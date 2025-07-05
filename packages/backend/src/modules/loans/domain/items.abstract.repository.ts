import { ItemEntity } from '../../../core/entities/item.entity';
import { ItemAvailabilityEntity, ItemAvailabilityStatus } from '../../../core/entities/item-availability.entity';
import { Item, ItemAvailability, CreateItemRequest, CreateItemAvailabilityRequest, ItemFilters } from './item.model';

export abstract class ItemsRepository {
    abstract getItemsByNeighborhood(
        neighborhoodId: number,
        limit: number,
        offset: number,
        filters?: ItemFilters
    ): Promise<[ItemEntity[], number]>;

    abstract getItemById(id: number): Promise<Item | null>;

    abstract createItem(item: CreateItemRequest, ownerId: number): Promise<ItemEntity>;

    abstract updateItem(id: number, item: Partial<CreateItemRequest>): Promise<void>;

    abstract deleteItem(id: number): Promise<void>;

    abstract getItemAvailabilities(itemId: number): Promise<ItemAvailability[]>;

    abstract getAvailabilityById(id: number): Promise<ItemAvailability | null>;

    abstract createItemAvailability(availability: CreateItemAvailabilityRequest): Promise<ItemAvailabilityEntity>;

    abstract updateItemAvailability(id: number, availability: Partial<CreateItemAvailabilityRequest>): Promise<void>;

    abstract deleteItemAvailability(id: number): Promise<void>;

    abstract checkItemAvailability(itemId: number, startDate: Date, endDate: Date): Promise<boolean>;
}
