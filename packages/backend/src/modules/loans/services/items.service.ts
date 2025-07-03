import { ItemsRepository } from '../domain/items.abstract.repository';
import { Item, ItemAvailability, CreateItemRequest, CreateItemAvailabilityRequest } from '../domain/item.model';
import { CochonError } from '../../../utils/CochonError';
import { NeighborhoodRepository } from '../../neighborhoods/domain/neighborhood.abstract.repository';
import { NeighborhoodUserRepository } from '../../neighborhoods/domain/neighborhood-user.abstract.repository';
import { isNull } from '../../../utils/tools';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';

export class ItemsService {
    constructor(
        private readonly itemsRepository: ItemsRepository,
        private readonly neighborhoodRepository: NeighborhoodRepository,
        private readonly neighborhoodUserRepository: NeighborhoodUserRepository,
        private readonly objectStorageService: ObjectStorageService
    ) {}

    async getItemsByNeighborhood(
        neighborhoodId: number,
        userId: number,
        page: number,
        limit: number
    ): Promise<[Item[], number]> {
        const neighborhoodExists = await this.neighborhoodRepository.getNeighborhoodById(neighborhoodId);
        if (isNull(neighborhoodExists)) {
            throw new CochonError('neighborhood_not_found', 'Quartier non trouvé', 404, {
                neighborhoodId,
            });
        }

        await this.validateUserInNeighborhood(userId, neighborhoodId);

        const offset = (page - 1) * limit;
        const [items, count] = await this.itemsRepository.getItemsByNeighborhood(neighborhoodId, limit, offset);
        return [
            await Promise.all(items.map(async (item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.category,
                image_url: item.image_url ? await this.objectStorageService.getFileLink(item.image_url, BucketType.ITEM_IMAGES) : undefined,
                owner_id: item.owner_id,
                neighborhood_id: item.neighborhood_id,
                created_at: item.created_at,
                availabilities: item.availabilities?.map((av) => ({
                    id: av.id,
                    item_id: av.item_id,
                    start_date: av.start_date,
                    end_date: av.end_date,
                    status: av.status,
                    created_at: av.created_at,
                })),
            }))),
            count,
        ];
    }

    async getItemById(id: number, userId: number): Promise<Item> {
        const item = await this.itemsRepository.getItemById(id);
        if (isNull(item)) {
            throw new CochonError('item_not_found', 'Item not found', 404);
        }

        await this.validateUserInNeighborhood(userId, item.neighborhood_id);

        return {
            ...item,
            image_url: item.image_url ? await this.objectStorageService.getFileLink(item.image_url, BucketType.ITEM_IMAGES) : undefined,
        };
    }

    async createItem(item: CreateItemRequest, ownerId: number, image?: Express.Multer.File): Promise<Item> {
        const neighborhoodExists = await this.neighborhoodRepository.getNeighborhoodById(item.neighborhood_id);
        if (isNull(neighborhoodExists)) {
            throw new CochonError('neighborhood_not_found', 'Quartier non trouvé', 404, {
                neighborhoodId: item.neighborhood_id,
            });
        }

        await this.validateUserInNeighborhood(ownerId, item.neighborhood_id);

        let imageFileName: string | undefined;
        if (image) {
            try {
                imageFileName = await this.objectStorageService.uploadFile(
                    image.buffer,
                    image.originalname,
                    BucketType.ITEM_IMAGES
                );
            } catch {
                throw new CochonError('image_upload_failed', 'Échec du téléchargement de l\'image', 500);
            }
        }

        const itemData = {
            ...item,
            image_url: imageFileName ?? item.image_url,
        };

        const createdItem = await this.itemsRepository.createItem(itemData, ownerId);
        return {
            id: createdItem.id,
            name: createdItem.name,
            description: createdItem.description,
            category: createdItem.category,
            image_url: createdItem.image_url ? await this.objectStorageService.getFileLink(createdItem.image_url, BucketType.ITEM_IMAGES) : undefined,
            owner_id: createdItem.owner_id,
            neighborhood_id: createdItem.neighborhood_id,
            created_at: createdItem.created_at,
        };
    }

    async updateItem(id: number, item: Partial<CreateItemRequest>, ownerId: number): Promise<void> {
        const existingItem = await this.itemsRepository.getItemById(id);
        if (isNull(existingItem)) {
            throw new CochonError('item_not_found', 'Item not found', 404);
        }

        if (existingItem.owner_id !== ownerId) {
            throw new CochonError('forbidden_update', 'You can only update your own items', 403);
        }

        await this.itemsRepository.updateItem(id, item);
    }

    async deleteItem(id: number, ownerId: number): Promise<void> {
        const existingItem = await this.itemsRepository.getItemById(id);
        if (isNull(existingItem)) {
            throw new CochonError('item_not_found', 'Item not found', 404);
        }

        if (existingItem.owner_id !== ownerId) {
            throw new CochonError('forbidden_delete', 'You can only delete your own items', 403);
        }

        await this.itemsRepository.deleteItem(id);
    }

    async getItemAvailabilities(itemId: number, userId: number): Promise<ItemAvailability[]> {
        const item = await this.itemsRepository.getItemById(itemId);
        if (isNull(item)) {
            throw new CochonError('item_not_found', 'Item not found', 404);
        }

        await this.validateUserInNeighborhood(userId, item.neighborhood_id);

        return this.itemsRepository.getItemAvailabilities(itemId);
    }

    async createItemAvailability(
        itemId: number,
        availability: Omit<CreateItemAvailabilityRequest, 'item_id'>,
        ownerId: number
    ): Promise<ItemAvailability> {
        const item = await this.itemsRepository.getItemById(itemId);
        if (isNull(item)) {
            throw new CochonError('item_not_found', 'Item not found', 404);
        }

        if (item.owner_id !== ownerId) {
            throw new CochonError('forbidden_availability', 'You can only manage availability for your own items', 403);
        }

        const startDate = new Date(availability.start_date);
        const endDate = new Date(availability.end_date);

        if (startDate >= endDate) {
            throw new CochonError('invalid_dates', 'Start date must be before end date', 400);
        }

        if (startDate < new Date()) {
            throw new CochonError('past_date', 'Start date cannot be in the past', 400);
        }

        const createdAvailability = await this.itemsRepository.createItemAvailability({
            item_id: itemId,
            start_date: startDate,
            end_date: endDate,
        });

        return {
            id: createdAvailability.id,
            item_id: createdAvailability.item_id,
            start_date: createdAvailability.start_date,
            end_date: createdAvailability.end_date,
            status: createdAvailability.status,
            created_at: createdAvailability.created_at,
        };
    }

    async updateItemAvailability(
        id: number,
        availability: Partial<CreateItemAvailabilityRequest>,
        ownerId: number
    ): Promise<void> {
        const currentAvailability = await this.itemsRepository.getAvailabilityById(id);

        if (isNull(currentAvailability)) {
            throw new CochonError('availability_not_found', 'Availability not found', 404);
        }

        const item = await this.itemsRepository.getItemById(currentAvailability.item_id);
        if (isNull(item) || item.owner_id !== ownerId) {
            throw new CochonError('forbidden_availability', 'You can only manage availability for your own items', 403);
        }

        if (availability.start_date && availability.end_date) {
            const startDate = new Date(availability.start_date);
            const endDate = new Date(availability.end_date);

            if (startDate >= endDate) {
                throw new CochonError('invalid_dates', 'Start date must be before end date', 400);
            }

            if (startDate < new Date()) {
                throw new CochonError('past_date', 'Start date cannot be in the past', 400);
            }
        }

        await this.itemsRepository.updateItemAvailability(id, availability);
    }

    async deleteItemAvailability(id: number, ownerId: number): Promise<void> {
        const existingAvailability = await this.itemsRepository.getAvailabilityById(id);

        if (isNull(existingAvailability)) {
            throw new CochonError('availability_not_found', 'Availability not found', 404);
        }

        const item = await this.itemsRepository.getItemById(existingAvailability.item_id);
        if (isNull(item) || item.owner_id !== ownerId) {
            throw new CochonError('forbidden_availability', 'You can only manage availability for your own items', 403);
        }

        await this.itemsRepository.deleteItemAvailability(id);
    }

    private async validateUserInNeighborhood(userId: number, neighborhoodId: number): Promise<void> {
        const isValid = await this.neighborhoodUserRepository.isUserMemberOfNeighborhood(userId, neighborhoodId);

        if (isNull(isValid)) {
            throw new CochonError('not_member_of_neighborhood', 'Vous devez être membre du quartier', 403, {
                userId,
                neighborhoodId,
            });
        }
    }
}
