import { DataSource } from 'typeorm';
import { ItemEntity } from '../../../core/entities/item.entity';
import { ItemAvailabilityEntity } from '../../../core/entities/item-availability.entity';
import { ItemsRepository } from '../domain/items.abstract.repository';
import { Item, ItemAvailability, CreateItemRequest, CreateItemAvailabilityRequest } from '../domain/item.model';
import { ItemsAdapter } from '../adapters/items.adapter';

export class ItemsRepositoryImplementation implements ItemsRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getItemsByNeighborhood(
        neighborhoodId: number,
        limit: number,
        offset: number
    ): Promise<[ItemEntity[], number]> {
        return this.dataSource.getRepository(ItemEntity).findAndCount({
            where: { neighborhood_id: neighborhoodId },
            relations: ['owner', 'neighborhood', 'availabilities'],
            take: limit,
            skip: offset,
            order: { created_at: 'DESC' },
        });
    }

    async getItemById(id: number): Promise<Item | null> {
        const item = await this.dataSource.getRepository(ItemEntity).findOne({
            where: { id },
            relations: ['owner', 'neighborhood', 'availabilities'],
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
            order: { start_date: 'ASC' },
        });

        return availabilities.map((availability) => ItemsAdapter.availabilityEntityToDomain(availability));
    }

    async getAvailabilityById(id: number): Promise<ItemAvailability | null> {
        const availability = await this.dataSource.getRepository(ItemAvailabilityEntity).findOne({
            where: { id },
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
        const availability = await this.dataSource
            .getRepository(ItemAvailabilityEntity)
            .createQueryBuilder('availability')
            .where('availability.item_id = :itemId', { itemId })
            .andWhere('availability.status = :status', { status: 'available' })
            .andWhere('availability.start_date <= :startDate', { startDate })
            .andWhere('availability.end_date >= :endDate', { endDate })
            .getOne();

        return !!availability;
    }
}
