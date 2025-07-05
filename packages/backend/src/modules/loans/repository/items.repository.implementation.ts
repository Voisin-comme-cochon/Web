import { DataSource } from 'typeorm';
import { ItemEntity } from '../../../core/entities/item.entity';
import { ItemAvailabilityEntity } from '../../../core/entities/item-availability.entity';
import { ItemAvailabilitySlotEntity } from '../../../core/entities/item-availability-slot.entity';
import { ItemsRepository } from '../domain/items.abstract.repository';
import {
    Item,
    ItemAvailability,
    CreateItemRequest,
    CreateItemAvailabilityRequest,
    ItemFilters,
} from '../domain/item.model';
import { ItemsAdapter } from '../adapters/items.adapter';

export class ItemsRepositoryImplementation implements ItemsRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getItemsByNeighborhood(
        neighborhoodId: number,
        limit: number,
        offset: number,
        filters?: ItemFilters
    ): Promise<[ItemEntity[], number]> {
        const queryBuilder = this.dataSource
            .getRepository(ItemEntity)
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.owner', 'owner')
            .leftJoinAndSelect('item.neighborhood', 'neighborhood')
            .leftJoinAndSelect('item.availabilities', 'availabilities')
            .leftJoinAndSelect('availabilities.slots', 'slots')
            .where('item.neighborhood_id = :neighborhoodId', { neighborhoodId })
            .orderBy('item.created_at', 'DESC')
            .take(limit)
            .skip(offset);

        // Apply filters if provided
        if (filters?.search) {
            queryBuilder.andWhere(
                '(LOWER(item.name) LIKE LOWER(:search) OR LOWER(item.description) LIKE LOWER(:search))',
                { search: `%${filters.search}%` }
            );
        }

        if (filters?.category) {
            queryBuilder.andWhere('LOWER(item.category) = LOWER(:category)', { category: filters.category });
        }

        if (filters?.status) {
            queryBuilder.andWhere(
                'EXISTS (SELECT 1 FROM item_availabilities ia WHERE ia.item_id = item.id AND ia.status = :status)',
                { status: filters.status }
            );
        }

        return queryBuilder.getManyAndCount();
    }

    async getItemById(id: number): Promise<Item | null> {
        const item = await this.dataSource.getRepository(ItemEntity).findOne({
            where: { id },
            relations: ['owner', 'neighborhood', 'availabilities', 'availabilities.slots'],
        });

        if (!item) {
            return null;
        }

        return ItemsAdapter.entityToDomain(item);
    }

    async createItem(item: CreateItemRequest, ownerId: number): Promise<ItemEntity> {
        const itemEntity = this.dataSource.getRepository(ItemEntity).create({
            ...item,
            owner_id: ownerId,
        });

        return this.dataSource.getRepository(ItemEntity).save(itemEntity);
    }

    async updateItem(id: number, item: Partial<CreateItemRequest>): Promise<void> {
        await this.dataSource.getRepository(ItemEntity).update(id, item);
    }

    async deleteItem(id: number): Promise<void> {
        await this.dataSource.getRepository(ItemEntity).delete(id);
    }

    async getItemAvailabilities(itemId: number): Promise<ItemAvailability[]> {
        const availabilities = await this.dataSource.getRepository(ItemAvailabilityEntity).find({
            where: { item_id: itemId },
            relations: ['slots'],
            order: { start_date: 'ASC' },
        });

        return availabilities.map((availability) => ItemsAdapter.availabilityEntityToDomain(availability));
    }

    async getAvailabilityById(id: number): Promise<ItemAvailability | null> {
        const availability = await this.dataSource.getRepository(ItemAvailabilityEntity).findOne({
            where: { id },
            relations: ['slots'],
        });

        if (!availability) {
            return null;
        }

        return ItemsAdapter.availabilityEntityToDomain(availability);
    }

    async createItemAvailability(availability: CreateItemAvailabilityRequest): Promise<ItemAvailabilityEntity> {
        const availabilityEntity = this.dataSource.getRepository(ItemAvailabilityEntity).create(availability);
        return this.dataSource.getRepository(ItemAvailabilityEntity).save(availabilityEntity);
    }

    async updateItemAvailability(id: number, availability: Partial<CreateItemAvailabilityRequest>): Promise<void> {
        await this.dataSource.getRepository(ItemAvailabilityEntity).update(id, availability);
    }

    async deleteItemAvailability(id: number): Promise<void> {
        await this.dataSource.getRepository(ItemAvailabilityEntity).delete(id);
    }

    async checkItemAvailability(itemId: number, startDate: Date, endDate: Date): Promise<boolean> {
        // First, check if there's an availability period that covers the requested dates
        const availability = await this.dataSource
            .getRepository(ItemAvailabilityEntity)
            .createQueryBuilder('availability')
            .where('availability.item_id = :itemId', { itemId })
            .andWhere('availability.status != :unavailableStatus', { unavailableStatus: 'unavailable' })
            .andWhere('availability.start_date <= :startDate', { startDate })
            .andWhere('availability.end_date >= :endDate', { endDate })
            .getOne();

        if (!availability) {
            return false;
        }

        // Then, check if there are any conflicting slots within that availability period
        const conflictingSlot = await this.dataSource
            .getRepository(ItemAvailabilitySlotEntity)
            .createQueryBuilder('slot')
            .where('slot.availability_id = :availabilityId', { availabilityId: availability.id })
            .andWhere('slot.status IN (:...conflictingStatuses)', { 
                conflictingStatuses: ['reserved', 'occupied'] 
            })
            .andWhere('(slot.start_date < :endDate AND slot.end_date > :startDate)', {
                startDate,
                endDate,
            })
            .getOne();

        return !conflictingSlot;
    }
}
